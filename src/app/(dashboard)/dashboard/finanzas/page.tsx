import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaDollarSign, FaArrowDown, FaPercent, FaFileInvoice } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { sale_order, sale_order_line, marketplace_payout } from '@/lib/db/schema'
import { eq, count, sum } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

export default async function FinanzasPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['finance', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const [grossRow] = await db.select({ s: sum(sale_order.amount_total), c: count() }).from(sale_order).where(eq(sale_order.payment_state, 'paid'))
  const [refRow] = await db.select({ s: sum(sale_order.amount_total) }).from(sale_order).where(eq(sale_order.payment_state, 'refunded'))
  const [commRow] = await db.select({ s: sum(sale_order_line.commission_amount) }).from(sale_order_line)
  const [storeAmtRow] = await db.select({ s: sum(sale_order_line.store_amount) }).from(sale_order_line)
  const [pendingPayRow] = await db.select({ c: count(), s: sum(marketplace_payout.amount) }).from(marketplace_payout).where(eq(marketplace_payout.state, 'pending'))

  const gross = Number(grossRow.s ?? 0)
  const refunds = Number(refRow.s ?? 0)
  const commission = Number(commRow.s ?? 0)
  const storeAmount = Number(storeAmtRow.s ?? 0)
  const net = gross - refunds

  const STATS = [
    { label: 'Ingresos brutos', value: formatCurrency(gross, 'USD'), sub: `${grossRow.c} transacciones`, icon: FaDollarSign, color: 'text-brand-green', bg: 'bg-brand-green/10' },
    { label: 'Reembolsos', value: formatCurrency(refunds, 'USD'), icon: FaArrowDown, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Comisiones plataforma', value: formatCurrency(commission, 'USD'), icon: FaPercent, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Pagos a tiendas', value: formatCurrency(storeAmount, 'USD'), icon: FaFileInvoice, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Finanzas</h1>
        <p className="text-muted-foreground mt-0.5">Panel financiero de la plataforma</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold leading-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                {(s as any).sub && <p className="text-xs text-muted-foreground/70">{(s as any).sub}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(pendingPayRow.c ?? 0) > 0 && (
        <Card className="border-brand-orange/30">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-sm">Liquidaciones pendientes</p>
              <p className="text-xs text-muted-foreground">{pendingPayRow.c} tiendas esperan {formatCurrency(Number(pendingPayRow.s ?? 0), 'USD')}</p>
            </div>
            <Button asChild size="sm" className="bg-brand-green hover:bg-brand-green-dark text-white text-xs">
              <Link href="/dashboard/finanzas/liquidaciones">Ver liquidaciones</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Button asChild variant="outline" className="h-20 flex-col gap-1 text-sm">
          <Link href="/dashboard/finanzas/cobros">
            <FaDollarSign className="h-5 w-5 text-brand-green" />
            <span>Cobros</span>
            <span className="text-xs text-muted-foreground">Órdenes pagadas</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col gap-1 text-sm">
          <Link href="/dashboard/finanzas/liquidaciones">
            <FaFileInvoice className="h-5 w-5 text-brand-purple" />
            <span>Liquidaciones</span>
            <span className="text-xs text-muted-foreground">Pagos a tiendas</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
