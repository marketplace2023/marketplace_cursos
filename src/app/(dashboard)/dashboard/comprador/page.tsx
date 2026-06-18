import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FaBookOpen, FaCheckCircle, FaCertificate,
  FaShoppingBag, FaHeart, FaArrowRight, FaPlay,
  FaFire, FaGraduationCap, FaChevronRight,
} from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import {
  marketplace_enrollment, marketplace_certificate,
  marketplace_favorite, sale_order, product_template,
} from '@/lib/db/schema'
import { eq, and, count, desc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { NumberTicker } from '@/components/ui/number-ticker'
import { formatCurrency } from '@/lib/utils'

const STATE_LABELS: Record<string, string> = {
  active: 'En progreso', completed: 'Completado',
  suspended: 'Suspendido', expired: 'Expirado', refunded: 'Reembolsado',
}

const ORDER_STATE_COLORS: Record<string, string> = {
  paid: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  pending: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  refunded: 'bg-muted text-muted-foreground border-border',
}

export default async function CompradorPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const userId = Number(session.sub)

  const [[enrolled], [completed], [certs], [favs], courses, orders] = await Promise.all([
    db.select({ c: count() }).from(marketplace_enrollment).where(eq(marketplace_enrollment.user_id, userId)),
    db.select({ c: count() }).from(marketplace_enrollment).where(and(eq(marketplace_enrollment.user_id, userId), eq(marketplace_enrollment.state, 'completed'))),
    db.select({ c: count() }).from(marketplace_certificate).where(eq(marketplace_certificate.user_id, userId)),
    db.select({ c: count() }).from(marketplace_favorite).where(eq(marketplace_favorite.user_id, userId)),
    db.select({
      id: marketplace_enrollment.id,
      course_id: marketplace_enrollment.course_id,
      progress_pct: marketplace_enrollment.progress_pct,
      state: marketplace_enrollment.state,
      course_name: product_template.name,
      course_slug: product_template.slug,
      course_cover: product_template.cover_url,
    })
      .from(marketplace_enrollment)
      .leftJoin(product_template, eq(marketplace_enrollment.course_id, product_template.id))
      .where(eq(marketplace_enrollment.user_id, userId))
      .orderBy(desc(marketplace_enrollment.updated_at))
      .limit(4),
    db.select({
      id: sale_order.id, name: sale_order.name, state: sale_order.state,
      amount_total: sale_order.amount_total, currency: sale_order.currency,
      created_at: sale_order.created_at,
    })
      .from(sale_order)
      .where(eq(sale_order.buyer_id, userId))
      .orderBy(desc(sale_order.created_at))
      .limit(3),
  ])

  const firstName = session.name.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  const STATS = [
    {
      label: 'Cursos inscritos',
      value: enrolled.c,
      icon: FaBookOpen,
      href: '/dashboard/comprador/cursos',
      gradient: 'from-primary/8 to-brand-secondary/5',
      iconBg: 'bg-primary',
      border: 'border-primary/10',
      textColor: 'text-primary',
    },
    {
      label: 'Completados',
      value: completed.c,
      icon: FaCheckCircle,
      href: '/dashboard/comprador/cursos',
      gradient: 'from-brand-green/10 to-brand-green/5',
      iconBg: 'bg-brand-green',
      border: 'border-brand-green/15',
      textColor: 'text-brand-green',
    },
    {
      label: 'Certificados',
      value: certs.c,
      icon: FaCertificate,
      href: '/dashboard/comprador/certificados',
      gradient: 'from-brand-purple/10 to-brand-purple/5',
      iconBg: 'bg-brand-purple',
      border: 'border-brand-purple/15',
      textColor: 'text-brand-purple',
    },
    {
      label: 'Favoritos',
      value: favs.c,
      icon: FaHeart,
      href: '/dashboard/comprador/favoritos',
      gradient: 'from-destructive/10 to-destructive/5',
      iconBg: 'bg-destructive',
      border: 'border-destructive/15',
      textColor: 'text-destructive',
    },
  ]

  const QUICK_ACTIONS = [
    { label: 'Explorar cursos',    href: '/cursos',                                    icon: FaFire,        color: 'text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20' },
    { label: 'Mis certificados',   href: '/dashboard/comprador/certificados',           icon: FaCertificate, color: 'text-brand-purple bg-brand-purple/10 hover:bg-brand-purple/20' },
    { label: 'Favoritos',          href: '/dashboard/comprador/favoritos',              icon: FaHeart,       color: 'text-destructive bg-destructive/10 hover:bg-destructive/20' },
    { label: 'Mis compras',        href: '/dashboard/comprador/ordenes',                icon: FaShoppingBag, color: 'text-primary bg-primary/10 hover:bg-primary/20' },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* ── Greeting banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary to-brand-secondary p-6 text-white shadow-lg">
        {/* decorative circles */}
        <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-brand-green/20" />
        <div className="pointer-events-none absolute top-4 right-32 h-16 w-16 rounded-full bg-white/5" />

        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/70 font-medium">{greeting},</p>
            <h1 className="text-2xl font-heading font-bold mt-0.5">{firstName} 👋</h1>
            <p className="text-white/60 text-sm mt-1">
              {enrolled.c === 0
                ? 'Comienza tu camino de aprendizaje hoy'
                : `Tienes ${enrolled.c - completed.c} curso${enrolled.c - completed.c !== 1 ? 's' : ''} en progreso`}
            </p>
          </div>
          <div className="shrink-0 hidden sm:flex">
            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <FaGraduationCap className="h-8 w-8 text-brand-green" />
            </div>
          </div>
        </div>

        {enrolled.c > 0 && (
          <div className="relative mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-green transition-all"
                style={{ width: `${Math.round((completed.c / enrolled.c) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-white/70 shrink-0 tabular-nums">
              {Math.round((completed.c / enrolled.c) * 100)}% completado
            </span>
          </div>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <Link key={s.label} href={s.href} className="group">
            <Card className={`relative overflow-hidden border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 bg-linear-to-br ${s.gradient} ${s.border}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-10 w-10 rounded-xl ${s.iconBg} flex items-center justify-center shadow-sm`}>
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <FaChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
                <NumberTicker value={s.value} className={`text-3xl font-bold tabular-nums ${s.textColor}`} />
                <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Recent courses */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
              <div>
                <CardTitle className="text-base font-semibold">Mis cursos recientes</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Continúa donde lo dejaste</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-primary hover:text-primary">
                <Link href="/dashboard/comprador/cursos">
                  Ver todos <FaArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-3">
              {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-3">
                    <FaBookOpen className="h-7 w-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Aún no tienes cursos</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5 mb-4">Explora el catálogo y empieza a aprender</p>
                  <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white gap-2">
                    <Link href="/cursos"><FaFire className="h-3.5 w-3.5" />Explorar cursos</Link>
                  </Button>
                </div>
              ) : (
                courses.map(c => {
                  const pct = Number(c.progress_pct ?? 0)
                  const isDone = c.state === 'completed'
                  return (
                    <div key={c.id} className="group flex items-center gap-3 rounded-xl p-3 hover:bg-muted/50 transition-colors">
                      <div className="h-14 w-20 rounded-lg bg-muted overflow-hidden shrink-0 shadow-sm">
                        {c.course_cover
                          ? <img src={c.course_cover} alt={c.course_name ?? ''} className="h-full w-full object-cover" />
                          : <div className="h-full w-full flex items-center justify-center bg-primary/5">
                              <FaBookOpen className="h-5 w-5 text-primary/30" />
                            </div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                          {c.course_name}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={pct} className="flex-1 h-1.5" />
                          <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-8 text-right">{pct.toFixed(0)}%</span>
                        </div>
                        <div className="mt-1.5">
                          <Badge
                            className={`text-xs border ${isDone ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 'bg-primary/8 text-primary border-primary/15'}`}
                          >
                            {STATE_LABELS[c.state ?? 'active'] ?? c.state}
                          </Badge>
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline" className="shrink-0 h-8 w-8 p-0 rounded-full border-primary/20 hover:bg-primary hover:text-white hover:border-primary transition-colors">
                        <Link href={`/dashboard/comprador/cursos/${c.course_slug}`}>
                          <FaPlay className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">

          {/* Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
              <div>
                <CardTitle className="text-base font-semibold">Últimas órdenes</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Historial de compras</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-primary hover:text-primary">
                <Link href="/dashboard/comprador/ordenes">Ver todas</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-2">
              {orders.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center gap-1">
                  <FaShoppingBag className="h-8 w-8 text-muted-foreground/20 mb-1" />
                  <p className="text-sm text-muted-foreground">Sin órdenes aún</p>
                </div>
              ) : orders.map(o => (
                <div key={o.id} className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
                    <FaShoppingBag className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-muted-foreground truncate">{o.name}</p>
                    <p className="font-bold text-sm text-foreground">{formatCurrency(Number(o.amount_total), o.currency ?? 'USD')}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ORDER_STATE_COLORS[o.state ?? ''] ?? 'bg-muted text-muted-foreground border-border'}`}>
                    {o.state}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-base font-semibold">Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map(a => (
                <Link
                  key={a.href}
                  href={a.href}
                  className={`group flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all ${a.color}`}
                >
                  <a.icon className="h-5 w-5" />
                  <span className="text-xs font-medium leading-tight">{a.label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
