import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_support_ticket, marketplace_ticket_message } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { created, unauthorized, badRequest, notFound, serverError } from '@/lib/api/response'

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await props.params
    const isStaff = ['support', 'admin', 'superadmin'].includes(session.role)

    const conditions = isStaff
      ? [eq(marketplace_support_ticket.id, Number(id))]
      : [eq(marketplace_support_ticket.id, Number(id)), eq(marketplace_support_ticket.user_id, Number(session.sub))]

    const [ticket] = await db.select({ id: marketplace_support_ticket.id, state: marketplace_support_ticket.state })
      .from(marketplace_support_ticket).where(and(...conditions)).limit(1)

    if (!ticket) return notFound('Ticket no encontrado')
    if (['resolved', 'closed'].includes(ticket.state)) return badRequest('El ticket está cerrado')

    const body = await req.json()
    const { message, is_internal, attachment_url } = body

    if (!message?.trim()) return badRequest('El mensaje es requerido')

    const [msg] = await db.insert(marketplace_ticket_message).values({
      ticket_id: Number(id),
      sender_id: Number(session.sub),
      body: message.trim(),
      is_internal: isStaff && is_internal === true,
      attachment_url: attachment_url ?? null,
    }).returning()

    await db.update(marketplace_support_ticket)
      .set({ updated_at: new Date(), state: isStaff ? 'in_progress' : 'waiting_store' })
      .where(eq(marketplace_support_ticket.id, Number(id)))

    return created(msg)
  } catch {
    return serverError()
  }
}
