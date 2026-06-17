import { redirect } from 'next/navigation'
import { FaChartBar, FaUsers, FaDollarSign, FaStar, FaBookOpen } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import {
  marketplace_store, sale_order_line, product_template,
  marketplace_enrollment, marketplace_review, sale_order,
} from '@/lib/db/schema'
import { eq, count, sum, avg } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default async function TiendaReportesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [store] = await db.select({
    id: marketplace_store.id,
    total_courses: marketplace_store.total_courses,
    total_students: marketplace_store.total_students,
    rating_avg: marketplace_store.rating_avg,
    rating_count: marketplace_store.rating_count,
  })
    .from(marketplace_store).where(eq(marketplace_store.owner_id, Number(session.sub))).limit(1)
  if (!store) redirect('/dashboard/tienda/perfil?setup=1')

  const [enrollStats] = await db
    .select({ total: count(), completed: count() })
    .from(marketplace_enrollment)
    .innerJoin(product_template, eq(marketplace_enrollment.course_id, product_template.id))
    .where(eq(product_template.store_id, store.id))

  const courseStats = await db
    .select({
      id: product_template.id, name: product_template.name, slug: product_template.slug,
      total_students: product_template.total_students, rating_avg: product_template.rating_avg,
      list_price: product_template.list_price,
    })
    .from(product_template)
    .where(eq(product_template.store_id, store.id))
    .orderBy(product_template.total_students)
    .limit(10)

  const KPIS = [
    { label: 'Cursos totales', value: store.total_courses ?? 0, icon: FaBookOpen, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Estudiantes totales', value: store.total_students ?? 0, icon: FaUsers, color: 'text-brand-green', bg: 'bg-brand-green/10' },
    { label: 'Rating promedio', value: `${Number(store.rating_avg ?? 0).toFixed(2)} / 5`, icon: FaStar, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
    { label: 'Total reseñas', value: store.rating_count ?? 0, icon: FaChartBar, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Reportes</h1>
        <p className="text-muted-foreground mt-0.5">Métricas generales de tu tienda</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map(k => (
          <Card key={k.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`h-10 w-10 rounded-lg ${k.bg} ${k.color} flex items-center justify-center shrink-0`}>
                <k.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold truncate">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Cursos por rendimiento</CardTitle></CardHeader>
        <CardContent>
          {courseStats.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">Sin cursos para mostrar</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4">Curso</th>
                    <th className="text-right py-2 pr-4">Estudiantes</th>
                    <th className="text-right py-2 pr-4">Rating</th>
                    <th className="text-right py-2">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {[...courseStats].sort((a, b) => (b.total_students ?? 0) - (a.total_students ?? 0)).map(c => (
                    <tr key={c.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 pr-4 max-w-xs truncate font-medium">{c.name}</td>
                      <td className="py-2.5 pr-4 text-right text-brand-green font-bold">{c.total_students ?? 0}</td>
                      <td className="py-2.5 pr-4 text-right text-brand-orange">{Number(c.rating_avg ?? 0).toFixed(1)} ⭐</td>
                      <td className="py-2.5 text-right">{formatCurrency(Number(c.list_price ?? 0), 'USD')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
