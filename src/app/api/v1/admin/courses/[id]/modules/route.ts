import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { slide_channel, product_template, marketplace_store } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { ok, created, unauthorized, forbidden, badRequest, serverError } from '@/lib/api/response'

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
    const { id } = await props.params
    const modules = await db.select().from(slide_channel)
      .where(eq(slide_channel.course_id, Number(id)))
      .orderBy(asc(slide_channel.sort_order))
    return ok(modules)
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
    if (!await canEdit(courseId, Number(session.sub), session.role)) return forbidden()

    const body = await req.json()
    if (!body.name?.trim()) return badRequest('El nombre del módulo es requerido')

    const existing = await db.select({ sort_order: slide_channel.sort_order })
      .from(slide_channel).where(eq(slide_channel.course_id, courseId))
    const nextSort = existing.length > 0 ? Math.max(...existing.map(e => e.sort_order)) + 1 : 1

    const [module] = await db.insert(slide_channel).values({
      course_id: courseId,
      name: body.name.trim(),
      description: body.description ?? null,
      sort_order: body.sort_order ?? nextSort,
      is_preview: body.is_preview ?? false,
    }).returning()

    return created(module)
  } catch (e) {
    console.error('[admin/courses/modules POST]', e)
    return serverError()
  }
}
