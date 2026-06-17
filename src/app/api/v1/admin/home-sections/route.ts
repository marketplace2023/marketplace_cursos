import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_home_section } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import { ok, unauthorized, forbidden, serverError } from '@/lib/api/response'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['admin', 'superadmin', 'marketing'].includes(session.role)) return forbidden()

    const sections = await db
      .select()
      .from(marketplace_home_section)
      .orderBy(asc(marketplace_home_section.sort_order))

    return ok(sections)
  } catch {
    return serverError()
  }
}
