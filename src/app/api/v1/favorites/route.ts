import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_favorite, product_template } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { ok, created, noContent, unauthorized, badRequest, serverError } from '@/lib/api/response'

export async function GET(_req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const favorites = await db
      .select({
        id: marketplace_favorite.id,
        course_id: marketplace_favorite.course_id,
        store_id: marketplace_favorite.store_id,
        created_at: marketplace_favorite.created_at,
        course_name: product_template.name,
        course_slug: product_template.slug,
        course_cover: product_template.cover_url,
        list_price: product_template.list_price,
        sale_price: product_template.sale_price,
        is_free: product_template.is_free,
        currency: product_template.currency,
        rating_avg: product_template.rating_avg,
        rating_count: product_template.rating_count,
      })
      .from(marketplace_favorite)
      .leftJoin(product_template, eq(marketplace_favorite.course_id, product_template.id))
      .where(eq(marketplace_favorite.user_id, Number(session.sub)))
      .orderBy(desc(marketplace_favorite.created_at))

    return ok(favorites)
  } catch {
    return serverError()
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { course_id, store_id } = await req.json()
    if (!course_id && !store_id) return badRequest('Se requiere course_id o store_id')

    const userId = Number(session.sub)

    const cond = course_id
      ? and(eq(marketplace_favorite.user_id, userId), eq(marketplace_favorite.course_id, Number(course_id)))
      : and(eq(marketplace_favorite.user_id, userId), eq(marketplace_favorite.store_id, Number(store_id)))

    const [existing] = await db.select({ id: marketplace_favorite.id }).from(marketplace_favorite).where(cond).limit(1)
    if (existing) {
      await db.delete(marketplace_favorite).where(eq(marketplace_favorite.id, existing.id))
      return ok({ favorited: false }, 'Eliminado de favoritos')
    }

    const [fav] = await db.insert(marketplace_favorite).values({
      user_id: userId,
      course_id: course_id ? Number(course_id) : null,
      store_id: store_id ? Number(store_id) : null,
    }).returning()

    return created({ favorited: true, id: fav.id }, 'Agregado a favoritos')
  } catch {
    return serverError()
  }
}
