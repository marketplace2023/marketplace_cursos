import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  marketplace_quiz, marketplace_quiz_question, marketplace_quiz_attempt,
  marketplace_enrollment, product_template, marketplace_store,
} from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { unauthorized, forbidden, badRequest, serverError, ok, created } from '@/lib/api/response'

const createSchema = z.object({
  course_id: z.number().int().positive(),
  lesson_id: z.number().int().positive().optional(),
  title: z.string().min(2).max(300),
  description: z.string().optional(),
  pass_score: z.number().int().min(1).max(100).default(70),
  time_limit: z.number().int().positive().optional(),
  max_attempts: z.number().int().min(1).max(10).default(3),
  shuffle_questions: z.boolean().default(true),
  show_results: z.boolean().default(true),
  questions: z.array(z.object({
    question: z.string().min(1),
    question_type: z.enum(['single', 'multiple', 'true_false', 'short']).default('single'),
    options: z.array(z.object({ text: z.string(), is_correct: z.boolean() })).optional(),
    explanation: z.string().optional(),
    points: z.number().int().min(1).default(1),
    sort_order: z.number().int().default(0),
  })).optional(),
})

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const url = new URL(req.url)
    const courseId = url.searchParams.get('course_id')
    const userId = Number(session.sub)

    if (['store_owner', 'admin', 'superadmin', 'instructor'].includes(session.role)) {
      /* Store/instructor: get quizzes for their courses */
      const conditions = courseId
        ? [eq(marketplace_quiz.course_id, Number(courseId))]
        : []

      const quizzes = await db
        .select({
          id: marketplace_quiz.id,
          course_id: marketplace_quiz.course_id,
          course_name: product_template.name,
          title: marketplace_quiz.title,
          pass_score: marketplace_quiz.pass_score,
          time_limit: marketplace_quiz.time_limit,
          max_attempts: marketplace_quiz.max_attempts,
          active: marketplace_quiz.active,
          created_at: marketplace_quiz.created_at,
        })
        .from(marketplace_quiz)
        .leftJoin(product_template, eq(product_template.id, marketplace_quiz.course_id))
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(marketplace_quiz.created_at))

      return ok(quizzes)
    }

    /* Student: get quizzes for enrolled courses with attempt status */
    const enrollments = await db
      .select({ course_id: marketplace_enrollment.course_id })
      .from(marketplace_enrollment)
      .where(and(eq(marketplace_enrollment.user_id, userId), eq(marketplace_enrollment.state, 'active')))

    const courseIds = enrollments.map(e => e.course_id)
    if (courseIds.length === 0) return ok([])

    const condition = courseId
      ? and(eq(marketplace_quiz.course_id, Number(courseId)), eq(marketplace_quiz.active, true))
      : eq(marketplace_quiz.active, true)

    const quizzes = await db
      .select({
        id: marketplace_quiz.id,
        course_id: marketplace_quiz.course_id,
        course_name: product_template.name,
        title: marketplace_quiz.title,
        pass_score: marketplace_quiz.pass_score,
        time_limit: marketplace_quiz.time_limit,
        max_attempts: marketplace_quiz.max_attempts,
      })
      .from(marketplace_quiz)
      .leftJoin(product_template, eq(product_template.id, marketplace_quiz.course_id))
      .where(condition)

    const filteredQuizzes = quizzes.filter(q => courseIds.includes(q.course_id))

    /* Attach best attempt for each quiz */
    const withAttempts = await Promise.all(
      filteredQuizzes.map(async (quiz) => {
        const attempts = await db
          .select({ score: marketplace_quiz_attempt.score, passed: marketplace_quiz_attempt.passed, submitted_at: marketplace_quiz_attempt.submitted_at })
          .from(marketplace_quiz_attempt)
          .where(and(eq(marketplace_quiz_attempt.quiz_id, quiz.id), eq(marketplace_quiz_attempt.user_id, userId)))
          .orderBy(desc(marketplace_quiz_attempt.score))
          .limit(quiz.max_attempts)

        const best = attempts[0] ?? null
        return { ...quiz, attempts_used: attempts.length, best_score: best?.score ?? null, passed: best?.passed ?? false }
      })
    )

    return ok(withAttempts)
  } catch {
    return serverError()
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['store_owner', 'admin', 'superadmin', 'instructor'].includes(session.role)) return forbidden()

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return badRequest('Datos inválidos', parsed.error.issues)

    const { questions, ...quizData } = parsed.data

    const [quiz] = await db.insert(marketplace_quiz).values({
      course_id: quizData.course_id,
      lesson_id: quizData.lesson_id ?? null,
      title: quizData.title,
      description: quizData.description ?? null,
      pass_score: quizData.pass_score,
      time_limit: quizData.time_limit ?? null,
      max_attempts: quizData.max_attempts,
      shuffle_questions: quizData.shuffle_questions,
      show_results: quizData.show_results,
    }).returning()

    if (questions && questions.length > 0) {
      await db.insert(marketplace_quiz_question).values(
        questions.map(q => ({
          quiz_id: quiz.id,
          question: q.question,
          question_type: q.question_type,
          options: q.options ? JSON.stringify(q.options) : null,
          explanation: q.explanation ?? null,
          points: q.points,
          sort_order: q.sort_order,
        }))
      )
    }

    return created(quiz)
  } catch {
    return serverError()
  }
}
