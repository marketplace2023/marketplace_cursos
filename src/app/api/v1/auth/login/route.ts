import { z } from 'zod'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { res_users } from '@/lib/db/schema'
import { createSession } from '@/lib/auth/session'
import { badRequest, unauthorized, serverError, ok } from '@/lib/api/response'
import type { UserRole } from '@/lib/auth/session'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest('Datos inválidos', parsed.error.issues)

    const { email, password } = parsed.data

    const [user] = await db
      .select()
      .from(res_users)
      .where(eq(res_users.email, email.toLowerCase()))
      .limit(1)

    if (!user) return unauthorized('Credenciales incorrectas')

    if (user.state === 'blocked' || user.state === 'deleted') {
      return unauthorized('Cuenta bloqueada o eliminada')
    }

    if (user.locked_until && user.locked_until > new Date()) {
      return unauthorized('Cuenta bloqueada temporalmente. Intenta más tarde.')
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      await db
        .update(res_users)
        .set({
          failed_login_count: (user.failed_login_count ?? 0) + 1,
          last_failed_login: new Date(),
          ...(((user.failed_login_count ?? 0) + 1) >= 5 && {
            locked_until: new Date(Date.now() + 15 * 60 * 1000),
          }),
        })
        .where(eq(res_users.id, user.id))
      return unauthorized('Credenciales incorrectas')
    }

    /* reset failed attempts on success */
    await db
      .update(res_users)
      .set({
        failed_login_count: 0,
        last_failed_login: null,
        locked_until: null,
        last_login: new Date(),
        login_count: (user.login_count ?? 0) + 1,
        state: user.state === 'draft' ? 'active' : user.state,
      })
      .where(eq(res_users.id, user.id))

    await createSession({
      sub: String(user.id),
      email: user.email,
      name: user.name,
      role: user.user_type as UserRole,
    })

    return ok({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.user_type,
      avatar_url: user.avatar_url,
    }, 'Sesión iniciada')
  } catch (e) {
    console.error('[auth/login]', e)
    return serverError()
  }
}
