import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_support_ticket } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { ok, created, unauthorized, badRequest, serverError } from '@/lib/api/response'
import { generateCode } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const tickets = await db
      .select()
      .from(marketplace_support_ticket)
      .where(eq(marketplace_support_ticket.user_id, Number(session.sub)))
      .orderBy(desc(marketplace_support_ticket.created_at))

    return ok(tickets)
  } catch {
    return serverError()
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await req.json()
    const { subject, description, category } = body

    if (!subject?.trim()) return badRequest('El asunto es requerido')
    if (!description?.trim()) return badRequest('La descripción es requerida')

    const ticket_number = `TKT-${generateCode('', 8).toUpperCase()}`

    const [ticket] = await db
      .insert(marketplace_support_ticket)
      .values({
        ticket_number,
        user_id: Number(session.sub),
        subject: subject.trim(),
        description: description.trim(),
        category: category ?? 'other',
        state: 'open',
        priority: 'normal',
      })
      .returning()

    return created(ticket)
  } catch {
    return serverError()
  }
}
