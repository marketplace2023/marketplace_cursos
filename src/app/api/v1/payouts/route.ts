import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_payout, marketplace_store } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { ok, created, unauthorized, forbidden, badRequest, serverError } from '@/lib/api/response'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const isStaff = ['finance', 'admin', 'superadmin'].includes(session.role)
    const isStore = session.role === 'store_owner'
    if (!isStaff && !isStore) return forbidden()

    const { searchParams } = new URL(req.url)
    const storeIdParam = searchParams.get('store_id')

    let cond = undefined
    if (isStore) {
      const [store] = await db.select({ id: marketplace_store.id })
        .from(marketplace_store).where(eq(marketplace_store.owner_id, Number(session.sub))).limit(1)
      if (!store) return ok([])
      cond = eq(marketplace_payout.store_id, store.id)
    } else if (storeIdParam) {
      cond = eq(marketplace_payout.store_id, Number(storeIdParam))
    }

    const query = db
      .select({
        id: marketplace_payout.id,
        amount: marketplace_payout.amount,
        currency: marketplace_payout.currency,
        state: marketplace_payout.state,
        payment_method: marketplace_payout.payment_method,
        payment_reference: marketplace_payout.payment_reference,
        period_start: marketplace_payout.period_start,
        period_end: marketplace_payout.period_end,
        processed_at: marketplace_payout.processed_at,
        created_at: marketplace_payout.created_at,
        store_name: marketplace_store.name,
        store_id: marketplace_payout.store_id,
      })
      .from(marketplace_payout)
      .innerJoin(marketplace_store, eq(marketplace_payout.store_id, marketplace_store.id))
      .orderBy(desc(marketplace_payout.created_at))
      .limit(100)

    const payouts = cond ? await query.where(cond) : await query

    return ok(payouts)
  } catch {
    return serverError()
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['finance', 'admin', 'superadmin'].includes(session.role)) return forbidden()

    const body = await req.json()
    const { store_id, amount, currency, payment_method, period_start, period_end } = body
    if (!store_id || !amount) return badRequest('store_id y amount son requeridos')

    const [payout] = await db.insert(marketplace_payout).values({
      store_id: Number(store_id),
      amount: String(amount),
      currency: currency ?? 'USD',
      state: 'pending',
      payment_method: payment_method ?? null,
      period_start: period_start ? new Date(period_start) : null,
      period_end: period_end ? new Date(period_end) : null,
    }).returning()

    return created(payout)
  } catch {
    return serverError()
  }
}
