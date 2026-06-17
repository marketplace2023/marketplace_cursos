import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { marketplace_quiz, marketplace_quiz_question, marketplace_quiz_attempt, marketplace_enrollment } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { unauthorized, forbidden, notFound, serverError, ok } from '@/lib/api/response'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    /* Students must be enrolled */
    if (!['store_owner', 'instructor', 'admin', 'superadmin'].includes(session.role)) {
      const [enrollment] = await db
        .select({ id: marketplace_enrollment.id })
        .from(marketplace_enrollment)
        .where(and(
          eq(marketplace_enrollment.user_id, userId),
          eq(marketplace_enrollment.course_id, quiz.course_id),
          eq(marketplace_enrollment.state, 'active'),
        ))
        .limit(1)
      if (!enrollment) return forbidden('No estás inscrito en este curso')
    }

    const questions = await db
      .select({
        id: marketplace_quiz_question.id,
        question: marketplace_quiz_question.question,
        question_type: marketplace_quiz_question.question_type,
        options: marketplace_quiz_question.options,
        points: marketplace_quiz_question.points,
        sort_order: marketplace_quiz_question.sort_order,
        /* Only include explanation and correct answers for owners/admins */
        ...((['store_owner', 'instructor', 'admin', 'superadmin'].includes(session.role))
          ? { explanation: marketplace_quiz_question.explanation }
          : {}
        ),
      })
      .from(marketplace_quiz_question)
      .where(eq(marketplace_quiz_question.quiz_id, Number(id)))
      .orderBy(marketplace_quiz_question.sort_order)

    /* Strip correct answer flags from options for students */
    const sanitizedQuestions = questions.map(q => {
      if (['store_owner', 'instructor', 'admin', 'superadmin'].includes(session.role)) {
        return { ...q, options: q.options ? JSON.parse(q.options) : null }
      }
      const opts = q.options ? JSON.parse(q.options) as { text: string; is_correct: boolean }[] : null
      return {
        ...q,
        options: opts?.map(o => ({ text: o.text })) ?? null,
      }
    })

    /* Student attempt count */
    const attempts = await db
      .select({ score: marketplace_quiz_attempt.score, passed: marketplace_quiz_attempt.passed, submitted_at: marketplace_quiz_attempt.submitted_at })
      .from(marketplace_quiz_attempt)
      .where(and(
        eq(marketplace_quiz_attempt.quiz_id, Number(id)),
        eq(marketplace_quiz_attempt.user_id, userId),
      ))
      .orderBy(marketplace_quiz_attempt.score)

    const bestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null

    return ok({
      ...quiz,
      questions: quiz.shuffle_questions && !['store_owner', 'instructor', 'admin', 'superadmin'].includes(session.role)
        ? sanitizedQuestions.sort(() => Math.random() - 0.5)
        : sanitizedQuestions,
      attempts_used: attempts.length,
      attempts_left: quiz.max_attempts - attempts.length,
      best_score: bestAttempt?.score ?? null,
      passed: bestAttempt?.passed ?? false,
    })
  } catch {
    return serverError()
  }
}
