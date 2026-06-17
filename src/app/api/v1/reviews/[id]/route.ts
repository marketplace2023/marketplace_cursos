import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_review } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { noContent, unauthorized, forbidden, notFound, serverError } from '@/lib/api/response'

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await props.params
    const isAdmin = ['admin', 'superadmin'].includes(session.role)

    const conditions = isAdmin
      ? [eq(marketplace_review.id, Number(id))]
      : [eq(marketplace_review.id, Number(id)), eq(marketplace_review.user_id, Number(session.sub))]

    const [existing] = await db.select({ id: marketplace_review.id }).from(marketplace_review).where(and(...conditions)).limit(1)
    if (!existing) return notFound('Reseña no encontrada')

    await db.delete(marketplace_review).where(eq(marketplace_review.id, Number(id)))
    return noContent()
  } catch {
    return serverError()
  }
}
