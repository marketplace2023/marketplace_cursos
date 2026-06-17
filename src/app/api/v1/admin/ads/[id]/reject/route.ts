import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_ad_campaign } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ok, unauthorized, forbidden, notFound, serverError } from '@/lib/api/response'

export async function POST(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['admin', 'superadmin', 'marketing'].includes(session.role)) return forbidden()

    const { id } = await props.params
    const [existing] = await db.select({ id: marketplace_ad_campaign.id }).from(marketplace_ad_campaign).where(eq(marketplace_ad_campaign.id, Number(id))).limit(1)
    if (!existing) return notFound('Campaña no encontrada')

    const [updated] = await db.update(marketplace_ad_campaign)
      .set({ state: 'rejected', reviewed_by: Number(session.sub), reviewed_at: new Date() })
      .where(eq(marketplace_ad_campaign.id, Number(id)))
      .returning({ id: marketplace_ad_campaign.id, state: marketplace_ad_campaign.state })

    return ok(updated)
  } catch {
    return serverError()
  }
}
