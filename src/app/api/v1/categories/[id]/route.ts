import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { product_category } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { noContent, forbidden, notFound, serverError } from '@/lib/api/response'

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return forbidden()
    if (!['admin', 'superadmin'].includes(session.role)) return forbidden('Solo admins pueden eliminar categorías')

    const { id } = await props.params
    const [existing] = await db.select({ id: product_category.id }).from(product_category).where(eq(product_category.id, Number(id))).limit(1)
    if (!existing) return notFound('Categoría no encontrada')

    await db.update(product_category).set({ active: false }).where(eq(product_category.id, Number(id)))
    return noContent()
  } catch {
    return serverError()
  }
}
