import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaHeadset, FaClock, FaCheck, FaExclamationTriangle } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_support_ticket, res_users } from '@/lib/db/schema'
import { eq, and, count, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export default async function SoportePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['support', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const [openRow] = await db.select({ c: count() }).from(marketplace_support_ticket).where(eq(marketplace_support_ticket.state, 'open'))
  const [inProgressRow] = await db.select({ c: count() }).from(marketplace_support_ticket).where(eq(marketplace_support_ticket.state, 'in_progress'))
  const [urgentRow] = await db.select({ c: count() }).from(marketplace_support_ticket).where(and(eq(marketplace_support_ticket.priority, 'urgent'), eq(marketplace_support_ticket.state, 'open')))
  const [myRow] = await db.select({ c: count() }).from(marketplace_support_ticket).where(eq(marketplace_support_ticket.assigned_to, Number(session.sub)))

  const recent = await db
    .select({
      id: marketplace_support_ticket.id,
      ticket_number: marketplace_support_ticket.ticket_number,
      subject: marketplace_support_ticket.subject,
      state: marketplace_support_ticket.state,
      priority: marketplace_support_ticket.priority,
      category: marketplace_support_ticket.category,
      created_at: marketplace_support_ticket.created_at,
      user_name: res_users.name,
    })
    .from(marketplace_support_ticket)
    .innerJoin(res_users, eq(marketplace_support_ticket.user_id, res_users.id))
    .orderBy(desc(marketplace_support_ticket.created_at))
    .limit(10)

  const STATE_COLORS: Record<string, string> = {
    open: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
    in_progress: 'bg-primary/10 text-primary border-primary/20',
    resolved: 'bg-brand-green/10 text-brand-green border-brand-green/20',
    closed: 'bg-muted text-muted-foreground',
    escalated: 'bg-red-500/10 text-red-500 border-red-500/20',
  }
  const STATE_LABELS: Record<string, string> = {
    open: 'Abierto', in_progress: 'En progreso', resolved: 'Resuelto', closed: 'Cerrado', escalated: 'Escalado', waiting_user: 'Esperando', waiting_store: 'Esperando tienda',
  }
  const PRIORITY_COLORS: Record<string, string> = {
    low: 'text-muted-foreground', normal: 'text-primary', high: 'text-brand-orange', urgent: 'text-red-500',
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Mesa de soporte</h1>
        <p className="text-muted-foreground mt-0.5">Gestión de tickets de atención al usuario</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Abiertos', value: openRow.c, icon: FaClock, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
          { label: 'En progreso', value: inProgressRow.c, icon: FaHeadset, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Urgentes', value: urgentRow.c, icon: FaExclamationTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Mis tickets', value: myRow.c, icon: FaCheck, color: 'text-brand-green', bg: 'bg-brand-green/10' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tickets recientes</h2>
        <Button asChild variant="outline" size="sm" className="text-xs">
          <Link href="/dashboard/soporte/tickets">Ver todos</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {recent.map(t => (
          <Card key={t.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-mono text-xs text-muted-foreground">{t.ticket_number}</span>
                  <Badge className={`text-xs border ${STATE_COLORS[t.state] ?? ''}`}>{STATE_LABELS[t.state] ?? t.state}</Badge>
                  <span className={`text-xs font-medium ${PRIORITY_COLORS[t.priority] ?? ''}`}>{t.priority}</span>
                </div>
                <p className="font-medium text-sm truncate">{t.subject}</p>
                <p className="text-xs text-muted-foreground">{t.user_name} · {formatDate(t.created_at)}</p>
              </div>
              <Button asChild variant="outline" size="sm" className="text-xs h-7 shrink-0">
                <Link href={`/dashboard/soporte/tickets/${t.id}`}>Atender</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
