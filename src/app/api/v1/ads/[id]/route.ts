import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_ad_campaign, marketplace_store } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { ok, noContent, unauthorized, forbidden, notFound, badRequest, serverError } from '@/lib/api/response'

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await props.params
    const [campaign] = await db.select().from(marketplace_ad_campaign)
      .where(eq(marketplace_ad_campaign.id, Number(id))).limit(1)
    if (!campaign) return notFound('Campaña no encontrada')

    const isAdmin = ['admin', 'superadmin', 'marketing'].includes(session.role)
    if (!isAdmin) {
      const [store] = await db.select({ id: marketplace_store.id })
        .from(marketplace_store).where(eq(marketplace_store.owner_id, Number(session.sub))).limit(1)
      if (!store || store.id !== campaign.store_id) return forbidden()
    }

    const body = await req.json()
    const updates: Record<string, unknown> = { updated_at: new Date() }
    const FIELDS = ['name', 'image_url', 'link_url', 'budget', 'starts_at', 'ends_at']
    for (const f of FIELDS) {
      if (body[f] !== undefined) updates[f] = body[f]
    }
    if (isAdmin && body.state) updates.state = body.state

    const [updated] = await db.update(marketplace_ad_campaign).set(updates)
      .where(eq(marketplace_ad_campaign.id, Number(id))).returning()
    return ok(updated)
  } catch {
    return serverError()
  }
}

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await props.params
    const [campaign] = await db.select().from(marketplace_ad_campaign)
      .where(eq(marketplace_ad_campaign.id, Number(id))).limit(1)
    if (!campaign) return notFound('Campaña no encontrada')

    const isAdmin = ['admin', 'superadmin'].includes(session.role)
    if (!isAdmin) {
      const [store] = await db.select({ id: marketplace_store.id })
        .from(marketplace_store).where(eq(marketplace_store.owner_id, Number(session.sub))).limit(1)
      if (!store || store.id !== campaign.store_id) return forbidden()
      if (!['draft', 'rejected'].includes(campaign.state)) return badRequest('No se puede eliminar una campaña activa')
    }

    await db.delete(marketplace_ad_campaign).where(eq(marketplace_ad_campaign.id, Number(id)))
    return noContent()
  } catch {
    return serverError()
  }
}
