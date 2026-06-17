import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { res_users } from '@/lib/db/schema'
import { eq, desc, ilike, or } from 'drizzle-orm'
import { ok, unauthorized, forbidden, serverError } from '@/lib/api/response'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['admin', 'superadmin', 'support'].includes(session.role)) return forbidden()

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim()
    const user_type = searchParams.get('type')
    const state = searchParams.get('state')
    const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 200)
    const offset = Number(searchParams.get('offset') ?? '0')

    let query = db.select({
      id: res_users.id,
      name: res_users.name,
      last_name: res_users.last_name,
      email: res_users.email,
      user_type: res_users.user_type,
      state: res_users.state,
      email_verified: res_users.email_verified,
      kyc_state: res_users.kyc_state,
      created_at: res_users.created_at,
      last_login: res_users.last_login,
    }).from(res_users).$dynamic()

    const conditions: any[] = []
    if (q) conditions.push(or(ilike(res_users.email, `%${q}%`), ilike(res_users.name, `%${q}%`))!)
    if (user_type) conditions.push(eq(res_users.user_type, user_type as any))
    if (state) conditions.push(eq(res_users.state, state as any))

    if (conditions.length > 0) {
      const { and } = await import('drizzle-orm')
      query = query.where(and(...conditions))
    }

    const users = await query.orderBy(desc(res_users.created_at)).limit(limit).offset(offset)
    return ok(users)
  } catch {
    return serverError()
  }
}
