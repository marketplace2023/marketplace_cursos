import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { res_users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ok, unauthorized, forbidden, notFound, serverError } from '@/lib/api/response'

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await props.params
    const userId = Number(id)

    const isAdmin = ['admin', 'superadmin', 'support'].includes(session.role)
    if (!isAdmin && Number(session.sub) !== userId) return forbidden()

    const [user] = await db.select({
      id: res_users.id,
      name: res_users.name,
      last_name: res_users.last_name,
      email: res_users.email,
      phone: res_users.phone,
      avatar_url: res_users.avatar_url,
      bio: res_users.bio,
      user_type: res_users.user_type,
      state: res_users.state,
      email_verified: res_users.email_verified,
      kyc_state: res_users.kyc_state,
      created_at: res_users.created_at,
      last_login: res_users.last_login,
    }).from(res_users).where(eq(res_users.id, userId)).limit(1)

    if (!user) return notFound('Usuario no encontrado')
    return ok(user)
  } catch {
    return serverError()
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { id } = await props.params
    const userId = Number(id)

    const isAdmin = ['admin', 'superadmin'].includes(session.role)
    if (!isAdmin && Number(session.sub) !== userId) return forbidden()

    const body = await req.json()

    const ALLOWED_FIELDS = ['name', 'last_name', 'public_name', 'phone', 'avatar_url', 'bio', 'website', 'timezone', 'language', 'country', 'marketing_consent']
    const ADMIN_ONLY_FIELDS = ['user_type', 'state', 'email_verified', 'kyc_state']

    const updates: Record<string, any> = { updated_at: new Date() }
    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) updates[key] = body[key]
    }
    if (isAdmin) {
      for (const key of ADMIN_ONLY_FIELDS) {
        if (body[key] !== undefined) updates[key] = body[key]
      }
    }

    const [updated] = await db.update(res_users).set(updates).where(eq(res_users.id, userId)).returning({
      id: res_users.id, name: res_users.name, email: res_users.email, user_type: res_users.user_type, state: res_users.state,
    })

    return ok(updated)
  } catch {
    return serverError()
  }
}
