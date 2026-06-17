import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaShoppingBag, FaExternalLinkAlt } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { sale_order, sale_order_line, product_template } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'

const ORDER_STATE: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Borrador', variant: 'outline' },
  confirmed: { label: 'Confirmada', variant: 'secondary' },
  paid: { label: 'Pagada', variant: 'default' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
  refunded: { label: 'Reembolsada', variant: 'outline' },
}

export default async function OrdenesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const orders = await db
    .select({
      id: sale_order.id,
      name: sale_order.name,
      state: sale_order.state,
      payment_state: sale_order.payment_state,
      amount_total: sale_order.amount_total,
      amount_discount: sale_order.amount_discount,
      currency: sale_order.currency,
      coupon_code: sale_order.coupon_code,
      created_at: sale_order.created_at,
      paid_at: sale_order.paid_at,
    })
    .from(sale_order)
    .where(eq(sale_order.buyer_id, Number(session.sub)))
    .orderBy(desc(sale_order.created_at))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Mis Órdenes</h1>
        <p className="text-muted-foreground mt-0.5">{orders.length} orden{orders.length !== 1 ? 'es' : ''} en total</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tienes órdenes</h3>
          <p className="text-muted-foreground mb-4">Cuando compres un curso, aparecerá aquí</p>
          <Button asChild className="bg-brand-green hover:bg-brand-green-dark text-white">
            <Link href="/cursos">Explorar cursos</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(o => {
            const st = ORDER_STATE[o.state ?? 'draft'] ?? ORDER_STATE.draft
            return (
              <Card key={o.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">{o.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {o.created_at ? formatDate(o.created_at) : '—'}
                      {o.paid_at && ` · Pagada el ${formatDate(o.paid_at)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={st.variant}>{st.label}</Badge>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/comprador/compras/${o.id}`}>
                        <FaExternalLinkAlt className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between pt-0">
                  <div className="text-sm text-muted-foreground">
                    {o.coupon_code && <span className="mr-3">Cupón: <code className="text-foreground">{o.coupon_code}</code></span>}
                    {Number(o.amount_discount ?? 0) > 0 && (
                      <span className="text-brand-green">-{formatCurrency(Number(o.amount_discount), o.currency ?? 'USD')} dto.</span>
                    )}
                  </div>
                  <p className="text-lg font-bold text-primary">{formatCurrency(Number(o.amount_total), o.currency ?? 'USD')}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
