import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_ad_campaign, marketplace_store } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { ok, created, unauthorized, forbidden, badRequest, serverError } from '@/lib/api/response'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const isAdmin = ['admin', 'superadmin', 'marketing'].includes(session.role)
    const isStore = session.role === 'store_owner'
    if (!isAdmin && !isStore) return forbidden()

    let campaigns

    if (isStore) {
      const [store] = await db.select({ id: marketplace_store.id })
        .from(marketplace_store).where(eq(marketplace_store.owner_id, Number(session.sub))).limit(1)
      if (!store) return ok([])
      campaigns = await db.select().from(marketplace_ad_campaign)
        .where(eq(marketplace_ad_campaign.store_id, store.id))
        .orderBy(desc(marketplace_ad_campaign.created_at))
    } else {
      campaigns = await db.select().from(marketplace_ad_campaign)
        .orderBy(desc(marketplace_ad_campaign.created_at))
        .limit(100)
    }

    return ok(campaigns)
  } catch {
    return serverError()
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (session.role !== 'store_owner') return forbidden()

    const [store] = await db.select({ id: marketplace_store.id })
      .from(marketplace_store).where(eq(marketplace_store.owner_id, Number(session.sub))).limit(1)
    if (!store) return badRequest('No tienes una tienda activa')

    const body = await req.json()
    const { name, position, image_url, link_url, budget, starts_at, ends_at } = body
    if (!name || !position) return badRequest('name y position son requeridos')

    const VALID_POSITIONS = ['home_banner', 'catalog_top', 'sidebar', 'course_detail', 'search_top']
    if (!VALID_POSITIONS.includes(position)) return badRequest('Posición inválida')

    const [campaign] = await db.insert(marketplace_ad_campaign).values({
      store_id: store.id,
      name: String(name).trim(),
      position,
      state: 'pending',
      image_url: image_url ?? null,
      link_url: link_url ?? null,
      budget: budget ? String(budget) : null,
      starts_at: starts_at ? new Date(starts_at) : null,
      ends_at: ends_at ? new Date(ends_at) : null,
    }).returning()

    return created(campaign)
  } catch {
    return serverError()
  }
}
