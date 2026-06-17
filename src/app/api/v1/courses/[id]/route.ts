import { eq, and, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  product_template, product_category, marketplace_store,
  res_users, slide_channel, slide_slide, marketplace_review,
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
      isNumeric ? eq(product_template.id, Number(id)) : eq(product_template.slug, id),
      isNull(product_template.deleted_at),
    )

    const [course] = await db
      .select({
        id: product_template.id,
        fur_code: product_template.fur_code,
        name: product_template.name,
        subtitle: product_template.subtitle,
        slug: product_template.slug,
        description: product_template.description,
        short_description: product_template.short_description,
        learning_objectives: product_template.learning_objectives,
        requirements: product_template.requirements,
        target_audience: product_template.target_audience,
        level: product_template.level,
        modality: product_template.modality,
        format: product_template.format,
        language: product_template.language,
        duration_hours: product_template.duration_hours,
        total_modules: product_template.total_modules,
        total_lessons: product_template.total_lessons,
        list_price: product_template.list_price,
        sale_price: product_template.sale_price,
        is_free: product_template.is_free,
        currency: product_template.currency,
        access_type: product_template.access_type,
        access_days: product_template.access_days,
        refund_days: product_template.refund_days,
        cover_url: product_template.cover_url,
        preview_video_url: product_template.preview_video_url,
        preview_video_duration: product_template.preview_video_duration,
        rating_avg: product_template.rating_avg,
        rating_count: product_template.rating_count,
        total_students: product_template.total_students,
        has_certificate: product_template.has_certificate,
        is_featured: product_template.is_featured,
        is_bestseller: product_template.is_bestseller,
        is_new: product_template.is_new,
        state: product_template.state,
        published_at: product_template.published_at,
        meta_title: product_template.meta_title,
        meta_description: product_template.meta_description,
        /* joins */
        store_id: marketplace_store.id,
        store_name: marketplace_store.name,
        store_slug: marketplace_store.slug,
        store_logo: marketplace_store.logo_url,
        store_verified: marketplace_store.is_verified,
        store_students: marketplace_store.total_students,
        store_courses: marketplace_store.total_courses,
        instructor_id: res_users.id,
        instructor_name: res_users.name,
        instructor_avatar: res_users.avatar_url,
        instructor_bio: res_users.bio,
        category_id: product_category.id,
        category_name: product_category.name,
        category_slug: product_category.slug,
      })
      .from(product_template)
      .leftJoin(marketplace_store, eq(product_template.store_id, marketplace_store.id))
      .leftJoin(res_users, eq(product_template.instructor_id, res_users.id))
      .leftJoin(product_category, eq(product_template.category_id, product_category.id))
      .where(condition)
      .limit(1)

    if (!course) return notFound('Curso no encontrado')

    const modules = await db
      .select()
      .from(slide_channel)
      .where(and(eq(slide_channel.course_id, course.id), eq(slide_channel.active, true)))
      .orderBy(slide_channel.sort_order)

    const lessons = await db
      .select()
      .from(slide_slide)
      .where(and(eq(slide_slide.course_id, course.id), eq(slide_slide.active, true)))
      .orderBy(slide_slide.sort_order)

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
        eq(marketplace_review.course_id, course.id),
        eq(marketplace_review.state, 'published'),
      ))
      .orderBy(marketplace_review.created_at)
      .limit(10)

    const modulesWithLessons = modules.map(m => ({
      ...m,
      lessons: lessons.filter(l => l.channel_id === m.id),
    }))

    return ok({ ...course, modules: modulesWithLessons, reviews })
  } catch (e) {
    console.error('[courses/detail]', e)
    return serverError()
  }
}
