import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaDownload, FaReceipt } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { sale_order, sale_order_line, product_template } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils'

const ORDER_STATE: Record<string, { label: string; class: string }> = {
  draft: { label: 'Borrador', class: 'bg-muted text-muted-foreground' },
  confirmed: { label: 'Confirmada', class: 'bg-primary/10 text-primary' },
  paid: { label: 'Pagada', class: 'bg-brand-green/10 text-brand-green' },
  cancelled: { label: 'Cancelada', class: 'bg-destructive/10 text-destructive' },
  refunded: { label: 'Reembolsada', class: 'bg-muted text-muted-foreground' },
}

const PAY_STATE: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pendiente', class: 'bg-brand-orange/10 text-brand-orange' },
  processing: { label: 'Procesando', class: 'bg-primary/10 text-primary' },
  paid: { label: 'Pagado', class: 'bg-brand-green/10 text-brand-green' },
  failed: { label: 'Fallido', class: 'bg-destructive/10 text-destructive' },
  refunded: { label: 'Reembolsado', class: 'bg-muted text-muted-foreground' },
}

export default async function OrdenDetallePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await getSession()
  if (!session) redirect('/login')

  const [order] = await db
    .select()
    .from(sale_order)
    .where(and(eq(sale_order.id, Number(params.id)), eq(sale_order.buyer_id, Number(session.sub))))
    .limit(1)

  if (!order) notFound()

  const lines = await db
    .select({
      id: sale_order_line.id,
      name: sale_order_line.name,
      unit_price: sale_order_line.unit_price,
      discount_amount: sale_order_line.discount_amount,
      subtotal: sale_order_line.subtotal,
      course_slug: product_template.slug,
      course_cover: product_template.cover_url,
    })
    .from(sale_order_line)
    .leftJoin(product_template, eq(sale_order_line.course_id, product_template.id))
    .where(eq(sale_order_line.order_id, order.id))

  const st = ORDER_STATE[order.state] ?? ORDER_STATE.draft
  const ps = PAY_STATE[order.payment_state] ?? PAY_STATE.pending

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/comprador/ordenes"><FaArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-heading font-bold">Orden {order.name}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge className={`border-0 ${st.class}`}>{st.label}</Badge>
        <Badge className={`border-0 ${ps.class}`}>{ps.label}</Badge>
        {order.payment_gateway && <Badge variant="outline">{order.payment_gateway}</Badge>}
      </div>

      <Card>
        <CardHeader><CardTitle>Artículos</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          {lines.map(l => (
            <div key={l.id} className="flex items-center gap-3">
              <div className="h-14 w-20 rounded-lg bg-muted overflow-hidden shrink-0">
                {l.course_cover && <img src={l.course_cover} alt={l.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/cursos/${l.course_slug}`} className="text-sm font-medium hover:text-primary transition-colors line-clamp-2">
                  {l.name}
                </Link>
                {Number(l.discount_amount ?? 0) > 0 && (
                  <p className="text-xs text-brand-green">-{formatCurrency(Number(l.discount_amount), order.currency ?? 'USD')} descuento</p>
                )}
              </div>
              <p className="font-bold shrink-0">{formatCurrency(Number(l.subtotal), order.currency ?? 'USD')}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Resumen</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(Number(order.amount_untaxed ?? 0), order.currency ?? 'USD')}</span>
          </div>
          {Number(order.amount_discount ?? 0) > 0 && (
            <div className="flex justify-between text-brand-green">
              <span>Descuento{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
              <span>-{formatCurrency(Number(order.amount_discount), order.currency ?? 'USD')}</span>
            </div>
          )}
          {Number(order.amount_tax ?? 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Impuestos</span>
              <span>{formatCurrency(Number(order.amount_tax), order.currency ?? 'USD')}</span>
            </div>
          )}
          <Separator className="my-1" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(Number(order.amount_total), order.currency ?? 'USD')}</span>
          </div>
        </CardContent>
      </Card>

      {order.billing_name && (
        <Card>
          <CardHeader><CardTitle>Datos de facturación</CardTitle></CardHeader>
          <CardContent className="text-sm flex flex-col gap-1 text-muted-foreground">
            {order.billing_name && <p className="text-foreground font-medium">{order.billing_name}</p>}
            {order.billing_email && <p>{order.billing_email}</p>}
            {order.billing_tax_id && <p>NIF/RUC: {order.billing_tax_id}</p>}
            {order.billing_address && <p>{order.billing_address}</p>}
          </CardContent>
        </Card>
      )}

      {order.payment_state === 'paid' && (
        <Button variant="outline" className="w-fit gap-2">
          <FaDownload className="h-4 w-4" /> Descargar factura
        </Button>
      )}
    </div>
  )
}
