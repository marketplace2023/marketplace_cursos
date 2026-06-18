import { eq, and, ilike, desc, asc, sql, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { marketplace_store, res_users } from '@/lib/db/schema'
import { ok, created, unauthorized, forbidden, conflict, badRequest, serverError, pageMeta } from '@/lib/api/response'
import { getSession } from '@/lib/auth/session'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    + '-' + Date.now().toString(36)
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['store_owner', 'admin', 'superadmin'].includes(session.role)) return forbidden()

    const userId = Number(session.sub)
    const body = await req.json()
    if (!body.name?.trim()) return badRequest('El nombre de la tienda es requerido')

    /* Check if user already has a store */
    const [existing] = await db.select({ id: marketplace_store.id })
      .from(marketplace_store).where(eq(marketplace_store.owner_id, userId)).limit(1)
    if (existing) return conflict('Ya tienes una tienda registrada')

    const slug = toSlug(body.name.trim())
    const [store] = await db.insert(marketplace_store).values({
      owner_id: userId,
      name: body.name.trim(),
      slug,
      description: body.description?.trim() || null,
      store_type: body.store_type ?? 'academy',
      email: body.email || null,
      phone: body.phone || null,
      website: body.website || null,
      country: body.country || 'CO',
      city: body.city || null,
      logo_url: body.logo_url || null,
      cover_url: body.cover_url || null,
      plan: 'free',
      state: 'active',
    }).returning()

    return created(store)
  } catch (e) {
    console.error('[stores POST]', e)
    return serverError()
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit = Math.min(48, Math.max(1, Number(searchParams.get('limit') ?? '12')))
    const offset = (page - 1) * limit

    const q = searchParams.get('q')
    const store_type = searchParams.get('type')
    const is_verified = searchParams.get('verified')
    const sort = searchParams.get('sort') ?? 'newest'

    const conditions = [
      eq(marketplace_store.state, 'active'),
      isNull(marketplace_store.deleted_at),
    ]

    if (q) conditions.push(ilike(marketplace_store.name, `%${q}%`))
    if (store_type) conditions.push(eq(marketplace_store.store_type, store_type as 'academy' | 'individual' | 'corporate' | 'government'))
    if (is_verified === '1') conditions.push(eq(marketplace_store.is_verified, true))

    const orderBy = (() => {
      switch (sort) {
        case 'rating': return desc(marketplace_store.rating_avg)
        case 'students': return desc(marketplace_store.total_students)
        case 'courses': return desc(marketplace_store.total_courses)
        case 'name_asc': return asc(marketplace_store.name)
        default: return desc(marketplace_store.created_at)
      }
    })()

    const where = and(...conditions)

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(marketplace_store)
      .where(where)

    const stores = await db
      .select({
        id: marketplace_store.id,
        name: marketplace_store.name,
        slug: marketplace_store.slug,
        store_type: marketplace_store.store_type,
        description: marketplace_store.description,
        logo_url: marketplace_store.logo_url,
        cover_url: marketplace_store.cover_url,
        country: marketplace_store.country,
        city: marketplace_store.city,
        modality: marketplace_store.modality,
        plan: marketplace_store.plan,
        total_courses: marketplace_store.total_courses,
        total_students: marketplace_store.total_students,
        rating_avg: marketplace_store.rating_avg,
        rating_count: marketplace_store.rating_count,
        is_verified: marketplace_store.is_verified,
        created_at: marketplace_store.created_at,
        owner_name: res_users.name,
      })
      .from(marketplace_store)
      .leftJoin(res_users, eq(marketplace_store.owner_id, res_users.id))
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)

    return ok(stores, 'OK', pageMeta(total, page, limit))
  } catch (e) {
    console.error('[stores/list]', e)
    return serverError()
  }
}
