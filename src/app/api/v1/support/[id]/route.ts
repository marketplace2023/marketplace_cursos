import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_support_ticket, marketplace_ticket_message, res_users } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { ok, unauthorized, notFound, serverError } from '@/lib/api/response'

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await props.params
    const isStaff = ['support', 'admin', 'superadmin'].includes(session.role)

    const conditions = isStaff
      ? [eq(marketplace_support_ticket.id, Number(id))]
      : [eq(marketplace_support_ticket.id, Number(id)), eq(marketplace_support_ticket.user_id, Number(session.sub))]

    const [ticket] = await db
      .select()
      .from(marketplace_support_ticket)
      .where(and(...conditions))
      .limit(1)

    if (!ticket) return notFound('Ticket no encontrado')

    const messages = await db
      .select({
        id: marketplace_ticket_message.id,
        body: marketplace_ticket_message.body,
        is_internal: marketplace_ticket_message.is_internal,
        attachment_url: marketplace_ticket_message.attachment_url,
        created_at: marketplace_ticket_message.created_at,
        sender_id: marketplace_ticket_message.sender_id,
        sender_name: res_users.name,
        sender_type: res_users.user_type,
      })
      .from(marketplace_ticket_message)
      .innerJoin(res_users, eq(marketplace_ticket_message.sender_id, res_users.id))
      .where(and(
        eq(marketplace_ticket_message.ticket_id, Number(id)),
        isStaff ? undefined : eq(marketplace_ticket_message.is_internal, false)
      ) as any)
      .orderBy(asc(marketplace_ticket_message.created_at))

    return ok({ ...ticket, messages })
  } catch {
    return serverError()
  }
}
