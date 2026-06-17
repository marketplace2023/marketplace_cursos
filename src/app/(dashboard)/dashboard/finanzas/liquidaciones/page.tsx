import { redirect } from 'next/navigation'
import { FaFileInvoice } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_payout, marketplace_store } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  pending: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  processing: 'bg-primary/10 text-primary border-primary/20',
  paid: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  cancelled: 'bg-muted text-muted-foreground',
}
const STATE_LABELS: Record<string, string> = {
  pending: 'Pendiente', processing: 'En proceso', paid: 'Pagado', failed: 'Fallido', cancelled: 'Cancelado',
}

export default async function FinanzasLiquidacionesPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['finance', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const payouts = await db
    .select({
      id: marketplace_payout.id, amount: marketplace_payout.amount,
      currency: marketplace_payout.currency, state: marketplace_payout.state,
      payment_method: marketplace_payout.payment_method,
      payment_reference: marketplace_payout.payment_reference,
      period_start: marketplace_payout.period_start, period_end: marketplace_payout.period_end,
      processed_at: marketplace_payout.processed_at, created_at: marketplace_payout.created_at,
      store_name: marketplace_store.name,
    })
    .from(marketplace_payout)
    .innerJoin(marketplace_store, eq(marketplace_payout.store_id, marketplace_store.id))
    .orderBy(desc(marketplace_payout.created_at))
    .limit(100)

  const pendingTotal = payouts.filter(p => p.state === 'pending').reduce((a, p) => a + Number(p.amount), 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Liquidaciones</h1>
        <p className="text-muted-foreground mt-0.5">{payouts.length} liquidaciones · {formatCurrency(pendingTotal, 'USD')} pendientes</p>
      </div>

      {payouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaFileInvoice className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin liquidaciones registradas</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left px-4 py-2.5">Tienda</th>
                    <th className="text-left px-4 py-2.5">Período</th>
                    <th className="text-left px-4 py-2.5">Método</th>
                    <th className="text-center px-4 py-2.5">Estado</th>
                    <th className="text-right px-4 py-2.5">Monto</th>
                    <th className="text-right px-4 py-2.5">Procesado</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(p => (
                    <tr key={p.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-medium truncate max-w-32">{p.store_name}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {p.period_start ? `${formatDate(p.period_start)} – ${p.period_end ? formatDate(p.period_end) : ''}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.payment_method ?? '—'}</td>
                      <td className="px-4 py-2.5 text-center">
                        <Badge className={`text-xs border ${STATE_COLORS[p.state] ?? ''}`}>{STATE_LABELS[p.state] ?? p.state}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-brand-green">{formatCurrency(Number(p.amount), p.currency ?? 'USD')}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">{p.processed_at ? formatDate(p.processed_at) : '—'}</td>
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
