import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaBuilding, FaUsers, FaBook, FaFileInvoice, FaChevronRight, FaPlus } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_quote, marketplace_enrollment } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NumberTicker } from '@/components/ui/number-ticker'
import { formatDate } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground border-border',
  sent: 'bg-primary/10 text-primary border-primary/20',
  accepted: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  expired: 'bg-muted text-muted-foreground border-border',
}
const STATE_LABELS: Record<string, string> = {
  draft: 'Borrador', sent: 'Enviada', accepted: 'Aceptada', rejected: 'Rechazada', expired: 'Expirada',
}

export default async function CorporativoPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['b2b_user', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const userId = Number(session.sub)

  const [quotes, [enrollRow]] = await Promise.all([
    db.select().from(marketplace_quote).where(eq(marketplace_quote.user_id, userId)).limit(5),
    db.select({ c: count() }).from(marketplace_enrollment).where(eq(marketplace_enrollment.user_id, userId)),
  ])

  const STATS = [
    { label: 'Cotizaciones', value: quotes.length, icon: FaFileInvoice, gradient: 'from-primary/8 to-brand-secondary/5', iconBg: 'bg-primary', textColor: 'text-primary', href: '/dashboard/corporativo/cotizaciones' },
    { label: 'Cursos activos', value: enrollRow.c, icon: FaBook, gradient: 'from-brand-purple/10 to-brand-purple/5', iconBg: 'bg-brand-purple', textColor: 'text-brand-purple', href: '/dashboard/comprador/cursos' },
    { label: 'Equipo', value: 0, icon: FaUsers, gradient: 'from-brand-green/10 to-brand-green/5', iconBg: 'bg-brand-green', textColor: 'text-brand-green', href: '/dashboard/corporativo/equipo' },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-secondary via-slate-700 to-brand-secondary/60 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-black/10" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/70 font-medium">Portal</p>
            <h1 className="text-2xl font-heading font-bold mt-0.5">Corporativo</h1>
            <p className="text-white/60 text-sm mt-1">
              Gestión de formación empresarial B2B
            </p>
          </div>
          <div className="shrink-0 hidden sm:flex h-16 w-16 rounded-2xl bg-white/10 items-center justify-center">
            <FaBuilding className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between -mt-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resumen</p>
        <Button asChild size="sm" className="gap-2 bg-brand-secondary hover:bg-brand-secondary/90 text-white h-8">
          <Link href="/dashboard/corporativo/cotizaciones"><FaPlus className="h-3.5 w-3.5" />Solicitar cotización</Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {STATS.map(s => (
          <Link key={s.label} href={s.href} className="group">
            <Card className={`overflow-hidden border transition-all hover:shadow-md hover:-translate-y-0.5 bg-linear-to-br ${s.gradient}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-10 w-10 rounded-xl ${s.iconBg} flex items-center justify-center shadow-sm`}>
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <FaChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <NumberTicker value={s.value} className={`text-3xl font-bold tabular-nums ${s.textColor}`} />
                <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quotes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div>
            <CardTitle className="text-base font-semibold">Cotizaciones recientes</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Solicitudes de formación corporativa</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs text-primary hover:text-primary">
            <Link href="/dashboard/corporativo/cotizaciones">Ver todas</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {quotes.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                <FaFileInvoice className="h-7 w-7 text-muted-foreground/30" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sin cotizaciones aún</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5 mb-4">Solicita una cotización para la formación de tu equipo</p>
              </div>
              <Button asChild className="gap-2 bg-brand-secondary hover:bg-brand-secondary/90 text-white">
                <Link href="/dashboard/corporativo/cotizaciones"><FaPlus className="h-3.5 w-3.5" />Solicitar cotización</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {quotes.map(q => (
                <div key={q.id} className="group flex items-center gap-3 rounded-xl p-3 hover:bg-muted/50 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-brand-secondary/10 flex items-center justify-center shrink-0">
                    <FaBuilding className="h-4 w-4 text-brand-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{q.company_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {q.participants ? `${q.participants} participantes · ` : ''}{formatDate(q.created_at)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${STATE_COLORS[q.state] ?? 'bg-muted text-muted-foreground border-border'}`}>
                    {STATE_LABELS[q.state] ?? q.state}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
