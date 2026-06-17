import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { mail_notification } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { ok, unauthorized, serverError } from '@/lib/api/response'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const notifications = await db
      .select()
      .from(mail_notification)
      .where(eq(mail_notification.user_id, Number(session.sub)))
      .orderBy(desc(mail_notification.created_at))
      .limit(50)

    return ok(notifications)
  } catch {
    return serverError()
  }
}
