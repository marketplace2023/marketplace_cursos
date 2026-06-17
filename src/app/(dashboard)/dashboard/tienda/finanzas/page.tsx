import { redirect } from 'next/navigation'
import { FaDollarSign, FaArrowUp, FaPercent } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_store, sale_order, sale_order_line, product_template } from '@/lib/db/schema'
import { eq, desc, sum, count } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function TiendaFinanzasPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [store] = await db.select({ id: marketplace_store.id, commission_rate: marketplace_store.commission_rate })
    .from(marketplace_store).where(eq(marketplace_store.owner_id, Number(session.sub))).limit(1)
  if (!store) redirect('/dashboard/tienda/perfil?setup=1')

  const lines = await db
    .select({
      id: sale_order_line.id,
      unit_price: sale_order_line.unit_price,
      subtotal: sale_order_line.subtotal,
      commission_amount: sale_order_line.commission_amount,
      store_amount: sale_order_line.store_amount,
      discount_amount: sale_order_line.discount_amount,
      refunded: sale_order_line.refunded,
      refund_amount: sale_order_line.refund_amount,
      created_at: sale_order_line.created_at,
      course_name: product_template.name,
      order_name: sale_order.name,
      payment_state: sale_order.payment_state,
    })
    .from(sale_order_line)
    .innerJoin(product_template, eq(sale_order_line.course_id, product_template.id))
    .innerJoin(sale_order, eq(sale_order_line.order_id, sale_order.id))
    .where(eq(product_template.store_id, store.id))
    .orderBy(desc(sale_order_line.created_at))
    .limit(100)

  const paidLines = lines.filter(l => l.payment_state === 'paid')
  const grossRevenue = paidLines.reduce((a, l) => a + Number(l.subtotal ?? 0), 0)
  const commissionTotal = paidLines.reduce((a, l) => a + Number(l.commission_amount ?? 0), 0)
  const netRevenue = paidLines.reduce((a, l) => a + Number(l.store_amount ?? 0), 0)
  const refundedTotal = paidLines.filter(l => l.refunded).reduce((a, l) => a + Number(l.refund_amount ?? 0), 0)
  const commissionRate = Number(store.commission_rate ?? 15)

  const STATS = [
    { label: 'Ingresos brutos', value: formatCurrency(grossRevenue, 'USD'), icon: FaDollarSign, color: 'text-brand-green', bg: 'bg-brand-green/10' },
    { label: `Comisión (${commissionRate}%)`, value: formatCurrency(commissionTotal, 'USD'), icon: FaPercent, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
    { label: 'Ingresos netos', value: formatCurrency(netRevenue, 'USD'), icon: FaArrowUp, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Reembolsos', value: formatCurrency(refundedTotal, 'USD'), icon: FaDollarSign, color: 'text-destructive', bg: 'bg-destructive/10' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Finanzas</h1>
        <p className="text-muted-foreground mt-0.5">Resumen de ingresos y comisiones</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`h-10 w-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold truncate">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Historial de transacciones</CardTitle></CardHeader>
        <CardContent>
          {lines.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">Sin transacciones aún</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4">Fecha</th>
                    <th className="text-left py-2 pr-4">Orden</th>
                    <th className="text-left py-2 pr-4">Curso</th>
                    <th className="text-right py-2 pr-4">Bruto</th>
                    <th className="text-right py-2 pr-4">Comisión</th>
                    <th className="text-right py-2">Neto</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map(l => (
                    <tr key={l.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 pr-4 text-muted-foreground">{formatDate(l.created_at)}</td>
                      <td className="py-2.5 pr-4 font-mono text-xs">{l.order_name}</td>
                      <td className="py-2.5 pr-4 max-w-xs truncate">{l.course_name}</td>
                      <td className="py-2.5 pr-4 text-right">{formatCurrency(Number(l.subtotal ?? 0), 'USD')}</td>
                      <td className="py-2.5 pr-4 text-right text-brand-orange">-{formatCurrency(Number(l.commission_amount ?? 0), 'USD')}</td>
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
