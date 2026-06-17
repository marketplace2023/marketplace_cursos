import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaBuilding, FaUsers, FaBook, FaFileInvoice } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_quote, marketplace_enrollment, res_users } from '@/lib/db/schema'
import { eq, count, and } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export default async function CorporativoPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['b2b_user', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const quotes = await db
    .select()
    .from(marketplace_quote)
    .where(eq(marketplace_quote.user_id, Number(session.sub)))
    .limit(5)

  const [enrollRow] = await db.select({ c: count() }).from(marketplace_enrollment).where(eq(marketplace_enrollment.user_id, Number(session.sub)))

  const STATE_COLORS: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    sent: 'bg-primary/10 text-primary border-primary/20',
    accepted: 'bg-brand-green/10 text-brand-green border-brand-green/20',
    rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    expired: 'bg-muted text-muted-foreground',
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Portal corporativo</h1>
        <p className="text-muted-foreground mt-0.5">Gestión de formación empresarial</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Cotizaciones', value: quotes.length, icon: FaFileInvoice, href: '/dashboard/corporativo/cotizaciones', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Cursos activos', value: enrollRow.c, icon: FaBook, href: '/dashboard/comprador/cursos', color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
          { label: 'Equipo', value: '—', icon: FaUsers, href: '/dashboard/corporativo/equipo', color: 'text-brand-green', bg: 'bg-brand-green/10' },
        ].map(s => (
          <Card key={s.label} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Cotizaciones recientes</h2>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/dashboard/corporativo/cotizaciones">Ver todas</Link>
          </Button>
        </div>
        {quotes.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <FaFileInvoice className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">Sin cotizaciones. Solicita una para tu empresa.</p>
            <Button asChild className="bg-brand-green hover:bg-brand-green-dark text-white">
              <Link href="/dashboard/corporativo/cotizaciones">Solicitar cotización</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {quotes.map(q => (
              <Card key={q.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{q.company_name}</p>
                      <Badge className={`text-xs border ${STATE_COLORS[q.state] ?? ''}`}>{q.state}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{q.participants ? `${q.participants} participantes` : ''} · {formatDate(q.created_at)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
