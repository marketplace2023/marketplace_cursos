import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { slide_slide, slide_channel, product_template, marketplace_store } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { created, unauthorized, forbidden, notFound, badRequest, serverError } from '@/lib/api/response'

async function canEdit(courseId: number, userId: number, role: string): Promise<boolean> {
  if (['admin', 'superadmin'].includes(role)) return true
  const [c] = await db.select({ instructor_id: product_template.instructor_id, store_id: product_template.store_id })
    .from(product_template).where(eq(product_template.id, courseId)).limit(1)
  if (!c) return false
  if (c.instructor_id === userId) return true
  if (c.store_id) {
    const [s] = await db.select({ owner_id: marketplace_store.owner_id })
      .from(marketplace_store).where(eq(marketplace_store.id, c.store_id)).limit(1)
    if (s?.owner_id === userId) return true
  }
  return false
}

export async function POST(req: Request, props: { params: Promise<{ id: string; moduleId: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    const { id, moduleId } = await props.params
    const courseId = Number(id)
    if (!await canEdit(courseId, Number(session.sub), session.role)) return forbidden()

    const [section] = await db.select().from(slide_channel)
      .where(eq(slide_channel.id, Number(moduleId))).limit(1)
    if (!section) return notFound('Módulo no encontrado')

    const body = await req.json()
    if (!body.name?.trim()) return badRequest('El nombre de la lección es requerido')

    const existing = await db.select({ sort_order: slide_slide.sort_order })
      .from(slide_slide).where(eq(slide_slide.channel_id, Number(moduleId)))
    const nextSort = existing.length > 0 ? Math.max(...existing.map(e => e.sort_order)) + 1 : 1

    const [lesson] = await db.insert(slide_slide).values({
      channel_id: Number(moduleId),
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
  } catch (e) {
    console.error('[admin/courses/modules/lessons POST]', e)
    return serverError()
  }
}
