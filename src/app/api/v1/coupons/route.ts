import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_coupon } from '@/lib/db/schema'
import { eq, and, desc, or, lte, gte } from 'drizzle-orm'
import { ok, created, unauthorized, forbidden, badRequest, conflict, serverError } from '@/lib/api/response'
import { sql } from 'drizzle-orm'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const isAdmin = ['admin', 'superadmin', 'marketing'].includes(session.role)
    const { searchParams } = new URL(req.url)
    const active_only = searchParams.get('active') !== 'false'

    let query = db.select().from(marketplace_coupon).$dynamic()
    if (!isAdmin) {
      query = query.where(and(
        eq(marketplace_coupon.active, true),
        or(sql`${marketplace_coupon.expires_at} IS NULL`, gte(marketplace_coupon.expires_at, new Date()))!
      ))
    } else if (active_only) {
      query = query.where(eq(marketplace_coupon.active, true))
    }

    const coupons = await query.orderBy(desc(marketplace_coupon.created_at)).limit(100)
    return ok(coupons)
  } catch {
    return serverError()
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['admin', 'superadmin', 'marketing', 'store_owner'].includes(session.role)) return forbidden('Sin permiso para crear cupones')

    const body = await req.json()
    const { code, description, coupon_type, discount_value, min_purchase, max_discount, max_uses, max_per_user, store_id, course_id, expires_at, starts_at } = body

    if (!code?.trim()) return badRequest('El código es requerido')
    if (!discount_value || Number(discount_value) <= 0) return badRequest('El descuento debe ser mayor a 0')
    if (coupon_type === 'percent' && Number(discount_value) > 100) return badRequest('El descuento porcentual no puede exceder 100%')

    const [coupon] = await db.insert(marketplace_coupon).values({
      code: code.trim().toUpperCase(),
      description: description?.trim() ?? null,
      coupon_type: coupon_type ?? 'percent',
      discount_value: String(discount_value),
      min_purchase: min_purchase ? String(min_purchase) : '0.00',
      max_discount: max_discount ? String(max_discount) : null,
      max_uses: max_uses ? Number(max_uses) : null,
      max_per_user: max_per_user ? Number(max_per_user) : 1,
      store_id: store_id ? Number(store_id) : null,
      course_id: course_id ? Number(course_id) : null,
      active: true,
      starts_at: starts_at ? new Date(starts_at) : null,
      expires_at: expires_at ? new Date(expires_at) : null,
    }).returning()

    return created(coupon)
  } catch (e: any) {
    if (e?.code === '23505') return conflict('El código de cupón ya existe')
    return serverError()
  }
}
