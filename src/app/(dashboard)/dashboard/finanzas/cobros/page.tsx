import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { sale_order, res_users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'

const PAY_COLORS: Record<string, string> = {
  paid: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  pending: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  refunded: 'bg-muted text-muted-foreground',
  processing: 'bg-primary/10 text-primary border-primary/20',
}

export default async function FinanzasCobrosPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['finance', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const orders = await db
    .select({
      id: sale_order.id, name: sale_order.name,
      amount_total: sale_order.amount_total, currency: sale_order.currency,
      payment_state: sale_order.payment_state, payment_gateway: sale_order.payment_gateway,
      paid_at: sale_order.paid_at, created_at: sale_order.created_at,
      buyer_name: res_users.name, buyer_email: res_users.email,
    })
    .from(sale_order)
    .innerJoin(res_users, eq(sale_order.buyer_id, res_users.id))
    .orderBy(desc(sale_order.created_at))
    .limit(200)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Cobros</h1>
        <p className="text-muted-foreground mt-0.5">{orders.length} transacciones</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left px-4 py-2.5">Orden</th>
                  <th className="text-left px-4 py-2.5">Comprador</th>
                  <th className="text-center px-4 py-2.5">Método</th>
                  <th className="text-center px-4 py-2.5">Estado</th>
                  <th className="text-right px-4 py-2.5">Monto</th>
                  <th className="text-right px-4 py-2.5">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-mono text-xs">{o.name}</td>
                    <td className="px-4 py-2.5">
                      <p className="text-sm font-medium truncate max-w-28">{o.buyer_name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-28">{o.buyer_email}</p>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {o.payment_gateway && <Badge variant="outline" className="text-xs">{o.payment_gateway}</Badge>}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge className={`text-xs border ${PAY_COLORS[o.payment_state] ?? ''}`}>{o.payment_state}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold">{formatCurrency(Number(o.amount_total ?? 0), o.currency ?? 'USD')}</td>
                    <td className="px-4 py-2.5 text-right text-xs text-muted-foreground whitespace-nowrap">{formatDate(o.created_at)}</td>
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
