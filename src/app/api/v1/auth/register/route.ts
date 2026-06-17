import { z } from 'zod'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { res_users } from '@/lib/db/schema'
import { createSession } from '@/lib/auth/session'
import { badRequest, conflict, serverError, created } from '@/lib/api/response'
import { generateCode } from '@/lib/utils'
import { sendVerifyEmail } from '@/lib/email/resend'

const schema = z.object({
  name: z.string().min(2).max(150),
  last_name: z.string().min(2).max(150).optional(),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  terms_accepted: z.literal(true, { error: 'Debes aceptar los términos' }),
  marketing_consent: z.boolean().optional().default(false),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest('Datos inválidos', parsed.error.issues)

    const { name, last_name, email, password, marketing_consent } = parsed.data

    const [existing] = await db
      .select({ id: res_users.id })
      .from(res_users)
      .where(eq(res_users.email, email.toLowerCase()))
      .limit(1)

    if (existing) return conflict('Ya existe una cuenta con ese correo')

    const password_hash = await bcrypt.hash(password, 12)
    const fur_code = `FUR-U-${generateCode('', 10)}`
    const email_verify_token = generateCode('', 32)

    const [user] = await db
      .insert(res_users)
      .values({
        fur_code,
        name,
        last_name: last_name ?? null,
        email: email.toLowerCase(),
        password_hash,
        user_type: 'buyer',
        state: 'active',
        email_verified: false,
        email_verify_token,
        terms_accepted: true,
        terms_accepted_at: new Date(),
        privacy_accepted: true,
        marketing_consent: marketing_consent ?? false,
      })
      .returning()

    await createSession({
      sub: String(user.id),
      email: user.email,
      name: user.name,
      role: 'buyer',
    })

    if (process.env.RESEND_API_KEY) {
      await sendVerifyEmail(user.email, user.name, email_verify_token).catch(() => {})
    }

    return created({
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'buyer',
    }, 'Cuenta creada exitosamente')
  } catch (e) {
    console.error('[auth/register]', e)
    return serverError()
  }
}
