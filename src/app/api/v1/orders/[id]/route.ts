import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { sale_order, sale_order_line, product_template } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { ok, unauthorized, notFound, serverError } from '@/lib/api/response'

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await props.params

    const [order] = await db
      .select()
      .from(sale_order)
      .where(and(eq(sale_order.id, Number(id)), eq(sale_order.buyer_id, Number(session.sub))))
      .limit(1)

    if (!order) return notFound('Pedido no encontrado')

    const lines = await db
      .select({
        id: sale_order_line.id,
        course_id: sale_order_line.course_id,
        name: sale_order_line.name,
        quantity: sale_order_line.quantity,
        unit_price: sale_order_line.unit_price,
        discount_amount: sale_order_line.discount_amount,
        subtotal: sale_order_line.subtotal,
        course_slug: product_template.slug,
        course_image: product_template.cover_url,
      })
      .from(sale_order_line)
      .innerJoin(product_template, eq(sale_order_line.course_id, product_template.id))
      .where(eq(sale_order_line.order_id, Number(id)))

    return ok({ ...order, lines })
  } catch {
    return serverError()
  }
}
