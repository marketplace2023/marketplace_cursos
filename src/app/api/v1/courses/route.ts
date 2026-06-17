import { eq, and, gte, lte, ilike, desc, asc, sql, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { product_template, product_category, marketplace_store, res_users } from '@/lib/db/schema'
import { ok, serverError, pageMeta } from '@/lib/api/response'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit = Math.min(48, Math.max(1, Number(searchParams.get('limit') ?? '12')))
    const offset = (page - 1) * limit

    const q = searchParams.get('q')
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const modality = searchParams.get('modality')
    const format = searchParams.get('format')
    const is_free = searchParams.get('is_free')
    const price_min = searchParams.get('price_min')
    const price_max = searchParams.get('price_max')
    const has_certificate = searchParams.get('has_certificate')
    const sort = searchParams.get('sort') ?? 'newest'

    const conditions = [
      eq(product_template.state, 'published'),
      isNull(product_template.deleted_at),
    ]

    if (q) conditions.push(ilike(product_template.name, `%${q}%`))
    if (level) conditions.push(eq(product_template.level, level as 'beginner' | 'intermediate' | 'advanced' | 'all_levels'))
    if (modality) conditions.push(eq(product_template.modality, modality as 'online_async' | 'online_sync' | 'presential' | 'hybrid' | 'recorded'))
    if (format) conditions.push(eq(product_template.format, format as 'video' | 'text' | 'audio' | 'live' | 'blended'))
    if (is_free === '1') conditions.push(eq(product_template.is_free, true))
    if (price_min) conditions.push(gte(product_template.list_price, price_min))
    if (price_max) conditions.push(lte(product_template.list_price, price_max))
    if (has_certificate === '1') conditions.push(eq(product_template.has_certificate, true))

    if (category) {
      const [cat] = await db
        .select({ id: product_category.id })
        .from(product_category)
        .where(eq(product_category.slug, category))
        .limit(1)
      if (cat) conditions.push(eq(product_template.category_id, cat.id))
    }

    const orderBy = (() => {
      switch (sort) {
        case 'price_asc': return asc(product_template.list_price)
        case 'price_desc': return desc(product_template.list_price)
        case 'rating': return desc(product_template.rating_avg)
        case 'popular': return desc(product_template.total_students)
        default: return desc(product_template.created_at)
      }
    })()

    const where = and(...conditions)

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(product_template)
      .where(where)

    const courses = await db
      .select({
        id: product_template.id,
        name: product_template.name,
        subtitle: product_template.subtitle,
        slug: product_template.slug,
        short_description: product_template.short_description,
        cover_url: product_template.cover_url,
        level: product_template.level,
        modality: product_template.modality,
        format: product_template.format,
        duration_hours: product_template.duration_hours,
        total_modules: product_template.total_modules,
        total_lessons: product_template.total_lessons,
        list_price: product_template.list_price,
        sale_price: product_template.sale_price,
        is_free: product_template.is_free,
        currency: product_template.currency,
        rating_avg: product_template.rating_avg,
        rating_count: product_template.rating_count,
        total_students: product_template.total_students,
        has_certificate: product_template.has_certificate,
        is_featured: product_template.is_featured,
        is_bestseller: product_template.is_bestseller,
        is_new: product_template.is_new,
        published_at: product_template.published_at,
        /* joins */
        store_name: marketplace_store.name,
        store_slug: marketplace_store.slug,
        store_logo: marketplace_store.logo_url,
        instructor_name: res_users.name,
        category_name: product_category.name,
        category_slug: product_category.slug,
      })
      .from(product_template)
      .leftJoin(marketplace_store, eq(product_template.store_id, marketplace_store.id))
      .leftJoin(res_users, eq(product_template.instructor_id, res_users.id))
      .leftJoin(product_category, eq(product_template.category_id, product_category.id))
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)

    return ok(courses, 'OK', pageMeta(total, page, limit))
  } catch (e) {
    console.error('[courses/list]', e)
    return serverError()
  }
}
