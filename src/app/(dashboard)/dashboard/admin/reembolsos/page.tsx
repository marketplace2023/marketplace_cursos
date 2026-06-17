import { redirect } from 'next/navigation'
import { FaArrowDown } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { sale_order, res_users } from '@/lib/db/schema'
import { eq, desc, sum, count } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function AdminReembolsosPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const refunded = await db
    .select({
      id: sale_order.id, name: sale_order.name,
      amount_total: sale_order.amount_total, currency: sale_order.currency,
      payment_gateway: sale_order.payment_gateway, cancelled_at: sale_order.cancelled_at,
      created_at: sale_order.created_at, note: sale_order.note,
      buyer_name: res_users.name, buyer_email: res_users.email,
    })
    .from(sale_order)
    .innerJoin(res_users, eq(sale_order.buyer_id, res_users.id))
    .where(eq(sale_order.payment_state, 'refunded'))
    .orderBy(desc(sale_order.cancelled_at))
    .limit(100)

  const total = refunded.reduce((a, o) => a + Number(o.amount_total ?? 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Reembolsos</h1>
        <p className="text-muted-foreground mt-0.5">{refunded.length} reembolso{refunded.length !== 1 ? 's' : ''} · {formatCurrency(total, 'USD')} total</p>
      </div>

      {refunded.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaArrowDown className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin reembolsos registrados</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left px-4 py-2.5">Orden</th>
                    <th className="text-left px-4 py-2.5">Comprador</th>
                    <th className="text-left px-4 py-2.5">Motivo</th>
                    <th className="text-right px-4 py-2.5">Monto</th>
                    <th className="text-right px-4 py-2.5">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {refunded.map(o => (
                    <tr key={o.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs font-medium">{o.name}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{o.buyer_name}</p>
                        <p className="text-xs text-muted-foreground">{o.buyer_email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-32 truncate">{o.note || '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-red-500">{formatCurrency(Number(o.amount_total ?? 0), o.currency ?? 'USD')}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground text-xs">{o.cancelled_at ? formatDate(o.cancelled_at) : formatDate(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
