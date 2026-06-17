import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { mail_thread, mail_thread_participant, mail_message, res_users } from '@/lib/db/schema'
import { eq, desc, and, inArray } from 'drizzle-orm'
import { ok, created, unauthorized, badRequest, serverError } from '@/lib/api/response'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const participations = await db
      .select({ thread_id: mail_thread_participant.thread_id, last_read_at: mail_thread_participant.last_read_at })
      .from(mail_thread_participant)
      .where(eq(mail_thread_participant.user_id, Number(session.sub)))

    if (participations.length === 0) return ok([])

    const threadIds = participations.map(p => p.thread_id)
    const threads = await db
      .select({
        id: mail_thread.id,
        subject: mail_thread.subject,
        context_type: mail_thread.context_type,
        updated_at: mail_thread.updated_at,
      })
      .from(mail_thread)
      .where(inArray(mail_thread.id, threadIds))
      .orderBy(desc(mail_thread.updated_at))

    return ok(threads)
  } catch {
    return serverError()
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await req.json()
    const { subject, context_type, recipient_id, message } = body

    if (!message?.trim()) return badRequest('El mensaje es requerido')

    const [thread] = await db.insert(mail_thread).values({
      subject: subject?.trim() ?? 'Sin asunto',
      context_type: context_type ?? 'general',
    }).returning()

    await db.insert(mail_thread_participant).values([
      { thread_id: thread.id, user_id: Number(session.sub) },
      ...(recipient_id ? [{ thread_id: thread.id, user_id: Number(recipient_id) }] : []),
    ])

    const [msg] = await db.insert(mail_message).values({
      thread_id: thread.id,
      sender_id: Number(session.sub),
      body: message.trim(),
    }).returning()

    return created({ thread, message: msg })
  } catch {
    return serverError()
  }
}
