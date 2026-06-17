import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { mail_thread, mail_thread_participant, mail_message, res_users } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { ok, created, unauthorized, forbidden, notFound, badRequest, serverError } from '@/lib/api/response'

async function checkAccess(threadId: number, userId: number) {
  const [part] = await db.select({ id: mail_thread_participant.id })
    .from(mail_thread_participant)
    .where(and(eq(mail_thread_participant.thread_id, threadId), eq(mail_thread_participant.user_id, userId)))
    .limit(1)
  return !!part
}

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await props.params
    const [thread] = await db.select().from(mail_thread).where(eq(mail_thread.id, Number(id))).limit(1)
    if (!thread) return notFound('Conversación no encontrada')

    const hasAccess = await checkAccess(Number(id), Number(session.sub))
    if (!hasAccess) return forbidden()

    const messages = await db
      .select({
        id: mail_message.id,
        body: mail_message.body,
        attachment_url: mail_message.attachment_url,
        created_at: mail_message.created_at,
        sender_id: mail_message.sender_id,
        sender_name: res_users.name,
        sender_avatar: res_users.avatar_url,
      })
      .from(mail_message)
      .innerJoin(res_users, eq(mail_message.sender_id, res_users.id))
      .where(and(eq(mail_message.thread_id, Number(id)), eq(mail_message.deleted, false)))
      .orderBy(asc(mail_message.created_at))

    await db.update(mail_thread_participant)
      .set({ last_read_at: new Date() })
      .where(and(eq(mail_thread_participant.thread_id, Number(id)), eq(mail_thread_participant.user_id, Number(session.sub))))

    return ok({ thread, messages })
  } catch {
    return serverError()
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await props.params
    const [thread] = await db.select({ id: mail_thread.id, is_blocked: mail_thread.is_blocked })
      .from(mail_thread).where(eq(mail_thread.id, Number(id))).limit(1)

    if (!thread) return notFound('Conversación no encontrada')
    if (thread.is_blocked) return forbidden('La conversación está bloqueada')

    const hasAccess = await checkAccess(Number(id), Number(session.sub))
    if (!hasAccess) return forbidden()

    const body = await req.json()
    if (!body.message?.trim()) return badRequest('El mensaje es requerido')

    const [msg] = await db.insert(mail_message).values({
      thread_id: Number(id),
      sender_id: Number(session.sub),
      body: body.message.trim(),
      attachment_url: body.attachment_url ?? null,
    }).returning()

    await db.update(mail_thread).set({ updated_at: new Date() }).where(eq(mail_thread.id, Number(id)))

    return created(msg)
  } catch {
    return serverError()
  }
}
