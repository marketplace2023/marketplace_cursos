import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaShieldAlt, FaIdCard, FaBuilding, FaGraduationCap, FaClipboardList, FaChevronRight } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { ir_audit_log, marketplace_fur_t, marketplace_fur_p, marketplace_support_ticket } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { NumberTicker } from '@/components/ui/number-ticker'

export default async function CompliancePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['compliance', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const [[auditRow], [pendingFurtRow], [escalatedRow]] = await Promise.all([
    db.select({ c: count() }).from(ir_audit_log),
    db.select({ c: count() }).from(marketplace_fur_t).where(eq(marketplace_fur_t.verification_state, 'pending')),
    db.select({ c: count() }).from(marketplace_support_ticket).where(eq(marketplace_support_ticket.state, 'escalated')),
  ])

  const pendingTotal = pendingFurtRow.c + escalatedRow.c

  const LINKS = [
    {
      href: '/dashboard/compliance/fur-u', label: 'FUR-U — Usuarios',
      desc: 'Verificación de identidad de usuarios', icon: FaIdCard,
      iconBg: 'bg-primary', gradient: 'from-primary/8 to-brand-secondary/5',
      badge: null,
    },
    {
      href: '/dashboard/compliance/fur-t', label: 'FUR-T — Tiendas',
      desc: 'Verificación fiscal y documentos legales', icon: FaBuilding,
      iconBg: 'bg-brand-orange', gradient: pendingFurtRow.c > 0 ? 'from-brand-orange/10 to-brand-orange/5' : 'from-muted/50 to-muted/30',
      badge: pendingFurtRow.c > 0 ? `${pendingFurtRow.c} pendientes` : null,
      badgeColor: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
    },
    {
      href: '/dashboard/compliance/fur-p', label: 'FUR-P — Cursos',
      desc: 'Acreditación y contenido educativo', icon: FaGraduationCap,
      iconBg: 'bg-brand-purple', gradient: 'from-brand-purple/10 to-brand-purple/5',
      badge: null,
    },
    {
      href: '/dashboard/compliance/casos', label: 'Casos escalados',
      desc: 'Tickets e incumplimientos reportados', icon: FaClipboardList,
      iconBg: escalatedRow.c > 0 ? 'bg-destructive' : 'bg-muted-foreground/40',
      gradient: escalatedRow.c > 0 ? 'from-destructive/10 to-destructive/5' : 'from-muted/50 to-muted/30',
      badge: escalatedRow.c > 0 ? `${escalatedRow.c} escalados` : null,
      badgeColor: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    {
      href: '/dashboard/admin/auditoria', label: 'Auditoría del sistema',
      desc: `${auditRow.c} registros de actividad`, icon: FaShieldAlt,
      iconBg: 'bg-brand-green', gradient: 'from-brand-green/10 to-brand-green/5',
      badge: null,
    },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-700 via-slate-600 to-slate-700/70 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-black/10" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/70 font-medium">Panel de</p>
            <h1 className="text-2xl font-heading font-bold mt-0.5">Compliance</h1>
            <p className="text-white/60 text-sm mt-1">
              Verificación, auditoría y cumplimiento normativo
            </p>
          </div>
          <div className="shrink-0 hidden sm:flex h-16 w-16 rounded-2xl bg-white/10 items-center justify-center">
            <FaShieldAlt className="h-8 w-8 text-white" />
          </div>
        </div>
        {pendingTotal > 0 && (
          <div className="relative mt-3 flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
            <p className="text-xs text-white/80">
              {pendingTotal} elemento{pendingTotal !== 1 ? 's' : ''} requieren revisión
            </p>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tiendas pendientes', value: pendingFurtRow.c, textColor: pendingFurtRow.c > 0 ? 'text-brand-orange' : 'text-muted-foreground', gradient: pendingFurtRow.c > 0 ? 'from-brand-orange/10 to-brand-orange/5' : 'from-muted/40 to-muted/20', iconBg: pendingFurtRow.c > 0 ? 'bg-brand-orange' : 'bg-muted-foreground/30', icon: FaBuilding },
          { label: 'Casos escalados', value: escalatedRow.c, textColor: escalatedRow.c > 0 ? 'text-destructive' : 'text-muted-foreground', gradient: escalatedRow.c > 0 ? 'from-destructive/10 to-destructive/5' : 'from-muted/40 to-muted/20', iconBg: escalatedRow.c > 0 ? 'bg-destructive' : 'bg-muted-foreground/30', icon: FaClipboardList },
          { label: 'Registros auditoría', value: auditRow.c, textColor: 'text-brand-green', gradient: 'from-brand-green/10 to-brand-green/5', iconBg: 'bg-brand-green', icon: FaShieldAlt },
        ].map(s => (
          <Card key={s.label} className={`overflow-hidden border bg-linear-to-br ${s.gradient}`}>
            <CardContent className="p-5">
              <div className="mb-3">
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

      {/* Module cards */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Módulos de verificación</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className="group">
              <Card className={`overflow-hidden border transition-all hover:shadow-md hover:-translate-y-0.5 bg-linear-to-br ${l.gradient}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`h-11 w-11 rounded-xl ${l.iconBg} flex items-center justify-center shadow-sm shrink-0`}>
                      <l.icon className="h-5 w-5 text-white" />
                    </div>
                    <FaChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 mt-1 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </div>
                  <p className="font-semibold text-sm mb-0.5">{l.label}</p>
                  <p className="text-xs text-muted-foreground mb-3">{l.desc}</p>
                  {l.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${l.badgeColor}`}>
                      {l.badge}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
