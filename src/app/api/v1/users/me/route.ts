import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { res_users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ok, unauthorized, serverError } from '@/lib/api/response'

export async function PATCH(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const body = await req.json()
    const { name, last_name, public_name, username, phone, bio, website, timezone, language, country } = body

    const updates: Record<string, unknown> = {}
    if (name) updates.name = String(name).trim()
    if (last_name !== undefined) updates.last_name = String(last_name).trim() || null
    if (public_name !== undefined) updates.public_name = String(public_name).trim() || null
    if (username !== undefined) updates.username = String(username).trim() || null
    if (phone !== undefined) updates.phone = String(phone).trim() || null
    if (bio !== undefined) updates.bio = String(bio).trim() || null
    if (website !== undefined) updates.website = String(website).trim() || null
    if (timezone) updates.timezone = String(timezone)
    if (language) updates.language = String(language)
    if (country) updates.country = String(country)
    updates.updated_at = new Date()

    const [user] = await db
      .update(res_users)
      .set(updates)
      .where(eq(res_users.id, Number(session.sub)))
      .returning({
        id: res_users.id, name: res_users.name, last_name: res_users.last_name,
        public_name: res_users.public_name, username: res_users.username,
        email: res_users.email, phone: res_users.phone, bio: res_users.bio,
        website: res_users.website, timezone: res_users.timezone,
        language: res_users.language, country: res_users.country,
      })

    return ok(user)
  } catch {
    return serverError()
  }
}
