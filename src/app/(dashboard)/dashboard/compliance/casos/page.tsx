import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaClipboardList } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_support_ticket, res_users } from '@/lib/db/schema'
import { eq, desc, or } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export default async function ComplianceCasosPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['compliance', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const tickets = await db
    .select({
      id: marketplace_support_ticket.id,
      ticket_number: marketplace_support_ticket.ticket_number,
      subject: marketplace_support_ticket.subject,
      state: marketplace_support_ticket.state,
      priority: marketplace_support_ticket.priority,
      category: marketplace_support_ticket.category,
      created_at: marketplace_support_ticket.created_at,
      user_name: res_users.name, user_email: res_users.email,
    })
    .from(marketplace_support_ticket)
    .innerJoin(res_users, eq(marketplace_support_ticket.user_id, res_users.id))
    .where(or(eq(marketplace_support_ticket.state, 'escalated'), eq(marketplace_support_ticket.category, 'moderation')))
    .orderBy(desc(marketplace_support_ticket.created_at))
    .limit(100)

  const STATE_COLORS: Record<string, string> = {
    escalated: 'bg-red-500/10 text-red-500 border-red-500/20',
    open: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
    in_progress: 'bg-primary/10 text-primary border-primary/20',
    resolved: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Casos de compliance</h1>
        <p className="text-muted-foreground mt-0.5">Tickets escalados y casos de moderación</p>
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaClipboardList className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin casos activos de compliance</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tickets.map(t => (
            <Card key={t.id} className={t.state === 'escalated' ? 'border-red-500/30' : ''}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-mono text-xs text-muted-foreground">{t.ticket_number}</span>
                    <Badge className={`text-xs border ${STATE_COLORS[t.state] ?? ''}`}>{t.state}</Badge>
                    <Badge variant="outline" className="text-xs">{t.category}</Badge>
                    <Badge variant="outline" className="text-xs">{t.priority}</Badge>
                  </div>
                  <p className="font-medium text-sm">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">{t.user_name} · {formatDate(t.created_at)}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="text-xs h-7 shrink-0">
                  <Link href={`/dashboard/soporte/tickets/${t.id}`}>Ver caso</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
