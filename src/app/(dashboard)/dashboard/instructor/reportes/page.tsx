import { redirect } from 'next/navigation'
import { FaChartLine, FaUsers, FaDollarSign, FaStar } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { product_template, marketplace_enrollment, marketplace_review, sale_order_line, sale_order } from '@/lib/db/schema'
import { eq, and, count, sum, avg } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils'

export default async function InstructorReportesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const courses = await db
    .select({
      id: product_template.id, name: product_template.name,
      state: product_template.state, total_students: product_template.total_students,
      rating_avg: product_template.rating_avg, rating_count: product_template.rating_count,
    })
    .from(product_template)
    .where(eq(product_template.instructor_id, Number(session.sub)))

  const courseStats = await Promise.all(
    courses.map(async c => {
      const [enrRow] = await db.select({ c: count() }).from(marketplace_enrollment).where(eq(marketplace_enrollment.course_id, c.id))
      const [compRow] = await db.select({ c: count() }).from(marketplace_enrollment)
        .where(and(eq(marketplace_enrollment.course_id, c.id), eq(marketplace_enrollment.state, 'completed')))
      const lines = await db.select({ amount: sale_order_line.store_amount })
        .from(sale_order_line)
        .innerJoin(sale_order, eq(sale_order_line.order_id, sale_order.id))
        .where(and(eq(sale_order_line.course_id, c.id), eq(sale_order.payment_state, 'paid')))
      const revenue = lines.reduce((a, l) => a + Number(l.amount ?? 0), 0)
      return { ...c, enrolled: enrRow.c, completed: compRow.c, revenue }
    })
  )

  const totalStudents = courseStats.reduce((a, c) => a + c.enrolled, 0)
  const totalRevenue = courseStats.reduce((a, c) => a + c.revenue, 0)
  const totalCourses = courses.length
  const publishedCourses = courses.filter(c => c.state === 'published').length
  const ratingAvgs = courseStats.filter(c => Number(c.rating_avg) > 0).map(c => Number(c.rating_avg))
  const avgRating = ratingAvgs.length > 0 ? ratingAvgs.reduce((a, b) => a + b, 0) / ratingAvgs.length : 0

  const STATS = [
    { label: 'Cursos publicados', value: `${publishedCourses}/${totalCourses}`, icon: FaChartLine, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total estudiantes', value: String(totalStudents), icon: FaUsers, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
    { label: 'Ingresos netos', value: formatCurrency(totalRevenue, 'USD'), icon: FaDollarSign, color: 'text-brand-green', bg: 'bg-brand-green/10' },
    { label: 'Rating promedio', value: avgRating > 0 ? avgRating.toFixed(1) : '—', icon: FaStar, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
  ]

  const maxStudents = Math.max(...courseStats.map(c => c.enrolled), 1)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Reportes</h1>
        <p className="text-muted-foreground mt-0.5">Rendimiento general de tus cursos</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Rendimiento por curso</CardTitle></CardHeader>
        <CardContent>
          {courseStats.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">Sin cursos aún</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4">Curso</th>
                    <th className="text-right py-2 pr-4">Estudiantes</th>
                    <th className="text-right py-2 pr-4">Completados</th>
                    <th className="text-right py-2 pr-4">Rating</th>
                    <th className="text-right py-2">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {courseStats.sort((a, b) => b.enrolled - a.enrolled).map(c => {
                    const completionPct = c.enrolled > 0 ? (c.completed / c.enrolled) * 100 : 0
                    return (
                      <tr key={c.id} className="border-b hover:bg-muted/30">
                        <td className="py-3 pr-4">
                          <div>
                            <p className="font-medium truncate max-w-[200px]">{c.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={(c.enrolled / maxStudents) * 100} className="h-1 w-20" />
                              <span className="text-xs text-muted-foreground">{completionPct.toFixed(0)}% tasa</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-right font-medium">{c.enrolled}</td>
                        <td className="py-3 pr-4 text-right text-brand-green font-medium">{c.completed}</td>
                        <td className="py-3 pr-4 text-right">
                          {Number(c.rating_avg) > 0 ? (
                            <span className="text-brand-orange font-medium">{Number(c.rating_avg).toFixed(1)} ★</span>
                          ) : '—'}
                        </td>
                        <td className="py-3 text-right font-semibold">{formatCurrency(c.revenue, 'USD')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
