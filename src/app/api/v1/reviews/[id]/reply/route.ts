import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { marketplace_review, marketplace_review_reply, marketplace_store } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { unauthorized, forbidden, notFound, badRequest, serverError, ok, created } from '@/lib/api/response'

const schema = z.object({ comment: z.string().min(1).max(2000) })

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    if (!['store_owner', 'admin', 'superadmin'].includes(session.role)) return forbidden()

    const { id } = await params
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest('Datos inválidos', parsed.error.issues)

    const [review] = await db
      .select({ id: marketplace_review.id, store_id: marketplace_review.store_id })
      .from(marketplace_review)
      .where(eq(marketplace_review.id, Number(id)))
      .limit(1)

    if (!review) return notFound('Reseña no encontrada')

    /* Verify that the session user owns the store being replied from */
    if (!['admin', 'superadmin'].includes(session.role)) {
      const [store] = await db
        .select({ id: marketplace_store.id })
        .from(marketplace_store)
        .where(and(eq(marketplace_store.owner_id, Number(session.sub)), eq(marketplace_store.id, review.store_id ?? -1)))
        .limit(1)
      if (!store) return forbidden('No tienes permisos sobre esta tienda')
    }

    /* Upsert reply (one reply per review per store) */
    const existingReply = await db
      .select({ id: marketplace_review_reply.id })
      .from(marketplace_review_reply)
      .where(eq(marketplace_review_reply.review_id, Number(id)))
      .limit(1)

    if (existingReply.length > 0) {
      const [updated] = await db
        .update(marketplace_review_reply)
        .set({ comment: parsed.data.comment, updated_at: new Date() })
        .where(eq(marketplace_review_reply.id, existingReply[0].id))
        .returning()
      return ok(updated)
    }

    const [reply] = await db.insert(marketplace_review_reply).values({
      review_id: Number(id),
      store_id: review.store_id ?? 0,
      replied_by: Number(session.sub),
      comment: parsed.data.comment,
    }).returning()

    return created(reply)
  } catch {
    return serverError()
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['store_owner', 'admin', 'superadmin'].includes(session.role)) return forbidden()

    const { id } = await params
    await db.delete(marketplace_review_reply)
      .where(eq(marketplace_review_reply.review_id, Number(id)))

    return ok(null, 'Respuesta eliminada')
  } catch {
    return serverError()
  }
}
