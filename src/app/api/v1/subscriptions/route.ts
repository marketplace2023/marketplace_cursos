import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_subscription, marketplace_subscription_plan } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { ok, created, unauthorized, badRequest, serverError } from '@/lib/api/response'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const subscriptions = await db
      .select({
        id: marketplace_subscription.id,
        state: marketplace_subscription.state,
        current_period_start: marketplace_subscription.current_period_start,
        current_period_end: marketplace_subscription.current_period_end,
        trial_end: marketplace_subscription.trial_end,
        cancelled_at: marketplace_subscription.cancelled_at,
        created_at: marketplace_subscription.created_at,
        plan_id: marketplace_subscription.plan_id,
        plan_name: marketplace_subscription_plan.name,
        plan_period: marketplace_subscription_plan.period,
        plan_price: marketplace_subscription_plan.price,
        plan_currency: marketplace_subscription_plan.currency,
      })
      .from(marketplace_subscription)
      .innerJoin(marketplace_subscription_plan, eq(marketplace_subscription.plan_id, marketplace_subscription_plan.id))
      .where(eq(marketplace_subscription.user_id, Number(session.sub)))
      .orderBy(desc(marketplace_subscription.created_at))

    return ok(subscriptions)
  } catch {
    return serverError()
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await req.json()
    const { plan_id, store_id, gateway_subscription_id } = body

    if (!plan_id) return badRequest('plan_id es requerido')

    const [plan] = await db.select().from(marketplace_subscription_plan).where(eq(marketplace_subscription_plan.id, Number(plan_id))).limit(1)
    if (!plan) return badRequest('Plan no encontrado')

    const now = new Date()
    const periodEnd = new Date(now)
    if (plan.period === 'monthly') periodEnd.setMonth(periodEnd.getMonth() + 1)
    else if (plan.period === 'quarterly') periodEnd.setMonth(periodEnd.getMonth() + 3)
    else periodEnd.setFullYear(periodEnd.getFullYear() + 1)

    const [sub] = await db.insert(marketplace_subscription).values({
      user_id: Number(session.sub),
      plan_id: Number(plan_id),
      store_id: store_id ? Number(store_id) : null,
      state: 'active',
      gateway_subscription_id: gateway_subscription_id ?? null,
      current_period_start: now,
      current_period_end: periodEnd,
    }).returning()

    return created(sub)
  } catch {
    return serverError()
  }
}
