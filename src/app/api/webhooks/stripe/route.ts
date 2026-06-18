import Stripe from 'stripe'
import { headers } from 'next/headers'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  sale_order, sale_order_line, marketplace_enrollment, account_payment,
} from '@/lib/db/schema'

let _stripe: Stripe | null = null
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2026-05-27.dahlia' })
  return _stripe
}
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ''

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig || !WEBHOOK_SECRET) {
    return new Response('Webhook signature missing', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[stripe-webhook] signature error:', msg)
    return new Response(`Webhook error: ${msg}`, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent

    try {
      const [order] = await db
        .select({ id: sale_order.id, buyer_id: sale_order.buyer_id, payment_state: sale_order.payment_state })
        .from(sale_order)
        .where(eq(sale_order.payment_intent_id, intent.id))
        .limit(1)

      if (order && order.payment_state !== 'paid') {
        await db.update(sale_order).set({
          payment_state: 'paid',
          state: 'paid',
          paid_at: new Date(),
          updated_at: new Date(),
        }).where(eq(sale_order.id, order.id))

        /* Record payment in account_payment */
        await db.insert(account_payment).values({
          order_id: order.id,
          gateway: 'stripe',
          gateway_transaction_id: intent.id,
          amount: String((intent.amount / 100).toFixed(2)),
          currency: intent.currency.toUpperCase(),
          state: 'paid',
          payment_method: intent.payment_method_types?.[0] ?? 'card',
          gateway_response: JSON.stringify({ id: intent.id, status: intent.status }),
        })

        /* Grant enrollments */
        const lines = await db
          .select({ course_id: sale_order_line.course_id })
          .from(sale_order_line)
          .where(eq(sale_order_line.order_id, order.id))

        if (lines.length > 0) {
          await db.insert(marketplace_enrollment).values(
            lines.map(l => ({
              user_id: order.buyer_id,
              course_id: l.course_id,
              order_id: order.id,
              state: 'active' as const,
              enrolled_at: new Date(),
            }))
          ).onConflictDoNothing()
        }
      }
    } catch (e) {
      console.error('[stripe-webhook] failed to process payment_intent.succeeded:', e)
      return new Response('Internal error', { status: 500 })
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent
    try {
      await db.update(sale_order)
        .set({ payment_state: 'failed', updated_at: new Date() })
        .where(eq(sale_order.payment_intent_id, intent.id))
    } catch (e) {
      console.error('[stripe-webhook] failed to update failed payment:', e)
    }
  }

  return new Response(null, { status: 200 })
}
