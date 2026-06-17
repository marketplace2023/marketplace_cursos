import { redirect } from 'next/navigation'
import { FaBell, FaCheckDouble } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { mail_notification } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

const TYPE_COLORS: Record<string, string> = {
  sale: 'bg-brand-green/10 text-brand-green',
  enrollment: 'bg-primary/10 text-primary',
  review: 'bg-brand-orange/10 text-brand-orange',
  certificate: 'bg-brand-purple/10 text-brand-purple',
  message: 'bg-brand-secondary/10 text-brand-secondary',
  ticket: 'bg-destructive/10 text-destructive',
  system: 'bg-muted text-muted-foreground',
  payment: 'bg-brand-green/10 text-brand-green',
  marketing: 'bg-brand-orange/10 text-brand-orange',
  moderation: 'bg-destructive/10 text-destructive',
}

const TYPE_LABELS: Record<string, string> = {
  sale: 'Venta', enrollment: 'Inscripción', review: 'Reseña', certificate: 'Certificado',
  message: 'Mensaje', ticket: 'Soporte', system: 'Sistema', payment: 'Pago',
  marketing: 'Promoción', moderation: 'Moderación',
}

export default async function NotificacionesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const notifs = await db
    .select()
    .from(mail_notification)
    .where(eq(mail_notification.user_id, Number(session.sub)))
    .orderBy(desc(mail_notification.created_at))
    .limit(50)

  const unread = notifs.filter(n => !n.read).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Notificaciones</h1>
          <p className="text-muted-foreground mt-0.5">
            {unread > 0 ? `${unread} sin leer` : 'Todo al día'}
          </p>
        </div>
        {unread > 0 && (
          <form action="/api/v1/notifications/read-all" method="POST">
            <Button type="submit" variant="outline" size="sm" className="gap-2">
              <FaCheckDouble className="h-3.5 w-3.5" /> Marcar todas como leídas
            </Button>
          </form>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaBell className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin notificaciones</h3>
          <p className="text-muted-foreground">Te avisaremos aquí cuando haya novedades</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifs.map(n => (
            <Card key={n.id} className={`transition-colors ${!n.read ? 'border-primary/30 bg-primary/2' : ''}`}>
              <CardContent className="flex items-start gap-4 p-4">
                <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">{n.title}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{formatDate(n.created_at)}</span>
                  </div>
                  {n.body && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`text-xs border-0 ${TYPE_COLORS[n.type] ?? TYPE_COLORS.system}`}>
                      {TYPE_LABELS[n.type] ?? n.type}
                    </Badge>
                    {n.link && (
                      <a href={n.link} className="text-xs text-primary hover:underline">Ver más →</a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
