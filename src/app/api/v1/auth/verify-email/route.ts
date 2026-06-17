import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { res_users } from '@/lib/db/schema'
import { badRequest, notFound, serverError, ok } from '@/lib/api/response'

const schema = z.object({ token: z.string().min(1) })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest('Token inválido')

    const [user] = await db
      .select({ id: res_users.id, email_verified: res_users.email_verified })
      .from(res_users)
      .where(eq(res_users.email_verify_token, parsed.data.token))
      .limit(1)

    if (!user) return notFound('Token inválido o expirado')
    if (user.email_verified) return ok(null, 'Correo ya verificado')

    await db
      .update(res_users)
      .set({ email_verified: true, email_verify_token: null })
      .where(eq(res_users.id, user.id))

    return ok(null, 'Correo verificado exitosamente')
  } catch (e) {
    console.error('[auth/verify-email]', e)
    return serverError()
  }
}
