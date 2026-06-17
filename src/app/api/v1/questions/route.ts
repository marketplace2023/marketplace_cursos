import { z } from 'zod'
import { eq, and, desc, sql, ilike } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  marketplace_question, marketplace_question_reply,
  marketplace_enrollment, product_template, res_users,
} from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { unauthorized, badRequest, forbidden, serverError, ok, created, pageMeta } from '@/lib/api/response'

const createSchema = z.object({
  course_id: z.number().int().positive(),
  lesson_id: z.number().int().positive().optional(),
  title: z.string().min(5).max(300),
  body: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('course_id')
    const q = searchParams.get('q') ?? ''
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? '20')))
    const offset = (page - 1) * limit
    const userId = Number(session.sub)
    const isStaff = ['store_owner', 'instructor', 'admin', 'superadmin'].includes(session.role)

    const conditions: any[] = []
    if (courseId) conditions.push(eq(marketplace_question.course_id, Number(courseId)))
    if (q) conditions.push(ilike(marketplace_question.title, `%${q}%`))

    /* Non-staff: only see questions for courses they're enrolled in */
    if (!isStaff && courseId) {
      const [enrollment] = await db
        .select({ id: marketplace_enrollment.id })
        .from(marketplace_enrollment)
        .where(and(
          eq(marketplace_enrollment.user_id, userId),
          eq(marketplace_enrollment.course_id, Number(courseId)),
          eq(marketplace_enrollment.state, 'active'),
        ))
        .limit(1)
      if (!enrollment) return forbidden('No estás inscrito en este curso')
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(marketplace_question)
      .where(where)

    const questions = await db
      .select({
        id: marketplace_question.id,
        title: marketplace_question.title,
        body: marketplace_question.body,
        course_id: marketplace_question.course_id,
        lesson_id: marketplace_question.lesson_id,
        is_answered: marketplace_question.is_answered,
        upvotes: marketplace_question.upvotes,
        created_at: marketplace_question.created_at,
        user_id: marketplace_question.user_id,
        user_name: res_users.name,
        user_avatar: res_users.avatar_url,
        course_name: product_template.name,
      })
      .from(marketplace_question)
      .leftJoin(res_users, eq(res_users.id, marketplace_question.user_id))
      .leftJoin(product_template, eq(product_template.id, marketplace_question.course_id))
      .where(where)
      .orderBy(desc(marketplace_question.created_at))
      .limit(limit)
      .offset(offset)

    /* Reply count per question */
    const questionIds = questions.map(q => q.id)
    let replyCounts: { question_id: number; count: number }[] = []
    if (questionIds.length > 0) {
      replyCounts = await db
        .select({
          question_id: marketplace_question_reply.question_id,
          count: sql<number>`count(*)::int`,
        })
        .from(marketplace_question_reply)
        .where(sql`${marketplace_question_reply.question_id} = ANY(ARRAY[${sql.raw(questionIds.join(','))}])`)
        .groupBy(marketplace_question_reply.question_id)
    }
    const replyMap = new Map(replyCounts.map(r => [r.question_id, r.count]))

    return ok(
      questions.map(q => ({ ...q, reply_count: replyMap.get(q.id) ?? 0 })),
      'OK',
      pageMeta(total, page, limit),
    )
  } catch {
    return serverError()
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return badRequest('Datos inválidos', parsed.error.issues)

    const userId = Number(session.sub)
    const { course_id, lesson_id, title, body: questionBody } = parsed.data

    /* Verify enrollment (students must be enrolled) */
    const isStaff = ['store_owner', 'instructor', 'admin', 'superadmin'].includes(session.role)
    if (!isStaff) {
      const [enrollment] = await db
        .select({ id: marketplace_enrollment.id })
        .from(marketplace_enrollment)
        .where(and(
          eq(marketplace_enrollment.user_id, userId),
          eq(marketplace_enrollment.course_id, course_id),
          eq(marketplace_enrollment.state, 'active'),
        ))
        .limit(1)
      if (!enrollment) return forbidden('No estás inscrito en este curso')
    }

    const [question] = await db.insert(marketplace_question).values({
      course_id,
      lesson_id: lesson_id ?? null,
      user_id: userId,
      title,
      body: questionBody ?? null,
    }).returning()

    return created(question, 'Pregunta publicada')
  } catch {
    return serverError()
  }
}
