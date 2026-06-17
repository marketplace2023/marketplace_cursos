import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { product_category } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { ok, created, forbidden, serverError } from '@/lib/api/response'

export async function GET() {
  try {
    const cats = await db.select().from(product_category).where(eq(product_category.active, true)).orderBy(asc(product_category.sort_order), asc(product_category.name))
    return ok(cats)
  } catch {
    return serverError()
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return forbidden()
    if (!['admin', 'superadmin'].includes(session.role)) return forbidden('Solo admins pueden crear categorías')

    const body = await req.json()
    const { name, slug, description, icon, parent_id, featured } = body
    if (!name || !slug) return Response.json({ success: false, error: { code: 'BAD_REQUEST', message: 'name y slug son requeridos' } }, { status: 400 })

    const [cat] = await db.insert(product_category).values({
      name, slug, description, icon, parent_id: parent_id ?? null,
      featured: featured ?? false, active: true, sort_order: 0,
    }).returning()

    return created(cat)
  } catch (e: any) {
    if (e?.code === '23505') return Response.json({ success: false, error: { code: 'CONFLICT', message: 'El slug ya existe' } }, { status: 409 })
    return serverError()
  }
}
