import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { slide_slide, product_template, marketplace_store } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { noContent, ok, unauthorized, forbidden, serverError } from '@/lib/api/response'

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

export async function PATCH(req: Request, props: { params: Promise<{ id: string; lessonId: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    const { id, lessonId } = await props.params
    if (!await canEdit(Number(id), Number(session.sub), session.role)) return forbidden()

    const body = await req.json()
    const updates: Record<string, unknown> = { updated_at: new Date() }
    const ALLOWED = ['name', 'description', 'slide_type', 'content_url', 'content_text', 'duration', 'sort_order', 'is_preview', 'is_mandatory']
    for (const key of ALLOWED) {
      if (body[key] !== undefined) updates[key] = body[key]
    }

    const [updated] = await db.update(slide_slide).set(updates as any)
      .where(eq(slide_slide.id, Number(lessonId))).returning()
    return ok(updated)
  } catch {
    return serverError()
  }
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string; lessonId: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    const { id, lessonId } = await props.params
    if (!await canEdit(Number(id), Number(session.sub), session.role)) return forbidden()

    await db.delete(slide_slide).where(eq(slide_slide.id, Number(lessonId)))
    return noContent()
  } catch {
    return serverError()
  }
}
