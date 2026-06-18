import Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { marketplace_cart, marketplace_cart_item, product_template } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { unauthorized, badRequest, serverError, ok } from '@/lib/api/response'

let _stripe: Stripe | null = null
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2026-05-27.dahlia' })
  return _stripe
}

export async function POST() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    if (!process.env.STRIPE_SECRET_KEY) {
      return badRequest('Stripe no configurado')
    }

    const userId = Number(session.sub)

    const [cart] = await db
      .select()
      .from(marketplace_cart)
      .where(eq(marketplace_cart.user_id, userId))
      .limit(1)

    if (!cart) return badRequest('Carrito vacío')

    const items = await db
      .select({
        course_id: marketplace_cart_item.course_id,
        course_name: product_template.name,
        list_price: product_template.list_price,
        sale_price: product_template.sale_price,
        is_free: product_template.is_free,
        currency: product_template.currency,
      })
      .from(marketplace_cart_item)
      .leftJoin(product_template, eq(marketplace_cart_item.course_id, product_template.id))
      .where(eq(marketplace_cart_item.cart_id, cart.id))

    if (items.length === 0) return badRequest('Carrito vacío')

    const subtotal = items.reduce((s, i) => s + Number(i.sale_price ?? i.list_price), 0)
    const currency = items[0].currency?.toLowerCase() ?? 'usd'

    if (subtotal <= 0) return badRequest('No hay monto a cobrar')

    /* Stripe expects amount in cents */
    const amountCents = Math.round(subtotal * 100)

    const intent = await getStripe().paymentIntents.create({
      amount: amountCents,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        user_id: String(userId),
        cart_id: String(cart.id),
        item_count: String(items.length),
      },
    })

    return ok({
      client_secret: intent.client_secret,
      payment_intent_id: intent.id,
      amount: subtotal,
      currency,
    })
  } catch (e) {
    console.error('[payments/create-intent]', e)
    return serverError()
  }
}
