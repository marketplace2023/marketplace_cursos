import { db } from '@/lib/db'
import { res_users, marketplace_instructor, product_template, marketplace_store } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { ok, notFound, serverError } from '@/lib/api/response'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    const [user] = await db
      .select({
        id: res_users.id,
        name: res_users.name,
        last_name: res_users.last_name,
        public_name: res_users.public_name,
        username: res_users.username,
        avatar_url: res_users.avatar_url,
        bio: res_users.bio,
        website: res_users.website,
        country: res_users.country,
        user_type: res_users.user_type,
        // instructor profile
        headline: marketplace_instructor.headline,
        expertise: marketplace_instructor.expertise,
        credentials: marketplace_instructor.credentials,
        linkedin_url: marketplace_instructor.linkedin_url,
        portfolio_url: marketplace_instructor.portfolio_url,
        rating_avg: marketplace_instructor.rating_avg,
        rating_count: marketplace_instructor.rating_count,
        total_courses: marketplace_instructor.total_courses,
        total_students: marketplace_instructor.total_students,
      })
      .from(res_users)
      .leftJoin(marketplace_instructor, eq(marketplace_instructor.user_id, res_users.id))
      .where(and(eq(res_users.username, slug), eq(res_users.user_type, 'instructor')))
      .limit(1)

    if (!user) return notFound('Instructor no encontrado')

    const courses = await db
      .select({
        id: product_template.id,
        name: product_template.name,
        slug: product_template.slug,
        cover_url: product_template.cover_url,
        list_price: product_template.list_price,
        sale_price: product_template.sale_price,
        is_free: product_template.is_free,
        currency: product_template.currency,
        level: product_template.level,
        duration_hours: product_template.duration_hours,
        rating_avg: product_template.rating_avg,
        rating_count: product_template.rating_count,
        total_students: product_template.total_students,
        has_certificate: product_template.has_certificate,
        is_bestseller: product_template.is_bestseller,
        store_name: marketplace_store.name,
        store_slug: marketplace_store.slug,
      })
      .from(product_template)
      .leftJoin(marketplace_store, eq(marketplace_store.id, product_template.store_id))
      .where(and(eq(product_template.instructor_id, user.id), eq(product_template.state, 'published')))
      .orderBy(product_template.is_bestseller, product_template.rating_avg)
      .limit(50)

    const displayName = user.public_name ?? `${user.name}${user.last_name ? ' ' + user.last_name : ''}`

    return ok({ ...user, display_name: displayName, courses })
  } catch {
    return serverError()
  }
}
