import { z } from 'zod'
import { eq, and, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  marketplace_cart, marketplace_cart_item,
  product_template, marketplace_store,
  sale_order, sale_order_line,
  marketplace_enrollment,
  marketplace_coupon, marketplace_coupon_usage,
} from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { unauthorized, badRequest, serverError, created } from '@/lib/api/response'
import { generateCode } from '@/lib/utils'

const schema = z.object({
  billing_name: z.string().min(2),
  billing_email: z.string().email(),
  billing_country: z.string().length(2).optional(),
  billing_tax_id: z.string().optional(),
  payment_gateway: z.string().default('manual'),
  payment_intent_id: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest('Datos de facturación inválidos', parsed.error.issues)

    const userId = Number(session.sub)

    /* Load cart */
    const [cart] = await db.select().from(marketplace_cart).where(eq(marketplace_cart.user_id, userId)).limit(1)
    if (!cart) return badRequest('El carrito está vacío')

    const items = await db
      .select({
        item_id: marketplace_cart_item.id,
        course_id: marketplace_cart_item.course_id,
        course_name: product_template.name,
        list_price: product_template.list_price,
        sale_price: product_template.sale_price,
        is_free: product_template.is_free,
        currency: product_template.currency,
        store_id: product_template.store_id,
        commission_rate: marketplace_store.commission_rate,
      })
      .from(marketplace_cart_item)
      .leftJoin(product_template, eq(marketplace_cart_item.course_id, product_template.id))
      .leftJoin(marketplace_store, eq(product_template.store_id, marketplace_store.id))
      .where(eq(marketplace_cart_item.cart_id, cart.id))

    if (items.length === 0) return badRequest('El carrito está vacío')

    /* Coupon */
    let couponRec = null
    let discount = 0
    if (cart.coupon_code) {
      const [c] = await db
        .select()
        .from(marketplace_coupon)
        .where(and(eq(marketplace_coupon.code, cart.coupon_code), eq(marketplace_coupon.active, true)))
        .limit(1)
      if (c) {
        couponRec = c
        const subtotal = items.reduce((s, i) => s + Number(i.sale_price ?? i.list_price), 0)
        discount = c.coupon_type === 'percent'
          ? Math.min(subtotal * Number(c.discount_value) / 100, c.max_discount ? Number(c.max_discount) : Infinity)
          : Math.min(Number(c.discount_value), subtotal)
      }
    }

    const subtotal = items.reduce((s, i) => s + Number(i.sale_price ?? i.list_price), 0)
    const total = Math.max(0, subtotal - discount)

    /* Stripe payment: mark as paid immediately since Stripe already confirmed */
    const stripeConfirmed = parsed.data.payment_gateway === 'stripe' && !!parsed.data.payment_intent_id
    const isPaid = total === 0 || stripeConfirmed

    /* Create order */
    const orderName = `SO-${generateCode('', 8)}`
    const [order] = await db
      .insert(sale_order)
      .values({
        name: orderName,
        buyer_id: userId,
        state: isPaid ? 'paid' : 'confirmed',
        payment_state: isPaid ? 'paid' : 'pending',
        amount_untaxed: String(subtotal),
        amount_discount: String(discount),
        amount_total: String(total),
        coupon_code: cart.coupon_code ?? null,
        coupon_id: couponRec?.id ?? null,
        billing_name: parsed.data.billing_name,
        billing_email: parsed.data.billing_email,
        billing_country: parsed.data.billing_country ?? null,
        billing_tax_id: parsed.data.billing_tax_id ?? null,
        payment_gateway: parsed.data.payment_gateway,
        payment_intent_id: parsed.data.payment_intent_id ?? null,
        confirmed_at: new Date(),
        ...(isPaid && { paid_at: new Date() }),
      })
      .returning()

    /* Create order lines */
    const perItemDiscount = items.length > 0 ? discount / items.length : 0
    await db.insert(sale_order_line).values(
      items.map(item => {
        const unitPrice = Number(item.sale_price ?? item.list_price)
        const commRate = Number(item.commission_rate ?? 15)
        const commission = unitPrice * commRate / 100
        return {
          order_id: order.id,
          course_id: item.course_id,
          store_id: item.store_id ?? null,
          name: item.course_name ?? 'Curso',
          quantity: 1,
          unit_price: String(unitPrice),
          discount_amount: String(perItemDiscount.toFixed(2)),
          subtotal: String(Math.max(0, unitPrice - perItemDiscount).toFixed(2)),
          commission_rate: String(commRate),
          commission_amount: String(commission.toFixed(2)),
          store_amount: String((unitPrice - commission).toFixed(2)),
        }
      })
    )

    /* Grant enrollments for free or already-paid orders */
    if (isPaid) {
      await db.insert(marketplace_enrollment).values(
        items.map(item => ({
          user_id: userId,
          course_id: item.course_id,
          state: 'active' as const,
          enrolled_at: new Date(),
        }))
      ).onConflictDoNothing()
    }

    /* Update coupon usage */
    if (couponRec) {
      await db.update(marketplace_coupon)
        .set({ used_count: sql`${marketplace_coupon.used_count} + 1` })
        .where(eq(marketplace_coupon.id, couponRec.id))
      await db.insert(marketplace_coupon_usage).values({
        coupon_id: couponRec.id,
        user_id: userId,
        order_id: order.id,
        discount_applied: String(discount.toFixed(2)),
      })
    }

    /* Clear cart */
    await db.delete(marketplace_cart_item).where(eq(marketplace_cart_item.cart_id, cart.id))
    await db.update(marketplace_cart).set({ coupon_code: null, updated_at: new Date() }).where(eq(marketplace_cart.id, cart.id))

    return created({ order_id: order.id, order_name: orderName, total, payment_state: order.payment_state }, 'Orden creada')
  } catch (e) {
    console.error('[checkout]', e)
    return serverError()
  }
}
