import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { product_template } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ok, unauthorized, forbidden, notFound, serverError } from '@/lib/api/response'

export async function POST(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['admin', 'superadmin'].includes(session.role)) return forbidden()

    const { id } = await props.params
    const [course] = await db.select({ id: product_template.id }).from(product_template).where(eq(product_template.id, Number(id))).limit(1)
    if (!course) return notFound('Curso no encontrado')

    const [updated] = await db.update(product_template)
      .set({ state: 'published', published_at: new Date() })
      .where(eq(product_template.id, Number(id)))
      .returning({ id: product_template.id, state: product_template.state })

    return ok(updated)
  } catch {
    return serverError()
  }
}
