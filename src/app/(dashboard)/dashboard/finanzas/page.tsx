import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FaDollarSign, FaArrowDown, FaPercent, FaFileInvoice,
  FaChevronRight, FaExclamationCircle,
} from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { sale_order, sale_order_line, marketplace_payout } from '@/lib/db/schema'
import { eq, count, sum } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

export default async function FinanzasPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['finance', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const [[grossRow], [refRow], [commRow], [storeAmtRow], [pendingPayRow]] = await Promise.all([
    db.select({ s: sum(sale_order.amount_total), c: count() }).from(sale_order).where(eq(sale_order.payment_state, 'paid')),
    db.select({ s: sum(sale_order.amount_total) }).from(sale_order).where(eq(sale_order.payment_state, 'refunded')),
    db.select({ s: sum(sale_order_line.commission_amount) }).from(sale_order_line),
    db.select({ s: sum(sale_order_line.store_amount) }).from(sale_order_line),
    db.select({ c: count(), s: sum(marketplace_payout.amount) }).from(marketplace_payout).where(eq(marketplace_payout.state, 'pending')),
  ])

  const gross = Number(grossRow.s ?? 0)
  const refunds = Number(refRow.s ?? 0)
  const commission = Number(commRow.s ?? 0)
  const storeAmount = Number(storeAmtRow.s ?? 0)
  const net = gross - refunds

  const STATS = [
    {
      label: 'Ingresos brutos', value: formatCurrency(gross, 'USD'), sub: `${grossRow.c} transacciones`,
      icon: FaDollarSign, gradient: 'from-brand-green/10 to-brand-green/5', iconBg: 'bg-brand-green', textColor: 'text-brand-green',
      href: '/dashboard/finanzas/cobros',
    },
    {
      label: 'Reembolsos', value: formatCurrency(refunds, 'USD'), sub: 'devuelto a compradores',
      icon: FaArrowDown, gradient: 'from-destructive/10 to-destructive/5', iconBg: 'bg-destructive', textColor: 'text-destructive',
      href: '/dashboard/finanzas/cobros',
    },
    {
      label: 'Comisión plataforma', value: formatCurrency(commission, 'USD'), sub: 'ingresos netos edumarket',
      icon: FaPercent, gradient: 'from-primary/8 to-brand-secondary/5', iconBg: 'bg-primary', textColor: 'text-primary',
      href: '/dashboard/finanzas/cobros',
    },
    {
      label: 'Pagos a tiendas', value: formatCurrency(storeAmount, 'USD'), sub: 'liquidado a vendedores',
      icon: FaFileInvoice, gradient: 'from-brand-purple/10 to-brand-purple/5', iconBg: 'bg-brand-purple', textColor: 'text-brand-purple',
      href: '/dashboard/finanzas/liquidaciones',
    },
  ]

  const netMargin = gross > 0 ? ((net / gross) * 100).toFixed(1) : '0.0'

  return (
    <div className="flex flex-col gap-6">

      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-green via-emerald-600 to-brand-green/60 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-black/10" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/70 font-medium">Panel financiero</p>
            <h1 className="text-2xl font-heading font-bold mt-0.5">Finanzas</h1>
            <p className="text-white/60 text-sm mt-1">
              {formatCurrency(gross, 'USD')} brutos · {netMargin}% margen neto
            </p>
          </div>
          <div className="shrink-0 hidden sm:flex h-16 w-16 rounded-2xl bg-white/10 items-center justify-center">
            <FaDollarSign className="h-8 w-8 text-white" />
          </div>
        </div>
        {(pendingPayRow.c ?? 0) > 0 && (
          <div className="relative mt-3 flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2">
            <FaExclamationCircle className="h-3 w-3 text-white" />
            <p className="text-xs text-white/80">
              {pendingPayRow.c} liquidaciones pendientes por {formatCurrency(Number(pendingPayRow.s ?? 0), 'USD')}
            </p>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <Link key={s.label} href={s.href} className="group">
            <Card className={`overflow-hidden border transition-all hover:shadow-md hover:-translate-y-0.5 bg-linear-to-br ${s.gradient}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-10 w-10 rounded-xl ${s.iconBg} flex items-center justify-center shadow-sm`}>
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <FaChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className={`text-xl font-bold tabular-nums leading-tight ${s.textColor}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground/60">{s.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Net revenue highlight */}
      <Card className="border-brand-green/20 bg-linear-to-r from-brand-green/5 to-transparent">
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Ingresos netos (bruto − reembolsos)</p>
            <p className="text-3xl font-bold text-brand-green tabular-nums">{formatCurrency(net, 'USD')}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">Margen</p>
            <p className="text-2xl font-bold text-brand-green">{netMargin}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Pending payout alert */}
      {(pendingPayRow.c ?? 0) > 0 && (
        <Card className="border-brand-orange/30 bg-brand-orange/5">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-brand-orange/10 flex items-center justify-center shrink-0">
                <FaExclamationCircle className="h-4 w-4 text-brand-orange" />
              </div>
              <div>
                <p className="font-semibold text-sm">Liquidaciones pendientes</p>
                <p className="text-xs text-muted-foreground">
                  {pendingPayRow.c} tiendas esperan {formatCurrency(Number(pendingPayRow.s ?? 0), 'USD')}
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="bg-brand-green hover:bg-brand-green/90 text-white text-xs shrink-0">
              <Link href="/dashboard/finanzas/liquidaciones">Liquidar ahora</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/dashboard/finanzas/cobros">
          <Card className="group hover:shadow-md transition-all hover:-translate-y-0.5 border-brand-green/15 bg-linear-to-br from-brand-green/8 to-brand-green/3">
            <CardContent className="p-5 flex flex-col items-center text-center gap-2">
              <div className="h-12 w-12 rounded-xl bg-brand-green flex items-center justify-center shadow-sm">
                <FaDollarSign className="h-6 w-6 text-white" />
              </div>
              <p className="font-semibold text-sm">Cobros</p>
              <p className="text-xs text-muted-foreground">Órdenes pagadas y transacciones</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/finanzas/liquidaciones">
          <Card className="group hover:shadow-md transition-all hover:-translate-y-0.5 border-brand-purple/15 bg-linear-to-br from-brand-purple/8 to-brand-purple/3">
            <CardContent className="p-5 flex flex-col items-center text-center gap-2">
              <div className="h-12 w-12 rounded-xl bg-brand-purple flex items-center justify-center shadow-sm">
                <FaFileInvoice className="h-6 w-6 text-white" />
              </div>
              <p className="font-semibold text-sm">Liquidaciones</p>
              <p className="text-xs text-muted-foreground">Pagos pendientes a tiendas</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
