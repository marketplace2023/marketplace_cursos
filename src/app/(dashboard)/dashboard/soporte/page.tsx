import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FaHeadset, FaClock, FaCheck, FaExclamationTriangle,
  FaChevronRight, FaArrowRight,
} from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_support_ticket, res_users } from '@/lib/db/schema'
import { eq, and, count, desc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NumberTicker } from '@/components/ui/number-ticker'
import { formatDate } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  open: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  resolved: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  closed: 'bg-muted text-muted-foreground border-border',
  escalated: 'bg-destructive/10 text-destructive border-destructive/20',
  waiting_user: 'bg-brand-purple/10 text-brand-purple border-brand-purple/20',
  waiting_store: 'bg-brand-purple/10 text-brand-purple border-brand-purple/20',
}
const STATE_LABELS: Record<string, string> = {
  open: 'Abierto', in_progress: 'En progreso', resolved: 'Resuelto',
  closed: 'Cerrado', escalated: 'Escalado', waiting_user: 'Esp. usuario', waiting_store: 'Esp. tienda',
}
const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-muted text-muted-foreground border-border',
  normal: 'bg-primary/8 text-primary border-primary/15',
  high: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  urgent: 'bg-destructive/10 text-destructive border-destructive/20',
}
const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja', normal: 'Normal', high: 'Alta', urgent: 'Urgente',
}

export default async function SoportePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['support', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const [[openRow], [inProgressRow], [urgentRow], [myRow], recent] = await Promise.all([
    db.select({ c: count() }).from(marketplace_support_ticket).where(eq(marketplace_support_ticket.state, 'open')),
    db.select({ c: count() }).from(marketplace_support_ticket).where(eq(marketplace_support_ticket.state, 'in_progress')),
    db.select({ c: count() }).from(marketplace_support_ticket).where(and(eq(marketplace_support_ticket.priority, 'urgent'), eq(marketplace_support_ticket.state, 'open'))),
    db.select({ c: count() }).from(marketplace_support_ticket).where(eq(marketplace_support_ticket.assigned_to, Number(session.sub))),
    db.select({
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
      .limit(10),
  ])

  const STATS = [
    { label: 'Abiertos', value: openRow.c, icon: FaClock, gradient: openRow.c > 0 ? 'from-brand-orange/10 to-brand-orange/5' : 'from-muted/50 to-muted/30', iconBg: openRow.c > 0 ? 'bg-brand-orange' : 'bg-muted-foreground/40', textColor: openRow.c > 0 ? 'text-brand-orange' : 'text-muted-foreground' },
    { label: 'En progreso', value: inProgressRow.c, icon: FaHeadset, gradient: 'from-primary/8 to-brand-secondary/5', iconBg: 'bg-primary', textColor: 'text-primary' },
    { label: 'Urgentes', value: urgentRow.c, icon: FaExclamationTriangle, gradient: urgentRow.c > 0 ? 'from-destructive/10 to-destructive/5' : 'from-muted/50 to-muted/30', iconBg: urgentRow.c > 0 ? 'bg-destructive' : 'bg-muted-foreground/40', textColor: urgentRow.c > 0 ? 'text-destructive' : 'text-muted-foreground' },
    { label: 'Mis tickets', value: myRow.c, icon: FaCheck, gradient: 'from-brand-green/10 to-brand-green/5', iconBg: 'bg-brand-green', textColor: 'text-brand-green' },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-brand-secondary to-primary/60 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-black/10" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/70 font-medium">Soporte</p>
            <h1 className="text-2xl font-heading font-bold mt-0.5">Mesa de ayuda</h1>
            <p className="text-white/60 text-sm mt-1">
              {openRow.c + inProgressRow.c} tickets activos · {urgentRow.c} urgentes
            </p>
          </div>
          <div className="shrink-0 hidden sm:flex h-16 w-16 rounded-2xl bg-white/10 items-center justify-center">
            <FaHeadset className="h-8 w-8 text-white" />
          </div>
        </div>
        {urgentRow.c > 0 && (
          <div className="relative mt-3 flex items-center gap-2 rounded-lg bg-destructive/40 px-3 py-2">
            <FaExclamationTriangle className="h-3 w-3 text-white" />
            <p className="text-xs text-white">{urgentRow.c} ticket{urgentRow.c !== 1 ? 's' : ''} urgente{urgentRow.c !== 1 ? 's' : ''} requieren atención inmediata</p>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <Card key={s.label} className={`overflow-hidden border transition-all hover:shadow-md bg-linear-to-br ${s.gradient}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl ${s.iconBg} flex items-center justify-center shadow-sm`}>
                  <s.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <NumberTicker value={s.value} className={`text-3xl font-bold tabular-nums ${s.textColor}`} />
              <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tickets list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div>
            <CardTitle className="text-base font-semibold">Tickets recientes</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Solicitudes de atención al usuario</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-primary hover:text-primary">
            <Link href="/dashboard/soporte/tickets">Ver todos <FaArrowRight className="h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="p-4 flex flex-col gap-2">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center gap-2">
              <FaCheck className="h-8 w-8 text-brand-green/40" />
              <p className="text-sm text-muted-foreground">Sin tickets pendientes. ¡Todo en orden!</p>
            </div>
          ) : recent.map(t => (
            <div key={t.id} className="group flex items-center gap-3 rounded-xl border bg-card p-3 hover:shadow-sm transition-all">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                t.priority === 'urgent' ? 'bg-destructive/10'
                : t.priority === 'high' ? 'bg-brand-orange/10'
                : 'bg-primary/8'
              }`}>
                {t.priority === 'urgent' || t.priority === 'high'
                  ? <FaExclamationTriangle className={`h-3.5 w-3.5 ${t.priority === 'urgent' ? 'text-destructive' : 'text-brand-orange'}`} />
                  : <FaHeadset className="h-3.5 w-3.5 text-primary" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-mono text-xs text-muted-foreground/70">{t.ticket_number}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${STATE_COLORS[t.state] ?? 'bg-muted text-muted-foreground border-border'}`}>
                    {STATE_LABELS[t.state] ?? t.state}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${PRIORITY_BADGE[t.priority] ?? ''}`}>
                    {PRIORITY_LABELS[t.priority] ?? t.priority}
                  </span>
                </div>
                <p className="font-semibold text-sm truncate">{t.subject}</p>
                <p className="text-xs text-muted-foreground">{t.user_name} · {formatDate(t.created_at)}</p>
              </div>
              <Button asChild variant="outline" size="sm" className="text-xs h-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/dashboard/soporte/tickets/${t.id}`}>Atender <FaChevronRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
