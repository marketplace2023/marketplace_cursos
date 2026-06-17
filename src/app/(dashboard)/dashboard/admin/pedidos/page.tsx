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
  cancelled: 'bg-muted text-muted-foreground',
  processing: 'bg-primary/10 text-primary border-primary/20',
}

export default async function AdminPedidosPage(props: { searchParams: Promise<{ payment_state?: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const sp = await props.searchParams
  const filterPayment = sp.payment_state

  const orders = await db
    .select({
      id: sale_order.id, name: sale_order.name,
      state: sale_order.state, payment_state: sale_order.payment_state,
      amount_total: sale_order.amount_total, currency: sale_order.currency,
      payment_gateway: sale_order.payment_gateway,
      created_at: sale_order.created_at, paid_at: sale_order.paid_at,
      buyer_name: res_users.name, buyer_email: res_users.email,
    })
    .from(sale_order)
    .innerJoin(res_users, eq(sale_order.buyer_id, res_users.id))
    .orderBy(desc(sale_order.created_at))
    .limit(100)

  const filtered = filterPayment ? orders.filter(o => o.payment_state === filterPayment) : orders
  const PAY_STATES = ['paid', 'pending', 'processing', 'failed', 'refunded', 'cancelled']

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Pedidos</h1>
        <p className="text-muted-foreground mt-0.5">{filtered.length} pedido{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['Todos', ...PAY_STATES].map((s, i) => (
          <a key={s} href={i === 0 ? '/dashboard/admin/pedidos' : `/dashboard/admin/pedidos?payment_state=${s}`}
            className={`h-7 px-3 text-xs rounded-md border flex items-center font-medium transition-colors ${(i === 0 ? !filterPayment : filterPayment === s) ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background hover:bg-muted'}`}>
            {i === 0 ? 'Todos' : s}
          </a>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left px-4 py-2.5">Orden</th>
                  <th className="text-left px-4 py-2.5">Comprador</th>
                  <th className="text-right px-4 py-2.5">Total</th>
                  <th className="text-center px-4 py-2.5">Estado</th>
                  <th className="text-right px-4 py-2.5">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-medium text-xs">{o.name}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium truncate max-w-32">{o.buyer_name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-32">{o.buyer_email}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(Number(o.amount_total ?? 0), o.currency ?? 'USD')}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={`text-xs border ${PAY_COLORS[o.payment_state] ?? ''}`}>{o.payment_state}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground text-xs">{formatDate(o.created_at)}</td>
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
