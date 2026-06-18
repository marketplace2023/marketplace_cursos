import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { product_template, marketplace_store } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ok, noContent, unauthorized, forbidden, notFound, serverError } from '@/lib/api/response'

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

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    const { id } = await props.params
    const courseId = Number(id)
    if (!await canEdit(courseId, Number(session.sub), session.role)) return forbidden()

    const [course] = await db.select().from(product_template).where(eq(product_template.id, courseId)).limit(1)
    if (!course) return notFound('Curso no encontrado')
    return ok(course)
  } catch {
    return serverError()
  }
}

const ALLOWED_PATCH = [
  'name', 'subtitle', 'description', 'level', 'modality', 'format', 'language',
  'list_price', 'sale_price', 'is_free', 'currency', 'has_certificate',
  'learning_objectives', 'requirements', 'target_audience',
  'cover_url', 'preview_video_url', 'state', 'category_id',
  'meta_title', 'meta_description',
]

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    const { id } = await props.params
    const courseId = Number(id)
    if (!await canEdit(courseId, Number(session.sub), session.role)) return forbidden()

    const body = await req.json()

    const updates: Record<string, unknown> = { updated_at: new Date() }
    for (const key of ALLOWED_PATCH) {
      if (body[key] !== undefined) updates[key] = body[key]
    }
    /* Map legacy field name from UI */
    if (body.objectives !== undefined) updates.learning_objectives = body.objectives

    if (updates.list_price !== undefined) updates.list_price = String(Number(updates.list_price))
    if (updates.sale_price !== undefined) {
      updates.sale_price = updates.sale_price ? String(Number(updates.sale_price)) : null
    }
    /* Auto-set published_at */
    if (updates.state === 'published') updates.published_at = new Date()

    const [updated] = await db.update(product_template).set(updates as any)
      .where(eq(product_template.id, courseId)).returning()
    return ok(updated)
  } catch (e) {
    console.error('[admin/courses PATCH]', e)
    return serverError()
  }
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['admin', 'superadmin'].includes(session.role)) return forbidden()
    const { id } = await props.params
    await db.update(product_template)
      .set({ deleted_at: new Date(), state: 'archived' })
      .where(eq(product_template.id, Number(id)))
    return noContent()
  } catch {
    return serverError()
  }
}
