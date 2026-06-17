import { redirect } from 'next/navigation'
import { FaPercent } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { sale_order_line, product_template, marketplace_store, sale_order } from '@/lib/db/schema'
import { eq, desc, sum, count } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function AdminComisionesPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const [totalCommRow] = await db.select({ s: sum(sale_order_line.commission_amount) }).from(sale_order_line)
  const [storeAmtRow] = await db.select({ s: sum(sale_order_line.store_amount) }).from(sale_order_line)

  const storeCommissions = await db
    .select({
      store_id: marketplace_store.id,
      store_name: marketplace_store.name,
      commission_rate: marketplace_store.commission_rate,
      total_sales: marketplace_store.total_sales,
    })
    .from(marketplace_store)
    .where(eq(marketplace_store.state, 'active'))
    .orderBy(marketplace_store.total_sales)
    .limit(50)

  const storeStats = await Promise.all(
    storeCommissions.map(async s => {
      const [row] = await db.select({ comm: sum(sale_order_line.commission_amount), rev: sum(sale_order_line.store_amount) })
        .from(sale_order_line)
        .innerJoin(product_template, eq(sale_order_line.course_id, product_template.id))
        .where(eq(product_template.store_id, s.store_id))
      return { ...s, commission: Number(row.comm ?? 0), revenue: Number(row.rev ?? 0) }
    })
  )

  const totalComm = Number(totalCommRow.s ?? 0)
  const totalStore = Number(storeAmtRow.s ?? 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Comisiones</h1>
        <p className="text-muted-foreground mt-0.5">Resumen de comisiones por tienda</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FaPercent className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{formatCurrency(totalComm, 'USD')}</p>
              <p className="text-xs text-muted-foreground">Total comisiones plataforma</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
              <FaPercent className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{formatCurrency(totalStore, 'USD')}</p>
              <p className="text-xs text-muted-foreground">Total pagado a tiendas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Desglose por tienda</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left px-4 py-2.5">Tienda</th>
                  <th className="text-center px-4 py-2.5">Tasa %</th>
                  <th className="text-right px-4 py-2.5">Ventas</th>
                  <th className="text-right px-4 py-2.5">Comisión</th>
                  <th className="text-right px-4 py-2.5">Pago tienda</th>
                </tr>
              </thead>
              <tbody>
                {storeStats.filter(s => s.commission > 0 || s.revenue > 0).map(s => (
                  <tr key={s.store_id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-medium">{s.store_name}</td>
                    <td className="px-4 py-2.5 text-center text-muted-foreground">{s.commission_rate}%</td>
                    <td className="px-4 py-2.5 text-right">{s.total_sales}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-primary">{formatCurrency(s.commission, 'USD')}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-brand-green">{formatCurrency(s.revenue, 'USD')}</td>
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
