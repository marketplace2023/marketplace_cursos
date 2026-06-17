import { z } from 'zod'
import { eq, and, gt } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { res_users } from '@/lib/db/schema'
import { badRequest, notFound, serverError, ok } from '@/lib/api/response'

const schema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest('Datos inválidos', parsed.error.issues)

    const { token, password } = parsed.data

    const [user] = await db
      .select({ id: res_users.id })
      .from(res_users)
      .where(
        and(
          eq(res_users.password_reset_token, token),
          gt(res_users.password_reset_expires, new Date()),
        )
      )
      .limit(1)

    if (!user) return notFound('Token inválido o expirado')

    const password_hash = await bcrypt.hash(password, 12)

    await db
      .update(res_users)
      .set({
        password_hash,
        password_reset_token: null,
        password_reset_expires: null,
        failed_login_count: 0,
        locked_until: null,
      })
      .where(eq(res_users.id, user.id))

    return ok(null, 'Contraseña actualizada exitosamente')
  } catch (e) {
    console.error('[auth/reset-password]', e)
    return serverError()
  }
}
