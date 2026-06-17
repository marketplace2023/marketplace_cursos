import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { res_users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { ok, unauthorized, badRequest, serverError } from '@/lib/api/response'

export async function PATCH(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { current_password, new_password } = await req.json()
    if (!current_password || !new_password) return badRequest('Faltan campos requeridos')
    if (new_password.length < 8) return badRequest('La contraseña debe tener al menos 8 caracteres')

    const [user] = await db.select({ password_hash: res_users.password_hash })
      .from(res_users).where(eq(res_users.id, Number(session.sub))).limit(1)

    if (!user) return unauthorized()

    const valid = await bcrypt.compare(current_password, user.password_hash)
    if (!valid) return badRequest('La contraseña actual es incorrecta')

    const hash = await bcrypt.hash(new_password, 12)
    await db.update(res_users)
      .set({ password_hash: hash, updated_at: new Date(), failed_login_count: 0 })
      .where(eq(res_users.id, Number(session.sub)))

    return ok(null, 'Contraseña actualizada')
  } catch {
    return serverError()
  }
}
