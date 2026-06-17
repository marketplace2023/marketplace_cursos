import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_instructor } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ok, created, unauthorized, forbidden, serverError } from '@/lib/api/response'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['instructor', 'store_owner', 'admin', 'superadmin'].includes(session.role)) return forbidden()

    const [profile] = await db
      .select()
      .from(marketplace_instructor)
      .where(eq(marketplace_instructor.user_id, Number(session.sub)))
      .limit(1)

    return ok(profile ?? null)
  } catch {
    return serverError()
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['instructor', 'store_owner', 'admin', 'superadmin'].includes(session.role)) return forbidden()

    const body = await req.json()
    const ALLOWED_FIELDS = ['headline', 'expertise', 'credentials', 'linkedin_url', 'portfolio_url']

    const [existing] = await db
      .select({ id: marketplace_instructor.id })
      .from(marketplace_instructor)
      .where(eq(marketplace_instructor.user_id, Number(session.sub)))
      .limit(1)

    const fieldValues: Record<string, any> = {}
    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) {
        fieldValues[key] = Array.isArray(body[key]) ? JSON.stringify(body[key]) : body[key]
      }
    }

    if (existing) {
      const [updated] = await db.update(marketplace_instructor)
        .set({ ...fieldValues, updated_at: new Date() })
        .where(eq(marketplace_instructor.id, existing.id))
        .returning()
      return ok(updated)
    } else {
      const [newProfile] = await db.insert(marketplace_instructor).values({
        user_id: Number(session.sub),
        ...fieldValues,
      }).returning()
      return created(newProfile)
    }
  } catch {
    return serverError()
  }
}
