import { db } from '@/lib/db'
import { product_template, marketplace_store } from '@/lib/db/schema'
import { eq, ilike, and, or, desc, asc } from 'drizzle-orm'
import { ok, serverError } from '@/lib/api/response'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') ?? '').trim()
    const type = searchParams.get('type') ?? 'all' // all | course | store
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') ?? 'relevance'
    const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 50)

    if (!q || q.length < 2) return ok({ courses: [], stores: [] })

    const pattern = `%${q}%`

    let courses: any[] = []
    let stores: any[] = []

    if (type === 'all' || type === 'course') {
      const conditions = [
        eq(product_template.state, 'published'),
        or(ilike(product_template.name, pattern), ilike(product_template.description, pattern))!,
      ]
      if (category) conditions.push(eq(product_template.category_id, Number(category)))

      const orderBy = sort === 'price_asc' ? asc(product_template.list_price)
        : sort === 'price_desc' ? desc(product_template.list_price)
        : sort === 'rating' ? desc(product_template.rating_avg)
        : desc(product_template.id)

      courses = await db.select({
        id: product_template.id,
        name: product_template.name,
        slug: product_template.slug,
        list_price: product_template.list_price,
        sale_price: product_template.sale_price,
        cover_url: product_template.cover_url,
        rating_avg: product_template.rating_avg,
        rating_count: product_template.rating_count,
        total_students: product_template.total_students,
        duration_hours: product_template.duration_hours,
        level: product_template.level,
        category_id: product_template.category_id,
      }).from(product_template)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit)
    }

    if (type === 'all' || type === 'store') {
      stores = await db.select({
        id: marketplace_store.id,
        name: marketplace_store.name,
        slug: marketplace_store.slug,
        description: marketplace_store.description,
        logo_url: marketplace_store.logo_url,
        rating_avg: marketplace_store.rating_avg,
        rating_count: marketplace_store.rating_count,
        total_courses: marketplace_store.total_courses,
        is_verified: marketplace_store.is_verified,
      }).from(marketplace_store)
        .where(and(
          eq(marketplace_store.state, 'active'),
          or(ilike(marketplace_store.name, pattern), ilike(marketplace_store.description, pattern))!
        ))
        .orderBy(desc(marketplace_store.rating_avg))
        .limit(Math.min(limit, 10))
    }

    return ok({ courses, stores, query: q, total: courses.length + stores.length })
  } catch {
    return serverError()
  }
}
