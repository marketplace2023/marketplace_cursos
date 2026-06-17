import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_enrollment, product_template } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { ok, created, unauthorized, notFound, conflict, serverError } from '@/lib/api/response'

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await props.params
    const [enrollment] = await db.select({
      id: marketplace_enrollment.id,
      state: marketplace_enrollment.state,
      progress_pct: marketplace_enrollment.progress_pct,
      enrolled_at: marketplace_enrollment.enrolled_at,
    })
      .from(marketplace_enrollment)
      .where(and(
        eq(marketplace_enrollment.user_id, Number(session.sub)),
        eq(marketplace_enrollment.course_id, Number(id)),
      ))
      .limit(1)

    return ok({ enrolled: !!enrollment, enrollment: enrollment ?? null })
  } catch {
    return serverError()
  }
}

export async function POST(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await props.params
    const courseId = Number(id)

    const [course] = await db.select({ id: product_template.id, is_free: product_template.is_free })
      .from(product_template).where(eq(product_template.id, courseId)).limit(1)
    if (!course) return notFound('Curso no encontrado')
    if (!course.is_free) return conflict('Este curso requiere compra')

    const [existing] = await db.select({ id: marketplace_enrollment.id })
      .from(marketplace_enrollment)
      .where(and(
        eq(marketplace_enrollment.user_id, Number(session.sub)),
        eq(marketplace_enrollment.course_id, courseId),
      ))
      .limit(1)

    if (existing) return conflict('Ya estás inscrito en este curso')

    const [enrollment] = await db.insert(marketplace_enrollment).values({
      user_id: Number(session.sub),
      course_id: courseId,
      state: 'active',
      enrolled_at: new Date(),
    }).returning()

    return created(enrollment)
  } catch {
    return serverError()
  }
}
