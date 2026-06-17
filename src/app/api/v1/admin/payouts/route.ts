import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_payout, marketplace_store } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { ok, unauthorized, forbidden, serverError } from '@/lib/api/response'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['finance', 'admin', 'superadmin'].includes(session.role)) return forbidden()

    const { searchParams } = new URL(req.url)
    const state = searchParams.get('state')

    const rows = await db
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
        store_id: marketplace_payout.store_id,
        store_name: marketplace_store.name,
        store_slug: marketplace_store.slug,
      })
      .from(marketplace_payout)
      .innerJoin(marketplace_store, eq(marketplace_payout.store_id, marketplace_store.id))
      .orderBy(desc(marketplace_payout.created_at))
      .limit(200)

    const filtered = state ? rows.filter(r => r.state === state) : rows
    return ok(filtered)
  } catch {
    return serverError()
  }
}
