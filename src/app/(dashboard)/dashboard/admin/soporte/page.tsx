import { redirect } from 'next/navigation'
import { FaHeadset } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_support_ticket, res_users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  open: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  waiting_user: 'bg-muted text-muted-foreground',
  waiting_store: 'bg-brand-purple/10 text-brand-purple border-brand-purple/20',
  resolved: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  closed: 'bg-muted text-muted-foreground',
  escalated: 'bg-red-500/10 text-red-500 border-red-500/20',
}
const STATE_LABELS: Record<string, string> = {
  open: 'Abierto', in_progress: 'En progreso', waiting_user: 'Esperando usuario',
  waiting_store: 'Esperando tienda', resolved: 'Resuelto', closed: 'Cerrado', escalated: 'Escalado',
}
const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-muted text-muted-foreground', normal: 'bg-primary/10 text-primary border-primary/20',
  high: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export default async function AdminSoportePage(props: { searchParams: Promise<{ state?: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin', 'support'].includes(session.role)) redirect('/dashboard')

  const sp = await props.searchParams
  const filterState = sp.state

  const tickets = await db
    .select({
      id: marketplace_support_ticket.id,
      ticket_number: marketplace_support_ticket.ticket_number,
      subject: marketplace_support_ticket.subject,
      state: marketplace_support_ticket.state,
      priority: marketplace_support_ticket.priority,
      category: marketplace_support_ticket.category,
      created_at: marketplace_support_ticket.created_at,
      due_at: marketplace_support_ticket.due_at,
      user_name: res_users.name, user_email: res_users.email,
    })
    .from(marketplace_support_ticket)
    .innerJoin(res_users, eq(marketplace_support_ticket.user_id, res_users.id))
    .orderBy(desc(marketplace_support_ticket.created_at))
    .limit(100)

  const filtered = filterState ? tickets.filter(t => t.state === filterState) : tickets
  const open = tickets.filter(t => t.state === 'open').length
  const urgent = tickets.filter(t => t.priority === 'urgent').length
  const STATES = ['open', 'in_progress', 'waiting_user', 'resolved', 'closed', 'escalated']

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Soporte</h1>
        <p className="text-muted-foreground mt-0.5">{open} abiertos · {urgent} urgentes · {filtered.length} total</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href="/dashboard/admin/soporte" className={`h-7 px-3 text-xs rounded-md border flex items-center font-medium transition-colors ${!filterState ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background hover:bg-muted'}`}>Todos</a>
        {STATES.map(s => (
          <a key={s} href={`/dashboard/admin/soporte?state=${s}`} className={`h-7 px-3 text-xs rounded-md border flex items-center font-medium transition-colors ${filterState === s ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background hover:bg-muted'}`}>{STATE_LABELS[s]}</a>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaHeadset className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin tickets que mostrar</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(t => {
            const isOverdue = t.due_at && new Date(t.due_at) < new Date() && !['resolved', 'closed'].includes(t.state)
            return (
              <Card key={t.id} className={isOverdue ? 'border-red-500/30' : t.priority === 'urgent' ? 'border-brand-orange/30' : ''}>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-mono text-xs text-muted-foreground">{t.ticket_number}</span>
                      <Badge className={`text-xs border ${STATE_COLORS[t.state] ?? ''}`}>{STATE_LABELS[t.state] ?? t.state}</Badge>
                      <Badge className={`text-xs border ${PRIORITY_COLORS[t.priority] ?? ''}`}>{t.priority}</Badge>
                      <Badge variant="outline" className="text-xs">{t.category}</Badge>
                      {isOverdue && <Badge className="text-xs bg-red-500/10 text-red-500 border-red-500/20">Vencido</Badge>}
                    </div>
                    <p className="font-semibold text-sm">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.user_name} · {t.user_email} · {formatDate(t.created_at)}</p>
                  </div>
                  {t.due_at && (
                    <div className="text-right text-xs text-muted-foreground shrink-0">
                      <p>SLA</p>
                      <p className={isOverdue ? 'text-red-500 font-medium' : ''}>{formatDate(t.due_at)}</p>
                    </div>
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
