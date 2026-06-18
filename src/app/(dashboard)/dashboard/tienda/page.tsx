import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FaBookOpen, FaUsers, FaDollarSign, FaStar,
  FaArrowRight, FaPlus, FaStore, FaChevronRight, FaCheckCircle,
} from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import {
  marketplace_store, product_template, marketplace_enrollment,
  sale_order, sale_order_line,
} from '@/lib/db/schema'
import { eq, desc, count, and, isNull } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NumberTicker } from '@/components/ui/number-ticker'
import { formatCurrency, formatDate } from '@/lib/utils'

const COURSE_BADGE: Record<string, string> = {
  published: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  draft: 'bg-muted text-muted-foreground border-border',
  pending_review: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
}
const COURSE_LABEL: Record<string, string> = {
  published: 'Publicado', draft: 'Borrador', pending_review: 'En revisión', rejected: 'Rechazado',
}

export default async function TiendaDashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [store] = await db.select()
    .from(marketplace_store)
    .where(eq(marketplace_store.owner_id, Number(session.sub)))
    .limit(1)

  if (!store) redirect('/dashboard/tienda/perfil?setup=1')

  const [[coursesCount], [studentsCount], recentCourses, recentOrders] = await Promise.all([
    db.select({ c: count() }).from(product_template)
      .where(and(eq(product_template.store_id, store.id), isNull(product_template.deleted_at))),
    db.select({ c: count() }).from(marketplace_enrollment)
      .innerJoin(product_template, eq(marketplace_enrollment.course_id, product_template.id))
      .where(eq(product_template.store_id, store.id)),
    db.select({
      id: product_template.id, name: product_template.name, slug: product_template.slug,
      state: product_template.state, rating_avg: product_template.rating_avg,
      total_students: product_template.total_students, cover_url: product_template.cover_url,
      list_price: product_template.list_price,
    })
      .from(product_template)
      .where(and(eq(product_template.store_id, store.id), isNull(product_template.deleted_at)))
      .orderBy(desc(product_template.created_at)).limit(5),
    db.select({
      id: sale_order.id, name: sale_order.name, amount_total: sale_order.amount_total,
      currency: sale_order.currency, payment_state: sale_order.payment_state,
      created_at: sale_order.created_at,
    })
      .from(sale_order)
      .innerJoin(sale_order_line, eq(sale_order_line.order_id, sale_order.id))
      .innerJoin(product_template, eq(sale_order_line.course_id, product_template.id))
      .where(eq(product_template.store_id, store.id))
      .orderBy(desc(sale_order.created_at)).limit(5),
  ])

  const STATS = [
    { label: 'Cursos', value: coursesCount.c, isNum: true, sub: 'en catálogo', icon: FaBookOpen, gradient: 'from-primary/8 to-brand-secondary/5', iconBg: 'bg-primary', textColor: 'text-primary', href: '/dashboard/tienda/cursos' },
    { label: 'Estudiantes', value: studentsCount.c, isNum: true, sub: 'inscritos', icon: FaUsers, gradient: 'from-brand-green/10 to-brand-green/5', iconBg: 'bg-brand-green', textColor: 'text-brand-green', href: '/dashboard/tienda/estudiantes' },
    { label: 'Ingresos', value: null, valueText: formatCurrency(Number(store.total_sales ?? 0), 'USD'), sub: 'total ventas', icon: FaDollarSign, gradient: 'from-brand-orange/10 to-brand-orange/5', iconBg: 'bg-brand-orange', textColor: 'text-brand-orange', href: '/dashboard/tienda/finanzas' },
    { label: 'Rating', value: null, valueText: `${Number(store.rating_avg ?? 0).toFixed(1)}/5`, sub: 'calificación promedio', icon: FaStar, gradient: 'from-brand-purple/10 to-brand-purple/5', iconBg: 'bg-brand-purple', textColor: 'text-brand-purple', href: '/dashboard/tienda/reviews' },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-green via-emerald-500 to-brand-green/60 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-black/10" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-white/70 font-medium">Tu tienda</p>
            <h1 className="text-2xl font-heading font-bold mt-0.5 truncate">{store.name}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              {store.state === 'active' && (
                <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-xs text-white/90">Activa</span>
                </div>
              )}
              {store.is_verified && (
                <div className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5">
                  <FaCheckCircle className="h-3 w-3 text-white" />
                  <span className="text-xs text-white/90">Verificada</span>
                </div>
              )}
            </div>
          </div>
          <div className="shrink-0 hidden sm:flex h-16 w-16 rounded-2xl bg-white/10 items-center justify-center">
            <FaStore className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between -mt-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resumen</p>
        <Button asChild size="sm" className="gap-2 bg-brand-green hover:bg-brand-green/90 text-white h-8">
          <Link href="/dashboard/tienda/cursos/nuevo"><FaPlus className="h-3.5 w-3.5" />Nuevo curso</Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                {s.isNum && s.value !== null
                  ? <NumberTicker value={s.value as number} className={`text-3xl font-bold tabular-nums ${s.textColor}`} />
                  : <p className={`text-xl font-bold tabular-nums ${s.textColor}`}>{s.valueText}</p>
                }
                <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground/60">{s.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div>
              <CardTitle className="text-base font-semibold">Cursos recientes</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Últimos cursos de tu catálogo</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-primary hover:text-primary">
              <Link href="/dashboard/tienda/cursos">Ver todos <FaArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-2">
            {recentCourses.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center gap-2">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-1">
                  <FaBookOpen className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">No tienes cursos aún</p>
                <Button asChild size="sm" className="gap-1.5 bg-brand-green hover:bg-brand-green/90 text-white mt-1">
                  <Link href="/dashboard/tienda/cursos/nuevo"><FaPlus className="h-3 w-3" />Crear primer curso</Link>
                </Button>
              </div>
            ) : recentCourses.map(c => (
              <div key={c.id} className="group flex items-center gap-3 rounded-xl p-2.5 hover:bg-muted/50 transition-colors">
                <div className="h-12 w-18 rounded-lg bg-muted overflow-hidden shrink-0 shadow-sm">
                  {c.cover_url
                    ? <img src={c.cover_url} alt={c.name} className="w-full h-full object-cover" />
                    : <div className="h-full w-full flex items-center justify-center bg-brand-green/5">
                        <FaBookOpen className="h-4 w-4 text-brand-green/30" />
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-brand-green transition-colors">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.total_students ?? 0} est. · ⭐ {Number(c.rating_avg ?? 0).toFixed(1)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${COURSE_BADGE[c.state ?? 'draft'] ?? 'bg-muted text-muted-foreground border-border'}`}>
                  {COURSE_LABEL[c.state ?? 'draft'] ?? c.state}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div>
              <CardTitle className="text-base font-semibold">Últimas ventas</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Historial de transacciones</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-primary hover:text-primary">
              <Link href="/dashboard/tienda/ventas">Ver todas <FaArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-2">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center gap-2">
                <FaDollarSign className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">Sin ventas aún</p>
              </div>
            ) : recentOrders.map(o => (
              <div key={o.id} className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors">
                <div className="h-8 w-8 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
                  <FaDollarSign className="h-3.5 w-3.5 text-brand-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">{o.name}</p>
                  <p className="text-xs text-muted-foreground/70">{formatDate(o.created_at)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="font-bold text-sm text-brand-green">+{formatCurrency(Number(o.amount_total), o.currency ?? 'USD')}</p>
                  <span className={`text-xs font-medium ${o.payment_state === 'paid' ? 'text-brand-green' : 'text-muted-foreground'}`}>
                    {o.payment_state === 'paid' ? 'Pagada' : o.payment_state}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-base font-semibold">Acciones rápidas</CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Nuevo curso', href: '/dashboard/tienda/cursos/nuevo', icon: FaPlus, color: 'text-brand-green bg-brand-green/10 hover:bg-brand-green/20' },
            { label: 'Estudiantes', href: '/dashboard/tienda/estudiantes', icon: FaUsers, color: 'text-primary bg-primary/10 hover:bg-primary/20' },
            { label: 'Finanzas', href: '/dashboard/tienda/finanzas', icon: FaDollarSign, color: 'text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20' },
            { label: 'Reseñas', href: '/dashboard/tienda/reviews', icon: FaStar, color: 'text-brand-purple bg-brand-purple/10 hover:bg-brand-purple/20' },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className={`group flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all ${a.color}`}>
              <a.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{a.label}</span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
