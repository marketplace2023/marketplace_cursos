import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_support_ticket } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ok, unauthorized, forbidden, badRequest, notFound, serverError } from '@/lib/api/response'

const ALLOWED_STATES = ['open', 'in_progress', 'waiting_user', 'waiting_store', 'resolved', 'closed', 'escalated']
const STAFF_ONLY_STATES = ['in_progress', 'waiting_user', 'waiting_store', 'closed', 'escalated']

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const isStaff = ['support', 'admin', 'superadmin'].includes(session.role)
    const { id } = await props.params

    const [ticket] = await db.select({ id: marketplace_support_ticket.id, user_id: marketplace_support_ticket.user_id })
      .from(marketplace_support_ticket).where(eq(marketplace_support_ticket.id, Number(id))).limit(1)

    if (!ticket) return notFound('Ticket no encontrado')
    if (!isStaff && ticket.user_id !== Number(session.sub)) return forbidden()

    const body = await req.json()
    const { state, assigned_to, priority } = body

    if (state && !ALLOWED_STATES.includes(state)) return badRequest('Estado inválido')
    if (state && !isStaff && STAFF_ONLY_STATES.includes(state)) return forbidden('Solo staff puede asignar este estado')

    const updates: Record<string, any> = { updated_at: new Date() }
    if (state) {
      updates.state = state
      if (state === 'resolved') updates.resolved_at = new Date()
      if (state === 'closed') updates.closed_at = new Date()
    }
    if (isStaff && assigned_to !== undefined) updates.assigned_to = assigned_to
    if (isStaff && priority) updates.priority = priority

    const [updated] = await db.update(marketplace_support_ticket).set(updates).where(eq(marketplace_support_ticket.id, Number(id))).returning()

    return ok(updated)
  } catch {
    return serverError()
  }
}
