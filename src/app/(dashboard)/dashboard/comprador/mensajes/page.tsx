import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaComments, FaCircle } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { mail_thread, mail_thread_participant, mail_message, res_users } from '@/lib/db/schema'
import { eq, desc, and, sql } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export default async function MensajesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const userId = Number(session.sub)

  const threads = await db
    .selectDistinct({
      thread_id: mail_thread_participant.thread_id,
      subject: mail_thread.subject,
      context_type: mail_thread.context_type,
      updated_at: mail_thread.updated_at,
      last_read_at: mail_thread_participant.last_read_at,
    })
    .from(mail_thread_participant)
    .innerJoin(mail_thread, eq(mail_thread_participant.thread_id, mail_thread.id))
    .where(eq(mail_thread_participant.user_id, userId))
    .orderBy(desc(mail_thread.updated_at))
    .limit(30)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Mensajes</h1>
        <p className="text-muted-foreground mt-0.5">{threads.length} conversacion{threads.length !== 1 ? 'es' : ''}</p>
      </div>

      {threads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaComments className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin mensajes</h3>
          <p className="text-muted-foreground">Puedes contactar a las tiendas desde la ficha de cualquier curso</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {threads.map(t => {
            const hasUnread = t.last_read_at && t.updated_at > t.last_read_at
            return (
              <Link key={t.thread_id} href={`/dashboard/comprador/mensajes/${t.thread_id}`}>
                <Card className={`hover:shadow-md transition-all cursor-pointer ${hasUnread ? 'border-primary/30' : ''}`}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-brand-secondary/10 text-brand-secondary">
                        <FaComments className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${hasUnread ? 'font-semibold' : 'font-medium'}`}>
                          {t.subject ?? 'Conversación'}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0">{formatDate(t.updated_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {t.context_type && (
                          <Badge variant="secondary" className="text-xs capitalize">{t.context_type}</Badge>
                        )}
                        {hasUnread && <FaCircle className="h-2 w-2 text-primary" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
