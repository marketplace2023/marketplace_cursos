import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import {
  marketplace_store, sale_order, sale_order_line, product_template, res_users,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils'

const PAY: Record<string, { label: string; class: string }> = {
  paid: { label: 'Pagado', class: 'bg-brand-green/10 text-brand-green' },
  pending: { label: 'Pendiente', class: 'bg-brand-orange/10 text-brand-orange' },
  refunded: { label: 'Reembolsado', class: 'bg-muted text-muted-foreground' },
  failed: { label: 'Fallido', class: 'bg-destructive/10 text-destructive' },
}

export default async function TiendaVentaDetallePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await getSession()
  if (!session) redirect('/login')

  const [store] = await db.select({ id: marketplace_store.id })
    .from(marketplace_store).where(eq(marketplace_store.owner_id, Number(session.sub))).limit(1)
  if (!store) redirect('/dashboard/tienda/perfil?setup=1')

  const [order] = await db
    .select({
      id: sale_order.id, name: sale_order.name, state: sale_order.state,
      payment_state: sale_order.payment_state, amount_total: sale_order.amount_total,
      amount_discount: sale_order.amount_discount, currency: sale_order.currency,
      coupon_code: sale_order.coupon_code, created_at: sale_order.created_at,
      paid_at: sale_order.paid_at, billing_name: sale_order.billing_name,
      billing_email: sale_order.billing_email, billing_tax_id: sale_order.billing_tax_id,
      payment_method: sale_order.payment_method, payment_gateway: sale_order.payment_gateway,
      buyer_name: res_users.name, buyer_email: res_users.email,
    })
    .from(sale_order)
    .innerJoin(sale_order_line, eq(sale_order_line.order_id, sale_order.id))
    .innerJoin(product_template, eq(sale_order_line.course_id, product_template.id))
    .innerJoin(res_users, eq(sale_order.buyer_id, res_users.id))
    .where(and(eq(sale_order.id, Number(params.id)), eq(product_template.store_id, store.id)))
    .limit(1)

  if (!order) notFound()

  const lines = await db
    .select({
      id: sale_order_line.id, name: sale_order_line.name,
      unit_price: sale_order_line.unit_price, subtotal: sale_order_line.subtotal,
      commission_amount: sale_order_line.commission_amount, store_amount: sale_order_line.store_amount,
      discount_amount: sale_order_line.discount_amount,
      course_slug: product_template.slug, course_cover: product_template.cover_url,
    })
    .from(sale_order_line)
    .leftJoin(product_template, eq(sale_order_line.course_id, product_template.id))
    .where(eq(sale_order_line.order_id, order.id))

  const pay = PAY[order.payment_state ?? 'pending'] ?? PAY.pending

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/tienda/ventas"><FaArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-heading font-bold">Venta {order.name}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge className={`border-0 ${pay.class}`}>{pay.label}</Badge>
        {order.payment_method && <Badge variant="outline">{order.payment_method}</Badge>}
        {order.payment_gateway && <Badge variant="outline">{order.payment_gateway}</Badge>}
      </div>

      <Card>
        <CardHeader><CardTitle>Comprador</CardTitle></CardHeader>
        <CardContent className="text-sm flex flex-col gap-1">
          <p className="font-medium">{order.buyer_name}</p>
          <p className="text-muted-foreground">{order.buyer_email}</p>
          {order.billing_name && order.billing_name !== order.buyer_name && (
            <p className="text-muted-foreground mt-2">Facturar a: {order.billing_name} {order.billing_tax_id ? `(${order.billing_tax_id})` : ''}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Artículos</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          {lines.map(l => (
            <div key={l.id} className="flex items-center gap-3">
              <div className="h-14 w-20 rounded-lg bg-muted overflow-hidden shrink-0">
                {l.course_cover && <img src={l.course_cover} alt={l.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">{l.name}</p>
                <p className="text-xs text-muted-foreground">
                  Precio: {formatCurrency(Number(l.unit_price), order.currency ?? 'USD')}
                  {Number(l.commission_amount ?? 0) > 0 && ` · Comisión: -${formatCurrency(Number(l.commission_amount), order.currency ?? 'USD')}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold">{formatCurrency(Number(l.subtotal), order.currency ?? 'USD')}</p>
                <p className="text-xs text-brand-green">Neto: {formatCurrency(Number(l.store_amount ?? 0), order.currency ?? 'USD')}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 flex flex-col gap-2 text-sm">
          {Number(order.amount_discount ?? 0) > 0 && (
            <div className="flex justify-between text-brand-green">
              <span>Descuento{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
              <span>-{formatCurrency(Number(order.amount_discount), order.currency ?? 'USD')}</span>
            </div>
          )}
          <Separator className="my-1" />
          <div className="flex justify-between font-bold text-base">
            <span>Total de la venta</span>
            <span className="text-primary">{formatCurrency(Number(order.amount_total), order.currency ?? 'USD')}</span>
          </div>
          <div className="flex justify-between text-brand-green font-medium">
            <span>Tu ingreso neto</span>
            <span>{formatCurrency(lines.reduce((a, l) => a + Number(l.store_amount ?? 0), 0), order.currency ?? 'USD')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
