import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { res_users } from '@/lib/db/schema'
import { badRequest, serverError, ok } from '@/lib/api/response'
import { generateCode } from '@/lib/utils'
import { sendPasswordResetEmail } from '@/lib/email/resend'

const schema = z.object({ email: z.string().email() })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest('Correo inválido')

    const [user] = await db
      .select({ id: res_users.id, name: res_users.name, email: res_users.email })
      .from(res_users)
      .where(eq(res_users.email, parsed.data.email.toLowerCase()))
      .limit(1)

    /* Always return OK to avoid email enumeration */
    if (!user) return ok(null, 'Si el correo existe, recibirás un enlace')

    const token = generateCode('', 40)
    const expires = new Date(Date.now() + 60 * 60 * 1000) /* 1 hour */

    await db
      .update(res_users)
      .set({ password_reset_token: token, password_reset_expires: expires })
      .where(eq(res_users.id, user.id))

    if (process.env.RESEND_API_KEY) {
      await sendPasswordResetEmail(user.email, user.name, token)
    } else {
      console.info(`[forgot-password] reset token for user ${user.id}: ${token}`)
    }

    return ok(null, 'Si el correo existe, recibirás un enlace')
  } catch (e) {
    console.error('[auth/forgot-password]', e)
    return serverError()
  }
}
