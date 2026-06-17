import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FaBookOpen, FaCheckCircle, FaCertificate,
  FaShoppingBag, FaHeart, FaArrowRight, FaPlay, FaFire,
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
import { formatCurrency } from '@/lib/utils'

const STATE_LABELS: Record<string, string> = {
  active: 'En progreso', completed: 'Completado',
  suspended: 'Suspendido', expired: 'Expirado', refunded: 'Reembolsado',
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
    db.select({ id: sale_order.id, name: sale_order.name, state: sale_order.state, amount_total: sale_order.amount_total, currency: sale_order.currency, created_at: sale_order.created_at })
      .from(sale_order)
      .where(eq(sale_order.buyer_id, userId))
      .orderBy(desc(sale_order.created_at))
      .limit(3),
  ])

  const STATS = [
    { label: 'Cursos inscritos', value: enrolled.c, icon: FaBookOpen, color: 'text-primary', href: '/dashboard/comprador/cursos' },
    { label: 'Completados', value: completed.c, icon: FaCheckCircle, color: 'text-brand-green', href: '/dashboard/comprador/cursos' },
    { label: 'Certificados', value: certs.c, icon: FaCertificate, color: 'text-brand-purple', href: '/dashboard/comprador/certificados' },
    { label: 'Favoritos', value: favs.c, icon: FaHeart, color: 'text-destructive', href: '/dashboard/comprador/favoritos' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">¡Hola, {session.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground mt-0.5">Continúa tu aprendizaje donde lo dejaste</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Mis cursos recientes</CardTitle>
              <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
                <Link href="/dashboard/comprador/cursos">Ver todos <FaArrowRight className="h-3 w-3" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {courses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FaBookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aún no tienes cursos.{' '}
                    <Link href="/cursos" className="text-primary hover:underline">¡Empieza ahora!</Link>
                  </p>
                </div>
              ) : courses.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="h-14 w-20 rounded-lg bg-muted overflow-hidden shrink-0">
                    {c.course_cover
                      ? <img src={c.course_cover} alt={c.course_name ?? ''} className="h-full w-full object-cover" />
                      : <div className="h-full w-full flex items-center justify-center"><FaBookOpen className="h-5 w-5 text-muted-foreground/40" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{c.course_name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Progress value={Number(c.progress_pct ?? 0)} className="flex-1 h-1.5" />
                      <span className="text-xs text-muted-foreground shrink-0">{Number(c.progress_pct ?? 0).toFixed(0)}%</span>
                    </div>
                    <Badge variant={c.state === 'completed' ? 'default' : 'secondary'} className="text-xs mt-1">
                      {STATE_LABELS[c.state ?? 'active'] ?? c.state}
                    </Badge>
                  </div>
                  <Button asChild size="sm" variant="ghost" className="shrink-0 self-center">
                    <Link href={`/dashboard/comprador/cursos/${c.course_slug}`}><FaPlay className="h-3 w-3" /></Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Últimas órdenes</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link href="/dashboard/comprador/ordenes">Ver todas</Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Sin órdenes aún</p>
              ) : orders.map(o => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{o.name}</p>
                    <p className="font-semibold">{formatCurrency(Number(o.amount_total), o.currency ?? 'USD')}</p>
                  </div>
                  <Badge variant={o.state === 'paid' ? 'default' : 'secondary'} className="text-xs">{o.state}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Acciones rápidas</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-1">
              {[
                { label: 'Explorar cursos', href: '/cursos', icon: FaFire },
                { label: 'Mis certificados', href: '/dashboard/comprador/certificados', icon: FaCertificate },
                { label: 'Favoritos', href: '/dashboard/comprador/favoritos', icon: FaHeart },
                { label: 'Mis compras', href: '/dashboard/comprador/ordenes', icon: FaShoppingBag },
              ].map(a => (
                <Button key={a.href} asChild variant="ghost" size="sm" className="justify-start gap-2 h-9">
                  <Link href={a.href}><a.icon className="h-4 w-4" />{a.label}</Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
