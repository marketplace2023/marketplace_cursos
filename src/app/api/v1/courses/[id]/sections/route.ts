import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { slide_channel, slide_slide, product_template, marketplace_store } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { ok, created, unauthorized, forbidden, notFound, badRequest, serverError } from '@/lib/api/response'

async function isOwner(courseId: number, userId: number): Promise<boolean> {
  const [course] = await db.select({ instructor_id: product_template.instructor_id, store_id: product_template.store_id })
    .from(product_template).where(eq(product_template.id, courseId)).limit(1)
  if (!course) return false
  if (course.instructor_id === userId) return true
  if (course.store_id) {
    const [store] = await db.select({ owner_id: marketplace_store.owner_id })
      .from(marketplace_store).where(eq(marketplace_store.id, course.store_id)).limit(1)
    if (store?.owner_id === userId) return true
  }
  return false
}

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params
    const courseId = Number(id)

    const [course] = await db.select({ id: product_template.id })
      .from(product_template).where(eq(product_template.id, courseId)).limit(1)
    if (!course) return notFound('Curso no encontrado')

    const sections = await db.select().from(slide_channel)
      .where(eq(slide_channel.course_id, courseId))
      .orderBy(asc(slide_channel.sort_order))

    const sectionsWithLessons = await Promise.all(
      sections.map(async s => {
        const lessons = await db.select().from(slide_slide)
          .where(eq(slide_slide.channel_id, s.id))
          .orderBy(asc(slide_slide.sort_order))
        return { ...s, lessons }
      })
    )

    return ok(sectionsWithLessons)
  } catch {
    return serverError()
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await props.params
    const courseId = Number(id)

    const isAdmin = ['admin', 'superadmin'].includes(session.role)
    if (!isAdmin) {
      const owns = await isOwner(courseId, Number(session.sub))
      if (!owns) return forbidden()
    }

    const body = await req.json()
    if (!body.name?.trim()) return badRequest('El nombre es requerido')

    const existing = await db.select({ sort_order: slide_channel.sort_order })
      .from(slide_channel).where(eq(slide_channel.course_id, courseId))
    const nextSort = existing.length > 0 ? Math.max(...existing.map(e => e.sort_order)) + 1 : 1

    const [section] = await db.insert(slide_channel).values({
      course_id: courseId,
      name: body.name.trim(),
      description: body.description ?? null,
      sort_order: body.sort_order ?? nextSort,
      is_preview: body.is_preview ?? false,
    }).returning()

    return created(section)
  } catch {
    return serverError()
  }
}
