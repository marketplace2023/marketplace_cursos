import { redirect } from 'next/navigation'
import { FaUsers, FaStore, FaBook, FaDollarSign, FaTicketAlt, FaStar, FaChartLine, FaShieldAlt } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { res_users, marketplace_store, product_template, sale_order, marketplace_support_ticket, marketplace_review } from '@/lib/db/schema'
import { eq, count, sum, gte, and } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const [usersRow] = await db.select({ c: count() }).from(res_users)
  const [activeUsersRow] = await db.select({ c: count() }).from(res_users).where(eq(res_users.state, 'active'))
  const [storesRow] = await db.select({ c: count() }).from(marketplace_store)
  const [activeStoresRow] = await db.select({ c: count() }).from(marketplace_store).where(eq(marketplace_store.state, 'active'))
  const [coursesRow] = await db.select({ c: count() }).from(product_template)
  const [publishedCoursesRow] = await db.select({ c: count() }).from(product_template).where(eq(product_template.state, 'published'))
  const [revenueRow] = await db.select({ s: sum(sale_order.amount_total) }).from(sale_order).where(eq(sale_order.payment_state, 'paid'))
  const [openTicketsRow] = await db.select({ c: count() }).from(marketplace_support_ticket).where(eq(marketplace_support_ticket.state, 'open'))
  const [pendingReviewsRow] = await db.select({ c: count() }).from(marketplace_review).where(eq(marketplace_review.state, 'pending'))
  const [pendingStoresRow] = await db.select({ c: count() }).from(marketplace_store).where(eq(marketplace_store.state, 'pending_review'))

  const recentOrders = await db
    .select({ id: sale_order.id, name: sale_order.name, amount_total: sale_order.amount_total, payment_state: sale_order.payment_state, created_at: sale_order.created_at })
    .from(sale_order)
    .orderBy(sale_order.created_at)
    .limit(5)

  const recentUsers = await db
    .select({ id: res_users.id, name: res_users.name, email: res_users.email, user_type: res_users.user_type, state: res_users.state, created_at: res_users.created_at })
    .from(res_users)
    .orderBy(res_users.created_at)
    .limit(5)

  const STATS = [
    { label: 'Usuarios totales', value: usersRow.c, sub: `${activeUsersRow.c} activos`, icon: FaUsers, color: 'text-primary', bg: 'bg-primary/10', href: '/dashboard/admin/usuarios' },
    { label: 'Tiendas', value: storesRow.c, sub: `${activeStoresRow.c} activas`, icon: FaStore, color: 'text-brand-green', bg: 'bg-brand-green/10', href: '/dashboard/admin/tiendas' },
    { label: 'Cursos', value: coursesRow.c, sub: `${publishedCoursesRow.c} publicados`, icon: FaBook, color: 'text-brand-purple', bg: 'bg-brand-purple/10', href: '/dashboard/admin/cursos' },
    { label: 'Ingresos totales', value: formatCurrency(Number(revenueRow.s ?? 0), 'USD'), sub: 'ventas pagadas', icon: FaDollarSign, color: 'text-brand-orange', bg: 'bg-brand-orange/10', href: '/dashboard/admin/pagos' },
    { label: 'Tickets abiertos', value: openTicketsRow.c, sub: 'requieren atención', icon: FaTicketAlt, color: 'text-red-500', bg: 'bg-red-500/10', href: '/dashboard/admin/soporte' },
    { label: 'Reseñas pendientes', value: pendingReviewsRow.c, sub: 'por moderar', icon: FaStar, color: 'text-brand-orange', bg: 'bg-brand-orange/10', href: '/dashboard/admin/reviews' },
    { label: 'Tiendas en revisión', value: pendingStoresRow.c, sub: 'esperan aprobación', icon: FaShieldAlt, color: 'text-brand-purple', bg: 'bg-brand-purple/10', href: '/dashboard/admin/tiendas' },
    { label: 'Activos esta semana', value: '—', sub: 'usuarios únicos', icon: FaChartLine, color: 'text-primary', bg: 'bg-primary/10', href: '/dashboard/admin/reportes' },
  ]

  const ORDER_COLORS: Record<string, string> = {
    paid: 'bg-brand-green/10 text-brand-green border-brand-green/20',
    pending: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
    failed: 'bg-red-500/10 text-red-500 border-red-500/20',
    refunded: 'bg-muted text-muted-foreground',
    cancelled: 'bg-muted text-muted-foreground',
  }

  const USER_COLORS: Record<string, string> = {
    active: 'bg-brand-green/10 text-brand-green border-brand-green/20',
    draft: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
    suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
    blocked: 'bg-red-600/10 text-red-600 border-red-600/20',
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Panel de administración</h1>
        <p className="text-muted-foreground mt-0.5">Visión general de la plataforma</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map(s => (
          <Card key={s.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xl leading-tight truncate">{s.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
                <p className="text-xs text-muted-foreground/70">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Últimas órdenes</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left px-4 py-2">Orden</th>
                  <th className="text-right px-4 py-2">Total</th>
                  <th className="text-right px-4 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <p className="font-medium">{o.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold">{formatCurrency(Number(o.amount_total ?? 0), 'USD')}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Badge className={`text-xs border ${ORDER_COLORS[o.payment_state] ?? ''}`}>{o.payment_state}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Últimos registros</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left px-4 py-2">Usuario</th>
                  <th className="text-right px-4 py-2">Rol</th>
                  <th className="text-right px-4 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <p className="font-medium truncate max-w-32">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-32">{u.email}</p>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Badge variant="outline" className="text-xs">{u.user_type}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Badge className={`text-xs border ${USER_COLORS[u.state] ?? ''}`}>{u.state}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
