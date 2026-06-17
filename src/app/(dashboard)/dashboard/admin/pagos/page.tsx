import { redirect } from 'next/navigation'
import { FaDollarSign, FaChartLine, FaPercent, FaArrowDown } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { sale_order, sale_order_line, res_users } from '@/lib/db/schema'
import { eq, desc, count, sum } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function AdminPagosPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const [grossRow] = await db.select({ s: sum(sale_order.amount_total) }).from(sale_order).where(eq(sale_order.payment_state, 'paid'))
  const [commRow] = await db.select({ s: sum(sale_order_line.commission_amount) }).from(sale_order_line)
  const [refRow] = await db.select({ s: sum(sale_order.amount_total), c: count() }).from(sale_order).where(eq(sale_order.payment_state, 'refunded'))
  const [orderCountRow] = await db.select({ c: count() }).from(sale_order).where(eq(sale_order.payment_state, 'paid'))

  const gross = Number(grossRow.s ?? 0)
  const commission = Number(commRow.s ?? 0)
  const refunds = Number(refRow.s ?? 0)
  const net = gross - refunds

  const recentPaid = await db
    .select({
      id: sale_order.id, name: sale_order.name,
      amount_total: sale_order.amount_total, currency: sale_order.currency,
      payment_gateway: sale_order.payment_gateway, paid_at: sale_order.paid_at,
      buyer_name: res_users.name,
    })
    .from(sale_order)
    .innerJoin(res_users, eq(sale_order.buyer_id, res_users.id))
    .where(eq(sale_order.payment_state, 'paid'))
    .orderBy(desc(sale_order.paid_at))
    .limit(20)

  const STATS = [
    { label: 'Ingresos brutos', value: formatCurrency(gross, 'USD'), icon: FaDollarSign, color: 'text-brand-green', bg: 'bg-brand-green/10' },
    { label: 'Comisiones', value: formatCurrency(commission, 'USD'), icon: FaPercent, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Reembolsos', value: formatCurrency(refunds, 'USD'), sub: `${refRow.c} órdenes`, icon: FaArrowDown, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Ingresos netos', value: formatCurrency(net, 'USD'), sub: `${orderCountRow.c} pagos`, icon: FaChartLine, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Pagos</h1>
        <p className="text-muted-foreground mt-0.5">Resumen financiero de la plataforma</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                {(s as any).sub && <p className="text-xs text-muted-foreground/70">{(s as any).sub}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Pagos recientes</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left px-4 py-2.5">Orden</th>
                  <th className="text-left px-4 py-2.5">Comprador</th>
                  <th className="text-center px-4 py-2.5">Método</th>
                  <th className="text-right px-4 py-2.5">Monto</th>
                  <th className="text-right px-4 py-2.5">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentPaid.map(o => (
                  <tr key={o.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{o.name}</td>
                    <td className="px-4 py-3 truncate max-w-32 text-xs">{o.buyer_name}</td>
                    <td className="px-4 py-3 text-center">
                      {o.payment_gateway && <Badge variant="outline" className="text-xs">{o.payment_gateway}</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-green">{formatCurrency(Number(o.amount_total ?? 0), o.currency ?? 'USD')}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground text-xs">{o.paid_at ? formatDate(o.paid_at) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
