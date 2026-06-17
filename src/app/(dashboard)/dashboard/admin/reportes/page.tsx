import { redirect } from 'next/navigation'
import { FaChartLine, FaUsers, FaBook, FaDollarSign, FaStore, FaStar } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { res_users, marketplace_store, product_template, sale_order, marketplace_enrollment, marketplace_review } from '@/lib/db/schema'
import { eq, count, sum, desc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default async function AdminReportesPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin', 'analyst'].includes(session.role)) redirect('/dashboard')

  const [usersRow] = await db.select({ c: count() }).from(res_users)
  const [activeUsersRow] = await db.select({ c: count() }).from(res_users).where(eq(res_users.state, 'active'))
  const [storesRow] = await db.select({ c: count() }).from(marketplace_store).where(eq(marketplace_store.state, 'active'))
  const [coursesRow] = await db.select({ c: count() }).from(product_template).where(eq(product_template.state, 'published'))
  const [enrollRow] = await db.select({ c: count() }).from(marketplace_enrollment)
  const [completedRow] = await db.select({ c: count() }).from(marketplace_enrollment).where(eq(marketplace_enrollment.state, 'completed'))
  const [revenueRow] = await db.select({ s: sum(sale_order.amount_total) }).from(sale_order).where(eq(sale_order.payment_state, 'paid'))
  const [reviewRow] = await db.select({ c: count() }).from(marketplace_review).where(eq(marketplace_review.state, 'published'))

  const topCourses = await db
    .select({ id: product_template.id, name: product_template.name, total_students: product_template.total_students, rating_avg: product_template.rating_avg })
    .from(product_template)
    .where(eq(product_template.state, 'published'))
    .orderBy(desc(product_template.total_students))
    .limit(10)

  const topStores = await db
    .select({ id: marketplace_store.id, name: marketplace_store.name, total_students: marketplace_store.total_students, rating_avg: marketplace_store.rating_avg, total_courses: marketplace_store.total_courses })
    .from(marketplace_store)
    .where(eq(marketplace_store.state, 'active'))
    .orderBy(desc(marketplace_store.total_students))
    .limit(5)

  const completionRate = enrollRow.c > 0 ? (completedRow.c / enrollRow.c * 100).toFixed(1) : '0.0'
  const gross = Number(revenueRow.s ?? 0)

  const STATS = [
    { label: 'Usuarios totales', value: usersRow.c, sub: `${activeUsersRow.c} activos`, icon: FaUsers, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Tiendas activas', value: storesRow.c, icon: FaStore, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
    { label: 'Cursos publicados', value: coursesRow.c, icon: FaBook, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
    { label: 'Inscripciones', value: enrollRow.c, sub: `${completionRate}% tasa`, icon: FaChartLine, color: 'text-brand-green', bg: 'bg-brand-green/10' },
    { label: 'Ingresos brutos', value: formatCurrency(gross, 'USD'), icon: FaDollarSign, color: 'text-brand-green', bg: 'bg-brand-green/10' },
    { label: 'Reseñas publicadas', value: reviewRow.c, icon: FaStar, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Reportes</h1>
        <p className="text-muted-foreground mt-0.5">Métricas globales de la plataforma</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {STATS.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-xl leading-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                {(s as any).sub && <p className="text-xs text-muted-foreground/70">{(s as any).sub}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Top 10 cursos</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-muted-foreground text-xs"><th className="text-left px-4 py-2">Curso</th><th className="text-right px-4 py-2">Estudiantes</th><th className="text-right px-4 py-2">Rating</th></tr></thead>
              <tbody>
                {topCourses.map((c, i) => (
                  <tr key={c.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-muted-foreground mr-2">#{i + 1}</span>
                      <span className="truncate max-w-48 inline-block align-middle">{c.name}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium">{c.total_students}</td>
                    <td className="px-4 py-2.5 text-right text-brand-orange">{Number(c.rating_avg ?? 0).toFixed(1)} ★</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top tiendas</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-muted-foreground text-xs"><th className="text-left px-4 py-2">Tienda</th><th className="text-right px-4 py-2">Cursos</th><th className="text-right px-4 py-2">Estudiantes</th></tr></thead>
              <tbody>
                {topStores.map((s, i) => (
                  <tr key={s.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-muted-foreground mr-2">#{i + 1}</span>
                      <span className="truncate max-w-40 inline-block align-middle">{s.name}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">{s.total_courses}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-brand-green">{s.total_students}</td>
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
