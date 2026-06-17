import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaUser } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_support_ticket, marketplace_ticket_message, res_users } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  open: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  resolved: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  closed: 'bg-muted text-muted-foreground',
  escalated: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export default async function SoporteTicketDetallePage(props: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['support', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const { id } = await props.params
  const ticketId = parseInt(id)
  if (isNaN(ticketId)) notFound()

  const [ticket] = await db
    .select({
      id: marketplace_support_ticket.id,
      ticket_number: marketplace_support_ticket.ticket_number,
      subject: marketplace_support_ticket.subject,
      description: marketplace_support_ticket.description,
      state: marketplace_support_ticket.state,
      priority: marketplace_support_ticket.priority,
      category: marketplace_support_ticket.category,
      created_at: marketplace_support_ticket.created_at,
      due_at: marketplace_support_ticket.due_at,
      resolved_at: marketplace_support_ticket.resolved_at,
      user_name: res_users.name, user_email: res_users.email, user_id: marketplace_support_ticket.user_id,
    })
    .from(marketplace_support_ticket)
    .innerJoin(res_users, eq(marketplace_support_ticket.user_id, res_users.id))
    .where(eq(marketplace_support_ticket.id, ticketId))
    .limit(1)

  if (!ticket) notFound()

  const messages = await db
    .select({
      id: marketplace_ticket_message.id,
      body: marketplace_ticket_message.body,
      is_internal: marketplace_ticket_message.is_internal,
      created_at: marketplace_ticket_message.created_at,
      sender_id: marketplace_ticket_message.sender_id,
      sender_name: res_users.name,
    })
    .from(marketplace_ticket_message)
    .innerJoin(res_users, eq(marketplace_ticket_message.sender_id, res_users.id))
    .where(eq(marketplace_ticket_message.ticket_id, ticketId))
    .orderBy(asc(marketplace_ticket_message.created_at))

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href="/dashboard/soporte/tickets"><FaArrowLeft className="h-3.5 w-3.5" />Volver</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm text-muted-foreground">{ticket.ticket_number}</span>
                <Badge className={`text-xs border ${STATE_COLORS[ticket.state] ?? ''}`}>{ticket.state}</Badge>
                <Badge variant="outline" className="text-xs">{ticket.priority}</Badge>
              </div>
              <h1 className="text-lg font-bold">{ticket.subject}</h1>
              <p className="text-xs text-muted-foreground">{ticket.user_name} · {ticket.user_email} · {formatDate(ticket.created_at)}</p>
            </div>
          </div>
          {ticket.description && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">{ticket.description}</div>
          )}
          <div className="flex gap-3 mt-3">
            {['in_progress', 'waiting_user', 'resolved', 'closed'].map(s => (
              <form key={s} action={`/api/v1/support/${ticket.id}/state`} method="POST">
                <input type="hidden" name="state" value={s} />
                <Button type="submit" variant="outline" size="sm" className="h-7 text-xs">{s}</Button>
              </form>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {messages.map(m => {
          const initials = m.sender_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'
          const isMe = m.sender_id === Number(session.sub)
          return (
            <div key={m.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className={`max-w-[70%] flex flex-col gap-0.5 ${isMe ? 'items-end' : ''}`}>
                {m.is_internal && <Badge className="text-xs bg-brand-orange/10 text-brand-orange border-brand-orange/20 w-fit">Interno</Badge>}
                <div className={`rounded-xl p-3 text-sm ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {m.body}
                </div>
                <p className="text-xs text-muted-foreground">{m.sender_name} · {formatDate(m.created_at)}</p>
              </div>
            </div>
          )
        })}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Responder</CardTitle></CardHeader>
        <CardContent>
          <form action={`/api/v1/support/${ticket.id}/reply`} method="POST" className="flex flex-col gap-3">
            <textarea name="body" rows={3} placeholder="Escribe tu respuesta…" className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" name="is_internal" value="true" className="rounded" />
                Nota interna (solo staff)
              </label>
              <Button type="submit" size="sm" className="ml-auto bg-brand-green hover:bg-brand-green-dark text-white text-xs">Enviar respuesta</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
