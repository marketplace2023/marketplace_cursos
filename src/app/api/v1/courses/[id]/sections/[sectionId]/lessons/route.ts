import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { slide_slide, slide_channel, product_template, marketplace_store } from '@/lib/db/schema'
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

export async function GET(_req: Request, props: { params: Promise<{ id: string; sectionId: string }> }) {
  try {
    const { sectionId } = await props.params
    const lessons = await db.select().from(slide_slide)
      .where(eq(slide_slide.channel_id, Number(sectionId)))
      .orderBy(asc(slide_slide.sort_order))
    return ok(lessons)
  } catch {
    return serverError()
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string; sectionId: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id, sectionId } = await props.params
    const courseId = Number(id)

    const isAdmin = ['admin', 'superadmin'].includes(session.role)
    if (!isAdmin) {
      const owns = await isOwner(courseId, Number(session.sub))
      if (!owns) return forbidden()
    }

    const [section] = await db.select().from(slide_channel)
      .where(eq(slide_channel.id, Number(sectionId))).limit(1)
    if (!section) return notFound('Sección no encontrada')

    const body = await req.json()
    if (!body.name?.trim()) return badRequest('El nombre es requerido')

    const existing = await db.select({ sort_order: slide_slide.sort_order })
      .from(slide_slide).where(eq(slide_slide.channel_id, Number(sectionId)))
    const nextSort = existing.length > 0 ? Math.max(...existing.map(e => e.sort_order)) + 1 : 1

    const [lesson] = await db.insert(slide_slide).values({
      channel_id: Number(sectionId),
      course_id: courseId,
      name: body.name.trim(),
      description: body.description ?? null,
      slide_type: body.slide_type ?? 'video',
      content_url: body.content_url ?? null,
      content_text: body.content_text ?? null,
      duration: body.duration ? Number(body.duration) : 0,
      sort_order: body.sort_order ?? nextSort,
      is_preview: body.is_preview ?? false,
      is_mandatory: body.is_mandatory ?? true,
    }).returning()

    return created(lesson)
  } catch {
    return serverError()
  }
}
