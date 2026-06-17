import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaHeadset } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_support_ticket, res_users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  open: 'Abierto', in_progress: 'En progreso', waiting_user: 'Esperando', waiting_store: 'Esp. tienda',
  resolved: 'Resuelto', closed: 'Cerrado', escalated: 'Escalado',
}
const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-muted-foreground', normal: 'text-primary', high: 'text-brand-orange font-semibold', urgent: 'text-red-500 font-semibold',
}

export default async function SoporteTicketsPage(props: { searchParams: Promise<{ state?: string; priority?: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['support', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const sp = await props.searchParams
  const filterState = sp.state
  const filterPriority = sp.priority

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
    .limit(200)

  const filtered = tickets.filter(t => {
    if (filterState && t.state !== filterState) return false
    if (filterPriority && t.priority !== filterPriority) return false
    return true
  })

  const STATES = Object.keys(STATE_LABELS)
  const PRIORITIES = ['urgent', 'high', 'normal', 'low']

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Todos los tickets</h1>
        <p className="text-muted-foreground mt-0.5">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground">Estado:</span>
          <a href="/dashboard/soporte/tickets" className={`h-6 px-2.5 text-xs rounded border flex items-center transition-colors ${!filterState && !filterPriority ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background hover:bg-muted'}`}>Todos</a>
          {STATES.map(s => (
            <a key={s} href={`/dashboard/soporte/tickets?state=${s}${filterPriority ? `&priority=${filterPriority}` : ''}`}
              className={`h-6 px-2.5 text-xs rounded border flex items-center transition-colors ${filterState === s ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background hover:bg-muted'}`}>
              {STATE_LABELS[s]}
            </a>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground">Prioridad:</span>
          {PRIORITIES.map(p => (
            <a key={p} href={`/dashboard/soporte/tickets?priority=${p}${filterState ? `&state=${filterState}` : ''}`}
              className={`h-6 px-2.5 text-xs rounded border flex items-center transition-colors ${filterPriority === p ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background hover:bg-muted'}`}>
              {p}
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map(t => {
          const isOverdue = t.due_at && new Date(t.due_at) < new Date() && !['resolved', 'closed'].includes(t.state)
          return (
            <Card key={t.id} className={isOverdue ? 'border-red-500/30' : ''}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-mono text-xs text-muted-foreground">{t.ticket_number}</span>
                    <Badge className={`text-xs border ${STATE_COLORS[t.state] ?? ''}`}>{STATE_LABELS[t.state] ?? t.state}</Badge>
                    <span className={`text-xs ${PRIORITY_COLORS[t.priority] ?? ''}`}>{t.priority}</span>
                    <Badge variant="outline" className="text-xs">{t.category}</Badge>
                    {isOverdue && <Badge className="text-xs bg-red-500/10 text-red-500 border-red-500/20">Vencido</Badge>}
                  </div>
                  <p className="font-medium text-sm truncate">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">{t.user_name} · {t.user_email} · {formatDate(t.created_at)}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="text-xs h-7 shrink-0">
                  <Link href={`/dashboard/soporte/tickets/${t.id}`}>Atender</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
