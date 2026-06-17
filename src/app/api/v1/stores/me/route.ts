import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_store } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ok, unauthorized, forbidden, notFound, serverError } from '@/lib/api/response'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['store_owner', 'admin', 'superadmin'].includes(session.role)) return forbidden()

    const [store] = await db
      .select()
      .from(marketplace_store)
      .where(eq(marketplace_store.owner_id, Number(session.sub)))
      .limit(1)

    if (!store) return notFound('No tienes una tienda registrada')
    return ok(store)
  } catch {
    return serverError()
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['store_owner', 'admin', 'superadmin'].includes(session.role)) return forbidden()

    const [store] = await db
      .select({ id: marketplace_store.id })
      .from(marketplace_store)
      .where(eq(marketplace_store.owner_id, Number(session.sub)))
      .limit(1)

    if (!store) return notFound('No tienes una tienda registrada')

    const body = await req.json()
    const ALLOWED_FIELDS = ['name', 'description', 'logo_url', 'cover_url', 'email', 'phone', 'website', 'country', 'state_province', 'city', 'address', 'zip', 'modality', 'languages', 'social_links', 'refund_policy', 'support_policy', 'meta_title', 'meta_description']

    const updates: Record<string, any> = { updated_at: new Date() }
    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) updates[key] = body[key]
    }

    const [updated] = await db.update(marketplace_store).set(updates).where(eq(marketplace_store.id, store.id)).returning()
    return ok(updated)
  } catch {
    return serverError()
  }
}
