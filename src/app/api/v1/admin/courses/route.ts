import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { product_template, marketplace_store } from '@/lib/db/schema'
import { eq, desc, ilike, and } from 'drizzle-orm'
import { ok, unauthorized, forbidden, serverError } from '@/lib/api/response'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['admin', 'superadmin'].includes(session.role)) return forbidden()

    const { searchParams } = new URL(req.url)
    const state = searchParams.get('state')
    const q = searchParams.get('q')?.trim()
    const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 200)
    const offset = Number(searchParams.get('offset') ?? '0')

    const conditions: any[] = []
    if (state) conditions.push(eq(product_template.state, state as any))
    if (q) conditions.push(ilike(product_template.name, `%${q}%`))

    const courses = await db.select({
      id: product_template.id,
      name: product_template.name,
      slug: product_template.slug,
      state: product_template.state,
      list_price: product_template.list_price,
      level: product_template.level,
      total_students: product_template.total_students,
      rating_avg: product_template.rating_avg,
      created_at: product_template.created_at,
      store_id: product_template.store_id,
      store_name: marketplace_store.name,
    }).from(product_template)
      .innerJoin(marketplace_store, eq(product_template.store_id, marketplace_store.id))
      .where(and(...conditions))
      .orderBy(desc(product_template.created_at))
      .limit(limit)
      .offset(offset)

    return ok(courses)
  } catch {
    return serverError()
  }
}
