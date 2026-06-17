import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  marketplace_question, marketplace_question_reply, res_users,
} from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { unauthorized, forbidden, notFound, badRequest, serverError, ok, created, noContent } from '@/lib/api/response'

const replySchema = z.object({
  body: z.string().min(1).max(5000),
})

/* GET /api/v1/questions/[id] — question detail + replies */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await params

    const [question] = await db
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
      })
      .from(marketplace_question)
      .leftJoin(res_users, eq(res_users.id, marketplace_question.user_id))
      .where(eq(marketplace_question.id, Number(id)))
      .limit(1)

    if (!question) return notFound('Pregunta no encontrada')

    const replies = await db
      .select({
        id: marketplace_question_reply.id,
        body: marketplace_question_reply.body,
        is_instructor_reply: marketplace_question_reply.is_instructor_reply,
        is_accepted: marketplace_question_reply.is_accepted,
        upvotes: marketplace_question_reply.upvotes,
        created_at: marketplace_question_reply.created_at,
        user_id: marketplace_question_reply.user_id,
        user_name: res_users.name,
        user_avatar: res_users.avatar_url,
      })
      .from(marketplace_question_reply)
      .leftJoin(res_users, eq(res_users.id, marketplace_question_reply.user_id))
      .where(eq(marketplace_question_reply.question_id, Number(id)))
      .orderBy(marketplace_question_reply.created_at)

    return ok({ ...question, replies })
  } catch {
    return serverError()
  }
}

/* POST /api/v1/questions/[id] — add reply */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await params
    const body = await req.json()
    const parsed = replySchema.safeParse(body)
    if (!parsed.success) return badRequest('Datos inválidos', parsed.error.issues)

    const [question] = await db
      .select({ id: marketplace_question.id })
      .from(marketplace_question)
      .where(eq(marketplace_question.id, Number(id)))
      .limit(1)
    if (!question) return notFound('Pregunta no encontrada')

    const userId = Number(session.sub)
    const isInstructor = ['instructor', 'store_owner', 'admin', 'superadmin'].includes(session.role)

    const [reply] = await db.insert(marketplace_question_reply).values({
      question_id: Number(id),
      user_id: userId,
      body: parsed.data.body,
      is_instructor_reply: isInstructor,
    }).returning()

    /* Mark question as answered if instructor replied */
    if (isInstructor) {
      await db
        .update(marketplace_question)
        .set({ is_answered: true })
        .where(eq(marketplace_question.id, Number(id)))
    }

    return created(reply, 'Respuesta publicada')
  } catch {
    return serverError()
  }
}

/* DELETE /api/v1/questions/[id] — delete own question */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await params
    const userId = Number(session.sub)
    const isAdmin = ['admin', 'superadmin'].includes(session.role)

    const [question] = await db
      .select({ id: marketplace_question.id, user_id: marketplace_question.user_id })
      .from(marketplace_question)
      .where(eq(marketplace_question.id, Number(id)))
      .limit(1)
    if (!question) return notFound('Pregunta no encontrada')

    if (!isAdmin && question.user_id !== userId) {
      return forbidden('No puedes eliminar esta pregunta')
    }

    await db.delete(marketplace_question).where(eq(marketplace_question.id, Number(id)))
    return noContent()
  } catch {
    return serverError()
  }
}
