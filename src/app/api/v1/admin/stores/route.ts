import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_store, res_users } from '@/lib/db/schema'
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

    const conditions: any[] = []
    if (state) conditions.push(eq(marketplace_store.state, state as any))
    if (q) conditions.push(ilike(marketplace_store.name, `%${q}%`))

    const stores = await db.select({
      id: marketplace_store.id,
      name: marketplace_store.name,
      slug: marketplace_store.slug,
      store_type: marketplace_store.store_type,
      state: marketplace_store.state,
      is_verified: marketplace_store.is_verified,
      plan: marketplace_store.plan,
      total_courses: marketplace_store.total_courses,
      total_students: marketplace_store.total_students,
      rating_avg: marketplace_store.rating_avg,
      created_at: marketplace_store.created_at,
      owner_id: marketplace_store.owner_id,
      owner_name: res_users.name,
      owner_email: res_users.email,
    }).from(marketplace_store)
      .innerJoin(res_users, eq(marketplace_store.owner_id, res_users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(marketplace_store.created_at))
      .limit(limit)

    return ok(stores)
  } catch {
    return serverError()
  }
}
