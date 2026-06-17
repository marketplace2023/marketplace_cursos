import { db } from '@/lib/db'
import { product_category } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { ok, notFound, serverError } from '@/lib/api/response'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const [cat] = await db
      .select()
      .from(product_category)
      .where(and(eq(product_category.slug, slug), eq(product_category.active, true)))
      .limit(1)

    if (!cat) return notFound('Categoría no encontrada')
    return ok(cat)
  } catch {
    return serverError()
  }
}
