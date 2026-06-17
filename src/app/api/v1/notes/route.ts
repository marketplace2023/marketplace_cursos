import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { marketplace_note, product_template } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { unauthorized, badRequest, serverError, ok, created } from '@/lib/api/response'

const schema = z.object({
  course_id: z.number().int().positive(),
  lesson_id: z.number().int().positive().optional(),
  content: z.string().min(1).max(5000),
})

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const url = new URL(req.url)
    const courseId = url.searchParams.get('course_id')

    const userId = Number(session.sub)

    const conditions = [eq(marketplace_note.user_id, userId)]
    if (courseId) conditions.push(eq(marketplace_note.course_id, Number(courseId)))

    const notes = await db
      .select({
        id: marketplace_note.id,
        course_id: marketplace_note.course_id,
        course_name: product_template.name,
        course_slug: product_template.slug,
        lesson_id: marketplace_note.lesson_id,
        content: marketplace_note.content,
        created_at: marketplace_note.created_at,
        updated_at: marketplace_note.updated_at,
      })
      .from(marketplace_note)
      .leftJoin(product_template, eq(product_template.id, marketplace_note.course_id))
      .where(and(...conditions))
      .orderBy(desc(marketplace_note.updated_at))

    return ok(notes)
  } catch {
    return serverError()
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest('Datos inválidos', parsed.error.issues)

    const userId = Number(session.sub)

    const [note] = await db.insert(marketplace_note).values({
      user_id: userId,
      course_id: parsed.data.course_id,
      lesson_id: parsed.data.lesson_id ?? null,
      content: parsed.data.content,
    }).returning()

    return created(note)
  } catch {
    return serverError()
  }
}
