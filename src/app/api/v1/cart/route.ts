import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  marketplace_cart, marketplace_cart_item,
  product_template, marketplace_store,
  marketplace_coupon, marketplace_enrollment,
} from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { unauthorized, badRequest, conflict, notFound, serverError, ok, noContent } from '@/lib/api/response'

/* ─── GET: fetch user's cart ─── */
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const userId = Number(session.sub)

    const [cart] = await db
      .select()
      .from(marketplace_cart)
      .where(eq(marketplace_cart.user_id, userId))
      .limit(1)

    if (!cart) return ok({ items: [], coupon: null, subtotal: 0, discount: 0, total: 0 })

    const items = await db
      .select({
        item_id: marketplace_cart_item.id,
        course_id: marketplace_cart_item.course_id,
        added_at: marketplace_cart_item.added_at,
        course_name: product_template.name,
        course_slug: product_template.slug,
        course_cover: product_template.cover_url,
        list_price: product_template.list_price,
        sale_price: product_template.sale_price,
        is_free: product_template.is_free,
        currency: product_template.currency,
        duration_hours: product_template.duration_hours,
        has_certificate: product_template.has_certificate,
        instructor_name: product_template.instructor_id,
        store_name: marketplace_store.name,
        store_slug: marketplace_store.slug,
      })
      .from(marketplace_cart_item)
      .leftJoin(product_template, eq(marketplace_cart_item.course_id, product_template.id))
      .leftJoin(marketplace_store, eq(product_template.store_id, marketplace_store.id))
      .where(eq(marketplace_cart_item.cart_id, cart.id))

    /* Resolve coupon */
    let coupon = null
    let discount = 0
    if (cart.coupon_code) {
      const [c] = await db
        .select()
        .from(marketplace_coupon)
        .where(and(eq(marketplace_coupon.code, cart.coupon_code), eq(marketplace_coupon.active, true)))
        .limit(1)
      if (c) {
        coupon = { code: c.code, type: c.coupon_type, value: Number(c.discount_value) }
        const subtotal = items.reduce((s, i) => s + Number(i.sale_price ?? i.list_price), 0)
        discount = c.coupon_type === 'percent'
          ? Math.min(subtotal * Number(c.discount_value) / 100, c.max_discount ? Number(c.max_discount) : Infinity)
          : Math.min(Number(c.discount_value), subtotal)
      }
    }

    const subtotal = items.reduce((s, i) => s + Number(i.sale_price ?? i.list_price), 0)
    const total = Math.max(0, subtotal - discount)

    return ok({ items, coupon, subtotal, discount, total })
  } catch (e) {
    console.error('[cart/get]', e)
    return serverError()
  }
}

/* ─── POST: add item to cart ─── */
const addSchema = z.object({ course_id: z.number().int().positive() })

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = addSchema.safeParse(body)
    if (!parsed.success) return badRequest('Datos inválidos')

    const userId = Number(session.sub)
    const { course_id } = parsed.data

    /* Verify course exists and is published */
    const [course] = await db
      .select({ id: product_template.id, state: product_template.state })
      .from(product_template)
      .where(eq(product_template.id, course_id))
      .limit(1)
    if (!course) return notFound('Curso no encontrado')
    if (course.state !== 'published') return badRequest('Curso no disponible')

    /* Check not already enrolled */
    const [enrolled] = await db
      .select({ id: marketplace_enrollment.id })
      .from(marketplace_enrollment)
      .where(and(
        eq(marketplace_enrollment.user_id, userId),
        eq(marketplace_enrollment.course_id, course_id),
      ))
      .limit(1)
    if (enrolled) return conflict('Ya tienes acceso a este curso')

    /* Get or create cart */
    let [cart] = await db.select().from(marketplace_cart).where(eq(marketplace_cart.user_id, userId)).limit(1)
    if (!cart) {
      const [c] = await db.insert(marketplace_cart).values({ user_id: userId }).returning()
      cart = c
    }

    /* Check not already in cart */
    const [existing] = await db
      .select({ id: marketplace_cart_item.id })
      .from(marketplace_cart_item)
      .where(and(eq(marketplace_cart_item.cart_id, cart.id), eq(marketplace_cart_item.course_id, course_id)))
      .limit(1)
    if (existing) return conflict('El curso ya está en el carrito')

    await db.insert(marketplace_cart_item).values({ cart_id: cart.id, course_id })

    return ok({ cart_id: cart.id }, 'Agregado al carrito')
  } catch (e) {
    console.error('[cart/add]', e)
    return serverError()
  }
}

/* ─── DELETE: remove item ─── */
const removeSchema = z.object({ course_id: z.number().int().positive() })

export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await request.json()
    const parsed = removeSchema.safeParse(body)
    if (!parsed.success) return badRequest('Datos inválidos')

    const userId = Number(session.sub)
    const [cart] = await db.select({ id: marketplace_cart.id }).from(marketplace_cart).where(eq(marketplace_cart.user_id, userId)).limit(1)
    if (!cart) return noContent()

    await db
      .delete(marketplace_cart_item)
      .where(and(eq(marketplace_cart_item.cart_id, cart.id), eq(marketplace_cart_item.course_id, parsed.data.course_id)))

    return noContent()
  } catch (e) {
    console.error('[cart/remove]', e)
    return serverError()
  }
}

/* ─── PATCH: apply/remove coupon ─── */
export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await request.json()
    const userId = Number(session.sub)
    const coupon_code: string | null = body.coupon_code ?? null

    if (coupon_code) {
      const [c] = await db
        .select()
        .from(marketplace_coupon)
        .where(and(eq(marketplace_coupon.code, coupon_code.toUpperCase()), eq(marketplace_coupon.active, true)))
        .limit(1)
      if (!c) return notFound('Cupón inválido o expirado')
      if (c.expires_at && c.expires_at < new Date()) return badRequest('El cupón ha expirado')
      if (c.max_uses && (c.used_count ?? 0) >= c.max_uses) return badRequest('El cupón ya no tiene usos disponibles')
    }

    await db
      .update(marketplace_cart)
      .set({ coupon_code: coupon_code?.toUpperCase() ?? null, updated_at: new Date() })
      .where(eq(marketplace_cart.user_id, userId))

    return ok(null, coupon_code ? 'Cupón aplicado' : 'Cupón eliminado')
  } catch (e) {
    console.error('[cart/coupon]', e)
    return serverError()
  }
}
