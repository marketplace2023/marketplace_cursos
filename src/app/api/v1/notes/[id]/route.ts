import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { marketplace_note } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { unauthorized, forbidden, notFound, badRequest, serverError, ok } from '@/lib/api/response'

const schema = z.object({ content: z.string().min(1).max(5000) })

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await params
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest('Datos inválidos')

    const [note] = await db.select().from(marketplace_note)
      .where(eq(marketplace_note.id, Number(id))).limit(1)
    if (!note) return notFound('Nota no encontrada')
    if (note.user_id !== Number(session.sub)) return forbidden()

    const [updated] = await db.update(marketplace_note)
      .set({ content: parsed.data.content, updated_at: new Date() })
      .where(eq(marketplace_note.id, Number(id)))
      .returning()

    return ok(updated)
  } catch {
    return serverError()
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await params

    const [note] = await db.select({ user_id: marketplace_note.user_id })
      .from(marketplace_note).where(eq(marketplace_note.id, Number(id))).limit(1)
    if (!note) return notFound('Nota no encontrada')
    if (note.user_id !== Number(session.sub)) return forbidden()

    await db.delete(marketplace_note).where(and(
      eq(marketplace_note.id, Number(id)),
      eq(marketplace_note.user_id, Number(session.sub))
    ))

    return ok(null, 'Nota eliminada')
  } catch {
    return serverError()
  }
}
