import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_coupon } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { noContent, unauthorized, forbidden, notFound, serverError } from '@/lib/api/response'

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['admin', 'superadmin', 'marketing'].includes(session.role)) return forbidden()

    const { id } = await props.params
    const [existing] = await db.select({ id: marketplace_coupon.id }).from(marketplace_coupon).where(eq(marketplace_coupon.id, Number(id))).limit(1)
    if (!existing) return notFound('Cupón no encontrado')

    await db.update(marketplace_coupon).set({ active: false }).where(eq(marketplace_coupon.id, Number(id)))
    return noContent()
  } catch {
    return serverError()
  }
}
