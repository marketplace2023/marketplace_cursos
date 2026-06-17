import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_quote } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { ok, created, unauthorized, badRequest, forbidden, serverError } from '@/lib/api/response'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const isAdmin = ['admin', 'superadmin'].includes(session.role)

    const quotes = isAdmin
      ? await db.select().from(marketplace_quote).orderBy(desc(marketplace_quote.created_at)).limit(100)
      : await db.select().from(marketplace_quote).where(eq(marketplace_quote.user_id, Number(session.sub))).orderBy(desc(marketplace_quote.created_at))

    return ok(quotes)
  } catch {
    return serverError()
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await req.json()
    const { company_name, contact_name, contact_email, contact_phone, participants, notes, budget_range } = body

    if (!company_name?.trim()) return badRequest('El nombre de la empresa es requerido')
    if (!contact_email?.trim()) return badRequest('El email de contacto es requerido')

    const [quote] = await db.insert(marketplace_quote).values({
      company_name: company_name.trim(),
      contact_name: contact_name?.trim() ?? null,
      contact_email: contact_email.trim(),
      contact_phone: contact_phone?.trim() ?? null,
      participants: participants ? Number(participants) : null,
      notes: notes?.trim() ?? null,
      budget_range: budget_range?.trim() ?? null,
      state: 'draft',
      user_id: Number(session.sub),
    }).returning()

    return created(quote)
  } catch {
    return serverError()
  }
}
