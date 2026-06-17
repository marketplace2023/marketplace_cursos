import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { mail_notification, res_users } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { ok, unauthorized, forbidden, badRequest, serverError } from '@/lib/api/response'

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['admin', 'superadmin', 'marketing'].includes(session.role)) return forbidden()

    const body = await req.json()
    const { title, message, target, link } = body

    if (!title?.trim()) return badRequest('El título es requerido')
    if (!message?.trim()) return badRequest('El mensaje es requerido')

    const TARGET_MAP: Record<string, string[]> = {
      all: ['buyer', 'store_owner', 'instructor', 'admin', 'superadmin', 'support', 'marketing', 'finance', 'compliance', 'analyst', 'b2b_user'],
      buyers: ['buyer'],
      store_owners: ['store_owner'],
      instructors: ['instructor'],
    }

    const types = TARGET_MAP[target ?? 'all'] ?? TARGET_MAP['all']

    const recipients = await db
      .select({ id: res_users.id })
      .from(res_users)
      .where(inArray(res_users.user_type, types as any[]))
      .limit(5000)

    if (recipients.length === 0) return ok({ sent: 0 })

    const BATCH = 500
    let total = 0
    for (let i = 0; i < recipients.length; i += BATCH) {
      const batch = recipients.slice(i, i + BATCH)
      await db.insert(mail_notification).values(
        batch.map(r => ({
          user_id: r.id,
          type: 'system' as const,
          title: title.trim(),
          body: message.trim(),
          link: link?.trim() ?? null,
        }))
      )
      total += batch.length
    }

    return ok({ sent: total, target: target ?? 'all' })
  } catch {
    return serverError()
  }
}
