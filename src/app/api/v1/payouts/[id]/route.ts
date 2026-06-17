import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_payout } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ok, unauthorized, forbidden, notFound, badRequest, serverError } from '@/lib/api/response'

const VALID_STATES = ['pending', 'processing', 'paid', 'failed', 'cancelled']

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['finance', 'admin', 'superadmin'].includes(session.role)) return forbidden()

    const { id } = await props.params
    const [payout] = await db.select().from(marketplace_payout).where(eq(marketplace_payout.id, Number(id))).limit(1)
    if (!payout) return notFound('Liquidación no encontrada')

    const body = await req.json()
    const { state, payment_method, payment_reference } = body
    if (state && !VALID_STATES.includes(state)) return badRequest('Estado inválido')

    const updates: Record<string, unknown> = { updated_at: new Date() }
    if (state) {
      updates.state = state
      if (state === 'paid') updates.processed_at = new Date()
    }
    if (payment_method !== undefined) updates.payment_method = payment_method
    if (payment_reference !== undefined) updates.payment_reference = payment_reference

    const [updated] = await db.update(marketplace_payout).set(updates).where(eq(marketplace_payout.id, Number(id))).returning()
    return ok(updated)
  } catch {
    return serverError()
  }
}
