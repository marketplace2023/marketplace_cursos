import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import {
  marketplace_enrollment, marketplace_lesson_progress,
  product_template, slide_slide,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { ok, unauthorized, notFound, badRequest, serverError } from '@/lib/api/response'

async function getEnrollment(userId: number, slug: string) {
  const isNumeric = /^\d+$/.test(slug)
  const [course] = await db.select({ id: product_template.id })
    .from(product_template)
    .where(isNumeric ? eq(product_template.id, Number(slug)) : eq(product_template.slug, slug))
    .limit(1)

  if (!course) return null

  const [enrollment] = await db.select()
    .from(marketplace_enrollment)
    .where(and(eq(marketplace_enrollment.user_id, userId), eq(marketplace_enrollment.course_id, course.id)))
    .limit(1)

  return enrollment ?? null
}

export async function GET(_req: Request, props: { params: Promise<{ slug: string }> }) {
  try {
    const params = await props.params
    const session = await getSession()
    if (!session) return unauthorized()

    const enrollment = await getEnrollment(Number(session.sub), params.slug)
    if (!enrollment) return notFound('No estás inscrito en este curso')

    const progress = await db
      .select()
      .from(marketplace_lesson_progress)
      .where(eq(marketplace_lesson_progress.enrollment_id, enrollment.id))

    return ok(progress)
  } catch {
    return serverError()
  }
}

export async function POST(req: Request, props: { params: Promise<{ slug: string }> }) {
  try {
    const params = await props.params
    const session = await getSession()
    if (!session) return unauthorized()

    const enrollment = await getEnrollment(Number(session.sub), params.slug)
    if (!enrollment) return notFound('No estás inscrito en este curso')

    const { lesson_id, completed, time_spent, last_position } = await req.json()
    if (!lesson_id) return badRequest('lesson_id es requerido')

    const [lesson] = await db.select({ id: slide_slide.id })
      .from(slide_slide)
      .where(eq(slide_slide.id, Number(lesson_id)))
      .limit(1)

    if (!lesson) return notFound('Lección no encontrada')

    const existing = await db
      .select()
      .from(marketplace_lesson_progress)
      .where(and(
        eq(marketplace_lesson_progress.enrollment_id, enrollment.id),
        eq(marketplace_lesson_progress.lesson_id, Number(lesson_id)),
      ))
      .limit(1)

    const now = new Date()
    if (existing.length > 0) {
      await db.update(marketplace_lesson_progress)
        .set({
          completed: completed ?? existing[0].completed,
          time_spent: time_spent ?? existing[0].time_spent,
          last_position: last_position ?? existing[0].last_position,
          completed_at: completed && !existing[0].completed ? now : existing[0].completed_at,
          updated_at: now,
        })
        .where(eq(marketplace_lesson_progress.id, existing[0].id))
    } else {
      await db.insert(marketplace_lesson_progress).values({
        enrollment_id: enrollment.id,
        lesson_id: Number(lesson_id),
        user_id: Number(session.sub),
        completed: completed ?? false,
        time_spent: time_spent ?? 0,
        last_position: last_position ?? 0,
        completed_at: completed ? now : undefined,
      })
    }

    /* Recalculate progress_pct */
    const allLessons = await db
      .select({ id: slide_slide.id })
      .from(slide_slide)
      .where(eq(slide_slide.course_id, enrollment.course_id))

    const allProgress = await db
      .select({ completed: marketplace_lesson_progress.completed })
      .from(marketplace_lesson_progress)
      .where(eq(marketplace_lesson_progress.enrollment_id, enrollment.id))

    const total = allLessons.length
    const done = allProgress.filter(p => p.completed).length
    const pct = total > 0 ? (done / total) * 100 : 0

    await db.update(marketplace_enrollment)
      .set({
        progress_pct: String(pct.toFixed(2)),
        state: pct >= 100 ? 'completed' : 'active',
        completed_at: pct >= 100 ? now : undefined,
        updated_at: now,
      })
      .where(eq(marketplace_enrollment.id, enrollment.id))

    return ok({ progress_pct: pct, lesson_id, completed })
  } catch {
    return serverError()
  }
}
