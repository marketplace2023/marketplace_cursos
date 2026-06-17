import { eq, and, isNull, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  marketplace_store, res_users, product_template,
  product_category, marketplace_review,
} from '@/lib/db/schema'
import { notFound, serverError, ok } from '@/lib/api/response'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const isNumeric = /^\d+$/.test(id)

    const condition = and(
      isNumeric ? eq(marketplace_store.id, Number(id)) : eq(marketplace_store.slug, id),
      isNull(marketplace_store.deleted_at),
    )

    const [store] = await db
      .select({
        id: marketplace_store.id,
        fur_code: marketplace_store.fur_code,
        name: marketplace_store.name,
        legal_name: marketplace_store.legal_name,
        slug: marketplace_store.slug,
        store_type: marketplace_store.store_type,
        state: marketplace_store.state,
        description: marketplace_store.description,
        logo_url: marketplace_store.logo_url,
        cover_url: marketplace_store.cover_url,
        email: marketplace_store.email,
        phone: marketplace_store.phone,
        website: marketplace_store.website,
        country: marketplace_store.country,
        city: marketplace_store.city,
        modality: marketplace_store.modality,
        languages: marketplace_store.languages,
        social_links: marketplace_store.social_links,
        plan: marketplace_store.plan,
        total_courses: marketplace_store.total_courses,
        total_students: marketplace_store.total_students,
        total_sales: marketplace_store.total_sales,
        rating_avg: marketplace_store.rating_avg,
        rating_count: marketplace_store.rating_count,
        is_verified: marketplace_store.is_verified,
        verified_at: marketplace_store.verified_at,
        refund_policy: marketplace_store.refund_policy,
        support_policy: marketplace_store.support_policy,
        meta_title: marketplace_store.meta_title,
        meta_description: marketplace_store.meta_description,
        created_at: marketplace_store.created_at,
        owner_id: res_users.id,
        owner_name: res_users.name,
        owner_avatar: res_users.avatar_url,
        owner_bio: res_users.bio,
      })
      .from(marketplace_store)
      .leftJoin(res_users, eq(marketplace_store.owner_id, res_users.id))
      .where(condition)
      .limit(1)

    if (!store) return notFound('Tienda no encontrada')

    /* Published courses of this store */
    const courses = await db
      .select({
        id: product_template.id,
        name: product_template.name,
        slug: product_template.slug,
        cover_url: product_template.cover_url,
        level: product_template.level,
        duration_hours: product_template.duration_hours,
        list_price: product_template.list_price,
        sale_price: product_template.sale_price,
        is_free: product_template.is_free,
        currency: product_template.currency,
        rating_avg: product_template.rating_avg,
        rating_count: product_template.rating_count,
        total_students: product_template.total_students,
        has_certificate: product_template.has_certificate,
        is_bestseller: product_template.is_bestseller,
        is_new: product_template.is_new,
        category_name: product_category.name,
        category_slug: product_category.slug,
        instructor_name: res_users.name,
      })
      .from(product_template)
      .leftJoin(product_category, eq(product_template.category_id, product_category.id))
      .leftJoin(res_users, eq(product_template.instructor_id, res_users.id))
      .where(and(
        eq(product_template.store_id, store.id),
        eq(product_template.state, 'published'),
        isNull(product_template.deleted_at),
      ))
      .orderBy(desc(product_template.is_featured), desc(product_template.published_at))
      .limit(24)

    /* Latest reviews */
    const reviews = await db
      .select({
        id: marketplace_review.id,
        rating: marketplace_review.rating,
        comment: marketplace_review.comment,
        verified_purchase: marketplace_review.verified_purchase,
        created_at: marketplace_review.created_at,
        reviewer_name: res_users.name,
        reviewer_avatar: res_users.avatar_url,
      })
      .from(marketplace_review)
      .leftJoin(res_users, eq(marketplace_review.user_id, res_users.id))
      .where(and(
        eq(marketplace_review.store_id, store.id),
        eq(marketplace_review.state, 'published'),
      ))
      .orderBy(desc(marketplace_review.created_at))
      .limit(10)

    return ok({ ...store, courses, reviews })
  } catch (e) {
    console.error('[stores/detail]', e)
    return serverError()
  }
}
