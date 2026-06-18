import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FaUsers, FaStore, FaBook, FaDollarSign, FaTicketAlt,
  FaStar, FaShieldAlt, FaChartLine, FaArrowRight, FaChevronRight,
} from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import {
  res_users, marketplace_store, product_template,
  sale_order, marketplace_support_ticket, marketplace_review,
} from '@/lib/db/schema'
import { eq, count, sum, desc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NumberTicker } from '@/components/ui/number-ticker'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const [
    [usersRow], [activeUsersRow],
    [storesRow], [activeStoresRow],
    [coursesRow], [publishedCoursesRow],
    [revenueRow], [openTicketsRow],
    [pendingReviewsRow], [pendingStoresRow],
    recentOrders, recentUsers,
  ] = await Promise.all([
    db.select({ c: count() }).from(res_users),
    db.select({ c: count() }).from(res_users).where(eq(res_users.state, 'active')),
    db.select({ c: count() }).from(marketplace_store),
    db.select({ c: count() }).from(marketplace_store).where(eq(marketplace_store.state, 'active')),
    db.select({ c: count() }).from(product_template),
    db.select({ c: count() }).from(product_template).where(eq(product_template.state, 'published')),
    db.select({ s: sum(sale_order.amount_total) }).from(sale_order).where(eq(sale_order.payment_state, 'paid')),
    db.select({ c: count() }).from(marketplace_support_ticket).where(eq(marketplace_support_ticket.state, 'open')),
    db.select({ c: count() }).from(marketplace_review).where(eq(marketplace_review.state, 'pending')),
    db.select({ c: count() }).from(marketplace_store).where(eq(marketplace_store.state, 'pending_review')),
    db.select({
      id: sale_order.id, name: sale_order.name,
      amount_total: sale_order.amount_total, payment_state: sale_order.payment_state,
      created_at: sale_order.created_at,
    }).from(sale_order).orderBy(desc(sale_order.created_at)).limit(5),
    db.select({
      id: res_users.id, name: res_users.name, email: res_users.email,
      user_type: res_users.user_type, state: res_users.state,
    }).from(res_users).orderBy(desc(res_users.created_at)).limit(5),
  ])

  const PLATFORM_STATS = [
    { label: 'Usuarios', value: usersRow.c, sub: `${activeUsersRow.c} activos`, icon: FaUsers, gradient: 'from-primary/8 to-brand-secondary/5', iconBg: 'bg-primary', textColor: 'text-primary', href: '/dashboard/admin/usuarios' },
    { label: 'Tiendas', value: storesRow.c, sub: `${activeStoresRow.c} activas`, icon: FaStore, gradient: 'from-brand-green/10 to-brand-green/5', iconBg: 'bg-brand-green', textColor: 'text-brand-green', href: '/dashboard/admin/tiendas' },
    { label: 'Cursos', value: coursesRow.c, sub: `${publishedCoursesRow.c} publicados`, icon: FaBook, gradient: 'from-brand-purple/10 to-brand-purple/5', iconBg: 'bg-brand-purple', textColor: 'text-brand-purple', href: '/dashboard/admin/cursos' },
    { label: 'Ingresos', value: null, valueText: formatCurrency(Number(revenueRow.s ?? 0), 'USD'), sub: 'ventas pagadas', icon: FaDollarSign, gradient: 'from-brand-orange/10 to-brand-orange/5', iconBg: 'bg-brand-orange', textColor: 'text-brand-orange', href: '/dashboard/admin/pagos' },
  ]

  const ACTION_STATS = [
    { label: 'Tickets abiertos', value: openTicketsRow.c, icon: FaTicketAlt, gradient: openTicketsRow.c > 0 ? 'from-destructive/10 to-destructive/5' : 'from-muted/50 to-muted/30', iconBg: openTicketsRow.c > 0 ? 'bg-destructive' : 'bg-muted-foreground/40', textColor: openTicketsRow.c > 0 ? 'text-destructive' : 'text-muted-foreground', href: '/dashboard/admin/soporte' },
    { label: 'Reseñas pendientes', value: pendingReviewsRow.c, icon: FaStar, gradient: pendingReviewsRow.c > 0 ? 'from-brand-orange/10 to-brand-orange/5' : 'from-muted/50 to-muted/30', iconBg: pendingReviewsRow.c > 0 ? 'bg-brand-orange' : 'bg-muted-foreground/40', textColor: pendingReviewsRow.c > 0 ? 'text-brand-orange' : 'text-muted-foreground', href: '/dashboard/admin/reviews' },
    { label: 'Tiendas en revisión', value: pendingStoresRow.c, icon: FaShieldAlt, gradient: pendingStoresRow.c > 0 ? 'from-brand-purple/10 to-brand-purple/5' : 'from-muted/50 to-muted/30', iconBg: pendingStoresRow.c > 0 ? 'bg-brand-purple' : 'bg-muted-foreground/40', textColor: pendingStoresRow.c > 0 ? 'text-brand-purple' : 'text-muted-foreground', href: '/dashboard/admin/tiendas' },
    { label: 'Reportes', value: null, valueText: 'Ver', icon: FaChartLine, gradient: 'from-brand-secondary/8 to-brand-secondary/5', iconBg: 'bg-brand-secondary', textColor: 'text-brand-secondary', href: '/dashboard/admin/reportes' },
  ]

  const ORDER_COLORS: Record<string, string> = {
    paid: 'bg-brand-green/10 text-brand-green border-brand-green/20',
    pending: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
    failed: 'bg-destructive/10 text-destructive border-destructive/20',
    refunded: 'bg-muted text-muted-foreground border-border',
    cancelled: 'bg-muted text-muted-foreground border-border',
  }
  const USER_COLORS: Record<string, string> = {
    active: 'bg-brand-green/10 text-brand-green border-brand-green/20',
    draft: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
    suspended: 'bg-destructive/10 text-destructive border-destructive/20',
    blocked: 'bg-destructive/15 text-destructive border-destructive/25',
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-orange via-amber-500 to-brand-orange/60 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-black/10" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/70 font-medium">Panel de control</p>
            <h1 className="text-2xl font-heading font-bold mt-0.5">Administración</h1>
            <p className="text-white/60 text-sm mt-1">
              {usersRow.c} usuarios · {storesRow.c} tiendas · {coursesRow.c} cursos
            </p>
          </div>
          <div className="shrink-0 hidden sm:flex h-16 w-16 rounded-2xl bg-white/10 items-center justify-center">
            <FaShieldAlt className="h-8 w-8 text-white" />
          </div>
        </div>
        {(openTicketsRow.c + pendingStoresRow.c + pendingReviewsRow.c) > 0 && (
          <div className="relative mt-3 flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <p className="text-xs text-white/80">
              {openTicketsRow.c + pendingStoresRow.c + pendingReviewsRow.c} elemento(s) requieren atención inmediata
            </p>
          </div>
        )}
      </div>

      {/* Platform stats */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Métricas de plataforma</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PLATFORM_STATS.map(s => (
            <Link key={s.label} href={s.href} className="group">
              <Card className={`overflow-hidden border transition-all hover:shadow-md hover:-translate-y-0.5 bg-linear-to-br ${s.gradient}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-10 w-10 rounded-xl ${s.iconBg} flex items-center justify-center shadow-sm`}>
                      <s.icon className="h-5 w-5 text-white" />
                    </div>
                    <FaChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  {s.value !== null
                    ? <NumberTicker value={s.value} className={`text-3xl font-bold tabular-nums ${s.textColor}`} />
                    : <p className={`text-xl font-bold tabular-nums ${s.textColor}`}>{s.valueText}</p>
                  }
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground/60">{s.sub}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Action stats */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Requiere acción</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {ACTION_STATS.map(s => (
            <Link key={s.label} href={s.href} className="group">
              <Card className={`overflow-hidden border transition-all hover:shadow-md hover:-translate-y-0.5 bg-linear-to-br ${s.gradient}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-10 w-10 rounded-xl ${s.iconBg} flex items-center justify-center shadow-sm`}>
                      <s.icon className="h-5 w-5 text-white" />
                    </div>
                    <FaChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  {s.value !== null
                    ? <NumberTicker value={s.value} className={`text-3xl font-bold tabular-nums ${s.textColor}`} />
                    : <p className={`text-sm font-semibold ${s.textColor}`}>{s.valueText}</p>
                  }
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div>
              <CardTitle className="text-base font-semibold">Últimas órdenes</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Actividad de ventas reciente</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs gap-1 text-primary hover:text-primary">
              <Link href="/dashboard/admin/pedidos">Ver todas <FaArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-2">
            {recentOrders.length === 0
              ? <p className="text-sm text-muted-foreground text-center py-6">Sin órdenes</p>
              : recentOrders.map(o => (
                <div key={o.id} className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0">
                    <FaDollarSign className="h-3.5 w-3.5 text-brand-orange" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-muted-foreground">{o.name}</p>
                    <p className="font-bold text-sm">{formatCurrency(Number(o.amount_total ?? 0), 'USD')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ORDER_COLORS[o.payment_state ?? ''] ?? 'bg-muted text-muted-foreground border-border'}`}>
                      {o.payment_state}
                    </span>
                    <span className="text-xs text-muted-foreground/60">{formatDate(o.created_at)}</span>
                  </div>
                </div>
              ))
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div>
              <CardTitle className="text-base font-semibold">Últimos registros</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Nuevos usuarios en la plataforma</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs gap-1 text-primary hover:text-primary">
              <Link href="/dashboard/admin/usuarios">Ver todos <FaArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-2">
            {recentUsers.length === 0
              ? <p className="text-sm text-muted-foreground text-center py-6">Sin usuarios</p>
              : recentUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                    {u.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${USER_COLORS[u.state ?? ''] ?? 'bg-muted text-muted-foreground border-border'}`}>
                      {u.state}
                    </span>
                    <span className="text-xs text-muted-foreground/60 capitalize">{u.user_type}</span>
                  </div>
                </div>
              ))
            }
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
