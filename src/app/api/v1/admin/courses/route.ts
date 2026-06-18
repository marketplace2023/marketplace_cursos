import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { product_template, marketplace_store } from '@/lib/db/schema'
import { eq, desc, ilike, and } from 'drizzle-orm'
import { ok, created, unauthorized, forbidden, badRequest, serverError } from '@/lib/api/response'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    + '-' + Date.now().toString(36)
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['store_owner', 'instructor', 'admin', 'superadmin'].includes(session.role)) return forbidden()

    const body = await req.json()
    if (!body.name?.trim()) return badRequest('El título del curso es requerido')

    const userId = Number(session.sub)

    /* Resolve store_id for store_owner */
    let storeId: number | null = null
    if (['store_owner', 'admin', 'superadmin'].includes(session.role)) {
      const [store] = await db.select({ id: marketplace_store.id })
        .from(marketplace_store)
        .where(eq(marketplace_store.owner_id, userId))
        .limit(1)
      storeId = store?.id ?? null
    }

    const slug = toSlug(body.name.trim())

    const [course] = await db.insert(product_template).values({
      name: body.name.trim(),
      subtitle: body.subtitle?.trim() || null,
      description: body.description?.trim() || null,
      slug,
      level: body.level ?? 'all_levels',
      modality: body.modality ?? 'online_async',
      format: body.format ?? 'video',
      language: body.language ?? 'es',
      list_price: body.is_free ? '0.00' : String(Number(body.list_price ?? 0)),
      sale_price: body.sale_price ? String(Number(body.sale_price)) : null,
      is_free: body.is_free ?? false,
      currency: body.currency ?? 'USD',
      has_certificate: body.has_certificate ?? false,
      learning_objectives: body.objectives || body.learning_objectives || null,
      requirements: body.requirements || null,
      target_audience: body.target_audience || null,
      cover_url: body.cover_url || null,
      preview_video_url: body.preview_video_url || null,
      category_id: body.category_id ? Number(body.category_id) : null,
      store_id: storeId,
      instructor_id: session.role === 'instructor' ? userId : null,
      state: 'draft',
    }).returning()

    return created(course)
  } catch (e) {
    console.error('[admin/courses POST]', e)
    return serverError()
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['admin', 'superadmin'].includes(session.role)) return forbidden()

    const { searchParams } = new URL(req.url)
    const state = searchParams.get('state')
    const q = searchParams.get('q')?.trim()
    const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 200)
    const offset = Number(searchParams.get('offset') ?? '0')

    const conditions: any[] = []
    if (state) conditions.push(eq(product_template.state, state as any))
    if (q) conditions.push(ilike(product_template.name, `%${q}%`))

    const courses = await db.select({
      id: product_template.id,
      name: product_template.name,
      slug: product_template.slug,
      state: product_template.state,
      list_price: product_template.list_price,
      level: product_template.level,
      total_students: product_template.total_students,
      rating_avg: product_template.rating_avg,
      created_at: product_template.created_at,
      store_id: product_template.store_id,
      store_name: marketplace_store.name,
    }).from(product_template)
      .innerJoin(marketplace_store, eq(product_template.store_id, marketplace_store.id))
      .where(and(...conditions))
      .orderBy(desc(product_template.created_at))
      .limit(limit)
      .offset(offset)

    return ok(courses)
  } catch {
    return serverError()
  }
}
