import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  marketplace_quiz, marketplace_quiz_question, marketplace_quiz_attempt,
  marketplace_enrollment,
} from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { unauthorized, forbidden, notFound, badRequest, serverError, ok, created } from '@/lib/api/response'

const schema = z.object({
  answers: z.array(z.object({
    question_id: z.number().int().positive(),
    answer: z.union([z.string(), z.array(z.string())]),
  })),
  time_spent: z.number().int().optional(),
})

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await params
    const userId = Number(session.sub)

    const [quiz] = await db
      .select()
      .from(marketplace_quiz)
      .where(eq(marketplace_quiz.id, Number(id)))
      .limit(1)

    if (!quiz) return notFound('Quiz no encontrado')

    /* Verify enrollment */
    const [enrollment] = await db
      .select({ id: marketplace_enrollment.id })
      .from(marketplace_enrollment)
      .where(and(
        eq(marketplace_enrollment.user_id, userId),
        eq(marketplace_enrollment.course_id, quiz.course_id),
        eq(marketplace_enrollment.state, 'active'),
      ))
      .limit(1)

    if (!enrollment && !['admin', 'superadmin'].includes(session.role)) {
      return forbidden('No estás inscrito en este curso')
    }

    /* Check attempt limit */
    const previousAttempts = await db
      .select({ id: marketplace_quiz_attempt.id })
      .from(marketplace_quiz_attempt)
      .where(and(
        eq(marketplace_quiz_attempt.quiz_id, Number(id)),
        eq(marketplace_quiz_attempt.user_id, userId),
      ))

    if (previousAttempts.length >= quiz.max_attempts) {
      return badRequest(`Has alcanzado el límite de ${quiz.max_attempts} intentos`)
    }

    /* Check if already passed */
    const alreadyPassed = await db
      .select({ id: marketplace_quiz_attempt.id })
      .from(marketplace_quiz_attempt)
      .where(and(
        eq(marketplace_quiz_attempt.quiz_id, Number(id)),
        eq(marketplace_quiz_attempt.user_id, userId),
        eq(marketplace_quiz_attempt.passed, true),
      ))

    if (alreadyPassed.length > 0) {
      return badRequest('Ya aprobaste este quiz')
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest('Datos inválidos', parsed.error.issues)

    /* Load questions with correct answers */
    const questions = await db
      .select()
      .from(marketplace_quiz_question)
      .where(eq(marketplace_quiz_question.quiz_id, Number(id)))

    /* Grade answers */
    let totalPoints = 0
    let earnedPoints = 0
    const results: { question_id: number; correct: boolean; points: number; explanation?: string }[] = []

    for (const question of questions) {
      totalPoints += question.points
      const opts = question.options ? JSON.parse(question.options) as { text: string; is_correct: boolean }[] : []
      const userAnswer = parsed.data.answers.find(a => a.question_id === question.id)
      const givenAnswers = userAnswer
        ? (Array.isArray(userAnswer.answer) ? userAnswer.answer : [userAnswer.answer])
        : []

      let correct = false

      if (question.question_type === 'single' || question.question_type === 'true_false') {
        const correctOption = opts.find(o => o.is_correct)
        correct = !!correctOption && givenAnswers.includes(correctOption.text)
      } else if (question.question_type === 'multiple') {
        const correctOptions = opts.filter(o => o.is_correct).map(o => o.text)
        correct = correctOptions.length === givenAnswers.length &&
          correctOptions.every(c => givenAnswers.includes(c))
      } else if (question.question_type === 'short') {
        /* Short answer: accept any non-empty answer as correct (manual review not implemented) */
        correct = givenAnswers.some(a => a.trim().length > 0)
      }

      if (correct) earnedPoints += question.points
      results.push({
        question_id: question.id,
        correct,
        points: question.points,
        explanation: question.explanation ?? undefined,
      })
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    const passed = score >= quiz.pass_score

    const [attempt] = await db.insert(marketplace_quiz_attempt).values({
      quiz_id: Number(id),
      user_id: userId,
      enrollment_id: enrollment?.id ?? null,
      score,
      passed,
      answers: JSON.stringify(parsed.data.answers),
      started_at: new Date(),
      submitted_at: new Date(),
      time_spent: parsed.data.time_spent ?? null,
    }).returning()

    return created({
      attempt_id: attempt.id,
      score,
      passed,
      pass_score: quiz.pass_score,
      earned_points: earnedPoints,
      total_points: totalPoints,
      show_results: quiz.show_results,
      results: quiz.show_results ? results : [],
      attempts_left: quiz.max_attempts - previousAttempts.length - 1,
    }, passed ? '¡Felicitaciones! Aprobaste el quiz.' : 'No alcanzaste el puntaje mínimo.')
  } catch {
    return serverError()
  }
}
