import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_home_section } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ok, unauthorized, forbidden, notFound, badRequest, serverError } from '@/lib/api/response'

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['admin', 'superadmin', 'marketing'].includes(session.role)) return forbidden()

    const { id } = await props.params
    const [existing] = await db.select({ id: marketplace_home_section.id }).from(marketplace_home_section).where(eq(marketplace_home_section.id, Number(id))).limit(1)
    if (!existing) return notFound('Sección no encontrada')

    const body = await req.json()
    const updates: Record<string, any> = { updated_at: new Date(), updated_by: Number(session.sub) }

    if (body.title !== undefined) updates.title = body.title
    if (body.subtitle !== undefined) updates.subtitle = body.subtitle
    if (body.active !== undefined) updates.active = Boolean(body.active)
    if (body.sort_order !== undefined) updates.sort_order = Number(body.sort_order)
    if (body.config !== undefined) updates.config = typeof body.config === 'string' ? body.config : JSON.stringify(body.config)

    const [updated] = await db.update(marketplace_home_section).set(updates).where(eq(marketplace_home_section.id, Number(id))).returning()
    return ok(updated)
  } catch {
    return serverError()
  }
}
