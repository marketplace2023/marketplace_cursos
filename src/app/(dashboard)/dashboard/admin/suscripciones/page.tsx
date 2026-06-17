import { redirect } from 'next/navigation'
import { FaLayerGroup } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_subscription, marketplace_subscription_plan, res_users } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  active: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  trial: 'bg-primary/10 text-primary border-primary/20',
  past_due: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  cancelled: 'bg-muted text-muted-foreground',
  expired: 'bg-muted text-muted-foreground',
}

export default async function AdminSuscripcionesPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const plans = await db.select().from(marketplace_subscription_plan).orderBy(marketplace_subscription_plan.sort_order)

  const subs = await db
    .select({
      id: marketplace_subscription.id, state: marketplace_subscription.state,
      current_period_end: marketplace_subscription.current_period_end,
      created_at: marketplace_subscription.created_at,
      plan_name: marketplace_subscription_plan.name,
      plan_price: marketplace_subscription_plan.price,
      user_name: res_users.name, user_email: res_users.email,
    })
    .from(marketplace_subscription)
    .innerJoin(marketplace_subscription_plan, eq(marketplace_subscription.plan_id, marketplace_subscription_plan.id))
    .innerJoin(res_users, eq(marketplace_subscription.user_id, res_users.id))
    .orderBy(desc(marketplace_subscription.created_at))
    .limit(100)

  const active = subs.filter(s => s.state === 'active' || s.state === 'trial')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Suscripciones</h1>
        <p className="text-muted-foreground mt-0.5">{active.length} activas de {subs.length} total</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Suscripciones activas', value: active.length, color: 'text-brand-green' },
          { label: 'Planes disponibles', value: plans.filter(p => p.active).length, color: 'text-primary' },
          { label: 'Total suscripciones', value: subs.length, color: 'text-muted-foreground' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Planes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {plans.map(p => (
              <Card key={p.id} className={!p.active ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold">{p.name}</p>
                    <Badge variant={p.active ? 'default' : 'secondary'} className="text-xs">{p.active ? 'Activo' : 'Inactivo'}</Badge>
                  </div>
                  <p className="text-xl font-bold text-primary">{formatCurrency(Number(p.price), p.currency ?? 'USD')}<span className="text-xs text-muted-foreground font-normal">/{p.period}</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.target} · {p.commission_rate ? `${p.commission_rate}% comisión` : 'Sin ajuste'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Suscriptores activos</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left px-4 py-2.5">Usuario</th>
                  <th className="text-left px-4 py-2.5">Plan</th>
                  <th className="text-center px-4 py-2.5">Estado</th>
                  <th className="text-right px-4 py-2.5">Vence</th>
                </tr>
              </thead>
              <tbody>
                {subs.map(s => (
                  <tr key={s.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{s.user_name}</p>
                      <p className="text-xs text-muted-foreground">{s.user_email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{s.plan_name} · {formatCurrency(Number(s.plan_price), 'USD')}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={`text-xs border ${STATE_COLORS[s.state] ?? ''}`}>{s.state}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">{s.current_period_end ? formatDate(s.current_period_end) : '—'}</td>
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
