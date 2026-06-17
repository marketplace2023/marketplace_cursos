import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { res_users } from '@/lib/db/schema'
import { getSession } from '@/lib/auth/session'
import { unauthorized, notFound, serverError, ok } from '@/lib/api/response'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const [user] = await db
      .select({
        id: res_users.id,
        fur_code: res_users.fur_code,
        name: res_users.name,
        last_name: res_users.last_name,
        public_name: res_users.public_name,
        email: res_users.email,
        phone: res_users.phone,
        avatar_url: res_users.avatar_url,
        bio: res_users.bio,
        website: res_users.website,
        user_type: res_users.user_type,
        state: res_users.state,
        email_verified: res_users.email_verified,
        timezone: res_users.timezone,
        language: res_users.language,
        country: res_users.country,
        login_count: res_users.login_count,
        last_login: res_users.last_login,
        created_at: res_users.created_at,
      })
      .from(res_users)
      .where(eq(res_users.id, Number(session.sub)))
      .limit(1)

    if (!user) return notFound('Usuario no encontrado')

    return ok(user)
  } catch (e) {
    console.error('[auth/me]', e)
    return serverError()
  }
}
