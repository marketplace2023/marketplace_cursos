import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { slide_channel, product_template, marketplace_store } from '@/lib/db/schema'
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

export async function PATCH(req: Request, props: { params: Promise<{ id: string; moduleId: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    const { id, moduleId } = await props.params
    if (!await canEdit(Number(id), Number(session.sub), session.role)) return forbidden()

    const body = await req.json()
    const updates: Record<string, unknown> = { updated_at: new Date() }
    if (body.name) updates.name = body.name.trim()
    if (body.description !== undefined) updates.description = body.description
    if (body.sort_order !== undefined) updates.sort_order = Number(body.sort_order)

    const [updated] = await db.update(slide_channel).set(updates as any)
      .where(eq(slide_channel.id, Number(moduleId))).returning()
    return ok(updated)
  } catch {
    return serverError()
  }
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string; moduleId: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    const { id, moduleId } = await props.params
    if (!await canEdit(Number(id), Number(session.sub), session.role)) return forbidden()

    await db.delete(slide_channel).where(eq(slide_channel.id, Number(moduleId)))
    return noContent()
  } catch {
    return serverError()
  }
}
