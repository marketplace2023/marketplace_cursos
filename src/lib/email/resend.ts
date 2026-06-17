import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM ?? 'EduMarket <noreply@edumarket.com>'
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'EduMarket'

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetUrl = `${BASE}/nueva-contrasena?token=${token}`
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Restablece tu contraseña — ${APP_NAME}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#1a1a2e;">Hola, ${name}</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en ${APP_NAME}.</p>
        <p>Haz clic en el botón para crear una nueva contraseña. Este enlace expira en 1 hora.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetUrl}" style="background:#6c63ff;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
            Restablecer contraseña
          </a>
        </div>
        <p style="color:#666;font-size:13px;">Si no solicitaste esto, ignora este correo. Tu contraseña no cambiará.</p>
        <p style="color:#999;font-size:12px;">O copia este enlace en tu navegador:<br>${resetUrl}</p>
      </div>
    `,
  })
}

export async function sendVerifyEmail(to: string, name: string, token: string) {
  const verifyUrl = `${BASE}/verificar?token=${token}`
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Confirma tu correo — ${APP_NAME}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#1a1a2e;">Bienvenido/a a ${APP_NAME}, ${name}</h2>
        <p>Gracias por registrarte. Confirma tu correo electrónico haciendo clic en el botón:</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${verifyUrl}" style="background:#6c63ff;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
            Verificar correo
          </a>
        </div>
        <p style="color:#666;font-size:13px;">Este enlace expira en 24 horas.</p>
        <p style="color:#999;font-size:12px;">O copia este enlace:<br>${verifyUrl}</p>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `¡Bienvenido/a a ${APP_NAME}!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#1a1a2e;">¡Hola, ${name}! 🎉</h2>
        <p>Tu cuenta en ${APP_NAME} está lista. Ya puedes explorar miles de cursos de las mejores academias.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${BASE}/cursos" style="background:#6c63ff;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
            Explorar cursos
          </a>
        </div>
      </div>
    `,
  })
}
