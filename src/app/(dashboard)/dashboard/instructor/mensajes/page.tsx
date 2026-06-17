import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaEnvelope, FaCircle } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { mail_thread_participant, mail_thread, res_users } from '@/lib/db/schema'
import { eq, desc, and, ne } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'

export default async function InstructorMensajesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const participations = await db
    .select({
      thread_id: mail_thread_participant.thread_id,
      last_read_at: mail_thread_participant.last_read_at,
      thread_subject: mail_thread.subject,
      thread_context_type: mail_thread.context_type,
      thread_updated_at: mail_thread.updated_at,
    })
    .from(mail_thread_participant)
    .innerJoin(mail_thread, eq(mail_thread_participant.thread_id, mail_thread.id))
    .where(eq(mail_thread_participant.user_id, Number(session.sub)))
    .orderBy(desc(mail_thread.updated_at))
    .limit(50)

  const totalUnread = participations.filter(p => !p.last_read_at || p.last_read_at < p.thread_updated_at).length

  const CTX_LABEL: Record<string, string> = {
    student_question: 'Pregunta',
    support: 'Soporte',
    direct: 'Directo',
    course_discussion: 'Discusión',
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Mensajes</h1>
          <p className="text-muted-foreground mt-0.5">{participations.length} conversación{participations.length !== 1 ? 'es' : ''} · {totalUnread} sin leer</p>
        </div>
        <Link href="/dashboard/comprador/mensajes" className="text-xs text-muted-foreground underline hover:text-foreground">
          Ir al centro de mensajes
        </Link>
      </div>

      {participations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaEnvelope className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin mensajes</h3>
          <p className="text-muted-foreground">Las conversaciones con estudiantes y el equipo aparecerán aquí</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {participations.map(p => {
            const hasUnread = !p.last_read_at || p.last_read_at < p.thread_updated_at
            return (
              <Card key={p.thread_id} className={hasUnread ? 'border-primary/30' : ''}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${hasUnread ? 'bg-primary/10' : 'bg-muted'}`}>
                    <FaEnvelope className={`h-4 w-4 ${hasUnread ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {hasUnread && <FaCircle className="h-2 w-2 text-primary shrink-0" />}
                      <p className={`text-sm truncate ${hasUnread ? 'font-semibold' : 'font-medium'}`}>{p.thread_subject || 'Sin asunto'}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {p.thread_context_type && (
                        <Badge variant="outline" className="text-xs h-4 px-1.5">{CTX_LABEL[p.thread_context_type] ?? p.thread_context_type}</Badge>
                      )}
                      <span>{formatDate(p.thread_updated_at)}</span>
                    </div>
                  </div>
                  {hasUnread && (
                    <Badge className="shrink-0 bg-primary text-primary-foreground text-xs h-5 min-w-5 flex items-center justify-center">
                      Nuevo
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
