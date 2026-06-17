import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { sale_order, sale_order_line, product_template } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { ok, unauthorized, serverError } from '@/lib/api/response'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const orders = await db
      .select({
        id: sale_order.id,
        name: sale_order.name,
        state: sale_order.state,
        payment_state: sale_order.payment_state,
        amount_total: sale_order.amount_total,
        currency: sale_order.currency,
        payment_gateway: sale_order.payment_gateway,
        created_at: sale_order.created_at,
        paid_at: sale_order.paid_at,
      })
      .from(sale_order)
      .where(eq(sale_order.buyer_id, Number(session.sub)))
      .orderBy(desc(sale_order.created_at))
      .limit(50)

    return ok(orders)
  } catch {
    return serverError()
  }
}
