import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_review } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ok, unauthorized, forbidden, notFound, serverError } from '@/lib/api/response'

export async function POST(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['admin', 'superadmin'].includes(session.role)) return forbidden()

    const { id } = await props.params
    const [existing] = await db.select({ id: marketplace_review.id }).from(marketplace_review).where(eq(marketplace_review.id, Number(id))).limit(1)
    if (!existing) return notFound('Reseña no encontrada')

    const [updated] = await db.update(marketplace_review)
      .set({ state: 'published', moderated_by: Number(session.sub), moderated_at: new Date() })
      .where(eq(marketplace_review.id, Number(id)))
      .returning({ id: marketplace_review.id, state: marketplace_review.state })

    return ok(updated)
  } catch {
    return serverError()
  }
}
