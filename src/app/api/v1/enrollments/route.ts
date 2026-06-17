import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_enrollment, product_template, marketplace_store } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { ok, unauthorized, serverError } from '@/lib/api/response'

export async function GET(_req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const enrollments = await db
      .select({
        id: marketplace_enrollment.id,
        course_id: marketplace_enrollment.course_id,
        state: marketplace_enrollment.state,
        progress_pct: marketplace_enrollment.progress_pct,
        enrolled_at: marketplace_enrollment.enrolled_at,
        completed_at: marketplace_enrollment.completed_at,
        expires_at: marketplace_enrollment.expires_at,
        course_name: product_template.name,
        course_slug: product_template.slug,
        course_cover: product_template.cover_url,
        course_level: product_template.level,
        duration_hours: product_template.duration_hours,
        has_certificate: product_template.has_certificate,
        store_name: marketplace_store.name,
      })
      .from(marketplace_enrollment)
      .leftJoin(product_template, eq(marketplace_enrollment.course_id, product_template.id))
      .leftJoin(marketplace_store, eq(product_template.store_id, marketplace_store.id))
      .where(eq(marketplace_enrollment.user_id, Number(session.sub)))
      .orderBy(desc(marketplace_enrollment.enrolled_at))

    return ok(enrollments)
  } catch {
    return serverError()
  }
}
