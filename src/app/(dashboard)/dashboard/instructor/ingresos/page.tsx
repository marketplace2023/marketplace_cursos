import { redirect } from 'next/navigation'
import { FaDollarSign, FaPercent } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { sale_order_line, product_template, sale_order } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function InstructorIngresosPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const lines = await db
    .select({
      id: sale_order_line.id,
      subtotal: sale_order_line.subtotal,
      commission_amount: sale_order_line.commission_amount,
      store_amount: sale_order_line.store_amount,
      created_at: sale_order_line.created_at,
      course_name: product_template.name,
      order_name: sale_order.name,
      payment_state: sale_order.payment_state,
    })
    .from(sale_order_line)
    .innerJoin(product_template, eq(sale_order_line.course_id, product_template.id))
    .innerJoin(sale_order, eq(sale_order_line.order_id, sale_order.id))
    .where(eq(product_template.instructor_id, Number(session.sub)))
    .orderBy(desc(sale_order_line.created_at))
    .limit(100)

  const paidLines = lines.filter(l => l.payment_state === 'paid')
  const gross = paidLines.reduce((a, l) => a + Number(l.subtotal ?? 0), 0)
  const commission = paidLines.reduce((a, l) => a + Number(l.commission_amount ?? 0), 0)
  const net = paidLines.reduce((a, l) => a + Number(l.store_amount ?? 0), 0)

  const STATS = [
    { label: 'Ventas brutas', value: formatCurrency(gross, 'USD'), icon: FaDollarSign, color: 'text-brand-green', bg: 'bg-brand-green/10' },
    { label: 'Comisiones plataforma', value: formatCurrency(commission, 'USD'), icon: FaPercent, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
    { label: 'Ingresos netos', value: formatCurrency(net, 'USD'), icon: FaDollarSign, color: 'text-primary', bg: 'bg-primary/10' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Ingresos</h1>
        <p className="text-muted-foreground mt-0.5">Historial de ventas de tus cursos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map(s => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`h-10 w-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Transacciones</CardTitle></CardHeader>
        <CardContent>
          {lines.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">Sin ventas aún</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4">Fecha</th>
                    <th className="text-left py-2 pr-4">Curso</th>
                    <th className="text-right py-2 pr-4">Venta</th>
                    <th className="text-right py-2">Neto</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map(l => (
                    <tr key={l.id} className="border-b hover:bg-muted/30">
                      <td className="py-2.5 pr-4 text-muted-foreground">{formatDate(l.created_at)}</td>
                      <td className="py-2.5 pr-4 max-w-xs truncate">{l.course_name}</td>
                      <td className="py-2.5 pr-4 text-right">{formatCurrency(Number(l.subtotal ?? 0), 'USD')}</td>
                      <td className="py-2.5 text-right font-semibold text-brand-green">{formatCurrency(Number(l.store_amount ?? 0), 'USD')}</td>
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
