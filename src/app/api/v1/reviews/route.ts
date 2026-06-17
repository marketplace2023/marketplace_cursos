import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_review, product_template, res_users } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { ok, created, unauthorized, badRequest, conflict, serverError } from '@/lib/api/response'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { searchParams } = new URL(req.url)
    const course_id = searchParams.get('course_id')

    const conditions = [eq(marketplace_review.user_id, Number(session.sub))]
    if (course_id) conditions.push(eq(marketplace_review.course_id, Number(course_id)))

    const reviews = await db
      .select({
        id: marketplace_review.id,
        rating: marketplace_review.rating,
        comment: marketplace_review.comment,
        state: marketplace_review.state,
        created_at: marketplace_review.created_at,
        course_id: marketplace_review.course_id,
        course_name: product_template.name,
        course_slug: product_template.slug,
      })
      .from(marketplace_review)
      .innerJoin(product_template, eq(marketplace_review.course_id, product_template.id))
      .where(and(...conditions))
      .orderBy(desc(marketplace_review.created_at))

    return ok(reviews)
  } catch {
    return serverError()
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await req.json()
    const { course_id, rating, comment } = body

    if (!course_id) return badRequest('course_id es requerido')
    if (!rating || rating < 1 || rating > 5) return badRequest('rating debe ser entre 1 y 5')

    const [existing] = await db
      .select({ id: marketplace_review.id })
      .from(marketplace_review)
      .where(and(eq(marketplace_review.user_id, Number(session.sub)), eq(marketplace_review.course_id, Number(course_id))))
      .limit(1)

    if (existing) return conflict('Ya enviaste una reseña para este curso')

    const [review] = await db
      .insert(marketplace_review)
      .values({
        user_id: Number(session.sub),
        course_id: Number(course_id),
        rating: Number(rating),
        comment: comment?.trim() ?? null,
        state: 'pending',
        verified_purchase: false,
      })
      .returning()

    return created(review)
  } catch {
    return serverError()
  }
}
