import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { mail_notification } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ok, unauthorized, serverError } from '@/lib/api/response'

export async function POST() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    await db.update(mail_notification)
      .set({ read: true, read_at: new Date() })
      .where(eq(mail_notification.user_id, Number(session.sub)))

    return ok(null, 'Todas las notificaciones marcadas como leídas')
  } catch {
    return serverError()
  }
}
