import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaDollarSign, FaExternalLinkAlt } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_store, sale_order, sale_order_line, product_template, res_users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'

const PAY: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pendiente', class: 'bg-brand-orange/10 text-brand-orange' },
  paid: { label: 'Pagada', class: 'bg-brand-green/10 text-brand-green' },
  failed: { label: 'Fallida', class: 'bg-destructive/10 text-destructive' },
  refunded: { label: 'Reembolsada', class: 'bg-muted text-muted-foreground' },
}

export default async function TiendaVentasPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [store] = await db.select({ id: marketplace_store.id })
    .from(marketplace_store).where(eq(marketplace_store.owner_id, Number(session.sub))).limit(1)
  if (!store) redirect('/dashboard/tienda/perfil?setup=1')

  const orders = await db
    .selectDistinct({
      id: sale_order.id,
      name: sale_order.name,
      state: sale_order.state,
      payment_state: sale_order.payment_state,
      amount_total: sale_order.amount_total,
      currency: sale_order.currency,
      created_at: sale_order.created_at,
      buyer_name: res_users.name,
      buyer_email: res_users.email,
    })
    .from(sale_order)
    .innerJoin(sale_order_line, eq(sale_order_line.order_id, sale_order.id))
    .innerJoin(product_template, eq(sale_order_line.course_id, product_template.id))
    .innerJoin(res_users, eq(sale_order.buyer_id, res_users.id))
    .where(eq(product_template.store_id, store.id))
    .orderBy(desc(sale_order.created_at))
    .limit(100)

  const totalRevenue = orders.filter(o => o.payment_state === 'paid').reduce((a, o) => a + Number(o.amount_total), 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Ventas</h1>
        <p className="text-muted-foreground mt-0.5">
          {orders.length} orden{orders.length !== 1 ? 'es' : ''} · Ingresos: <strong className="text-brand-green">{formatCurrency(totalRevenue, 'USD')}</strong>
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaDollarSign className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin ventas aún</h3>
          <p className="text-muted-foreground">Cuando alguien compre un curso, aparecerá aquí</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(o => {
            const pay = PAY[o.payment_state ?? 'pending'] ?? PAY.pending
            return (
              <Card key={o.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-medium">{o.name}</p>
                      <Badge className={`text-xs border-0 ${pay.class}`}>{pay.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {o.buyer_name} · {o.buyer_email} · {formatDate(o.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="font-bold text-brand-green">{formatCurrency(Number(o.amount_total), o.currency ?? 'USD')}</p>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/tienda/ventas/${o.id}`}><FaExternalLinkAlt className="h-3.5 w-3.5" /></Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
