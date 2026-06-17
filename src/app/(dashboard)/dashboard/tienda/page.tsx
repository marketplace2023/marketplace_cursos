import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FaBookOpen, FaUsers, FaDollarSign, FaStar,
  FaArrowRight, FaArrowUp, FaPlus,
} from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import {
  marketplace_store, product_template, marketplace_enrollment,
  sale_order, sale_order_line, marketplace_review,
} from '@/lib/db/schema'
import { eq, desc, count, sum, and, isNull } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function TiendaDashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [store] = await db.select()
    .from(marketplace_store)
    .where(eq(marketplace_store.owner_id, Number(session.sub)))
    .limit(1)

  if (!store) redirect('/dashboard/tienda/perfil?setup=1')

  const [
    [coursesCount],
    [studentsCount],
    recentCourses,
    recentOrders,
  ] = await Promise.all([
    db.select({ c: count() }).from(product_template)
      .where(and(eq(product_template.store_id, store.id), isNull(product_template.deleted_at))),
    db.select({ c: count() }).from(marketplace_enrollment)
      .innerJoin(product_template, eq(marketplace_enrollment.course_id, product_template.id))
      .where(eq(product_template.store_id, store.id)),
    db.select({
      id: product_template.id, name: product_template.name, slug: product_template.slug,
      state: product_template.state, rating_avg: product_template.rating_avg,
      total_students: product_template.total_students, list_price: product_template.list_price,
    })
      .from(product_template)
      .where(and(eq(product_template.store_id, store.id), isNull(product_template.deleted_at)))
      .orderBy(desc(product_template.created_at)).limit(5),
    db.select({
      id: sale_order.id, name: sale_order.name, amount_total: sale_order.amount_total,
      currency: sale_order.currency, state: sale_order.state, payment_state: sale_order.payment_state,
      created_at: sale_order.created_at,
    })
      .from(sale_order)
      .innerJoin(sale_order_line, eq(sale_order_line.order_id, sale_order.id))
      .innerJoin(product_template, eq(sale_order_line.course_id, product_template.id))
      .where(eq(product_template.store_id, store.id))
      .orderBy(desc(sale_order.created_at)).limit(5),
  ])

  const STATS = [
    {
      label: 'Cursos publicados', value: coursesCount.c, icon: FaBookOpen,
      color: 'text-primary', bg: 'bg-primary/10', href: '/dashboard/tienda/cursos',
    },
    {
      label: 'Estudiantes totales', value: studentsCount.c, icon: FaUsers,
      color: 'text-brand-green', bg: 'bg-brand-green/10', href: '/dashboard/tienda/estudiantes',
    },
    {
      label: 'Ingresos totales', value: formatCurrency(Number(store.total_sales ?? 0), 'USD'), icon: FaDollarSign,
      color: 'text-brand-orange', bg: 'bg-brand-orange/10', href: '/dashboard/tienda/finanzas',
    },
    {
      label: 'Calificación promedio', value: Number(store.rating_avg ?? 0).toFixed(1), icon: FaStar,
      color: 'text-brand-purple', bg: 'bg-brand-purple/10', href: '/dashboard/tienda/reviews',
    },
  ]

  const STATE_BADGE: Record<string, string> = {
    published: 'bg-brand-green/10 text-brand-green',
    draft: 'bg-muted text-muted-foreground',
    pending_review: 'bg-brand-orange/10 text-brand-orange',
    rejected: 'bg-destructive/10 text-destructive',
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">{store.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={store.state === 'active' ? 'default' : 'secondary'} className="text-xs capitalize">
              {store.state}
            </Badge>
            {store.is_verified && <Badge className="text-xs bg-brand-green/10 text-brand-green border-0">Verificada</Badge>}
          </div>
        </div>
        <Button asChild className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <Link href="/dashboard/tienda/cursos/nuevo"><FaPlus className="h-4 w-4" />Nuevo curso</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0 ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold truncate">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Cursos recientes</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/dashboard/tienda/cursos">Ver todos <FaArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentCourses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">No tienes cursos aún</p>
                <Button asChild size="sm" className="gap-1 bg-brand-green hover:bg-brand-green-dark text-white">
                  <Link href="/dashboard/tienda/cursos/nuevo"><FaPlus className="h-3 w-3" />Crear primer curso</Link>
                </Button>
              </div>
            ) : recentCourses.map(c => (
              <div key={c.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8 rounded-lg shrink-0">
                  <AvatarFallback className="rounded-lg text-xs bg-muted">{c.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{c.total_students ?? 0} estudiantes</span>
                    <FaStar className="h-2.5 w-2.5 text-brand-orange" />
                    <span>{Number(c.rating_avg ?? 0).toFixed(1)}</span>
                  </div>
                </div>
                <Badge className={`text-xs border-0 shrink-0 ${STATE_BADGE[c.state ?? 'draft']}`}>
                  {c.state}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Últimas ventas</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/dashboard/tienda/ventas">Ver todas <FaArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Sin ventas aún</p>
            ) : recentOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{o.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={o.payment_state === 'paid' ? 'default' : 'secondary'} className="text-xs">
                    {o.payment_state === 'paid' ? 'Pagada' : o.payment_state}
                  </Badge>
                  <p className="font-bold text-brand-green">+{formatCurrency(Number(o.amount_total), o.currency ?? 'USD')}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Acciones rápidas</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            { label: 'Nuevo curso', href: '/dashboard/tienda/cursos/nuevo', icon: FaPlus },
            { label: 'Ver estudiantes', href: '/dashboard/tienda/estudiantes', icon: FaUsers },
            { label: 'Ver finanzas', href: '/dashboard/tienda/finanzas', icon: FaDollarSign },
            { label: 'Configuración', href: '/dashboard/tienda/configuracion', icon: FaBookOpen },
          ].map(a => (
            <Button key={a.href} asChild variant="outline" size="sm" className="gap-2">
              <Link href={a.href}><a.icon className="h-3.5 w-3.5" />{a.label}</Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
