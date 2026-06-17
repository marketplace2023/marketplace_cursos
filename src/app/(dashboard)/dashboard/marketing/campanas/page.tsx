import { redirect } from 'next/navigation'
import { FaBullhorn, FaCheck, FaTimes } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_ad_campaign, marketplace_store } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  active: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  pending: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  draft: 'bg-muted text-muted-foreground',
  paused: 'bg-muted text-muted-foreground',
  ended: 'bg-muted text-muted-foreground',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
}
const STATE_LABELS: Record<string, string> = {
  active: 'Activa', pending: 'Pendiente', draft: 'Borrador',
  paused: 'Pausada', ended: 'Terminada', rejected: 'Rechazada',
}

export default async function MarketingCampanasPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['marketing', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const campaigns = await db
    .select({
      id: marketplace_ad_campaign.id, name: marketplace_ad_campaign.name,
      position: marketplace_ad_campaign.position, state: marketplace_ad_campaign.state,
      budget: marketplace_ad_campaign.budget, impressions: marketplace_ad_campaign.impressions,
      clicks: marketplace_ad_campaign.clicks, conversions: marketplace_ad_campaign.conversions,
      starts_at: marketplace_ad_campaign.starts_at, ends_at: marketplace_ad_campaign.ends_at,
      created_at: marketplace_ad_campaign.created_at, image_url: marketplace_ad_campaign.image_url,
      store_name: marketplace_store.name,
    })
    .from(marketplace_ad_campaign)
    .innerJoin(marketplace_store, eq(marketplace_ad_campaign.store_id, marketplace_store.id))
    .orderBy(desc(marketplace_ad_campaign.created_at))
    .limit(100)

  const pending = campaigns.filter(c => c.state === 'pending')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Campañas publicitarias</h1>
        <p className="text-muted-foreground mt-0.5">{campaigns.length} campaña{campaigns.length !== 1 ? 's' : ''} · {pending.length} pendientes</p>
      </div>

      {pending.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-3 text-brand-orange">Pendientes de aprobación ({pending.length})</h2>
          <div className="flex flex-col gap-2">
            {pending.map(c => {
              const ctr = (c.impressions ?? 0) > 0 ? ((c.clicks ?? 0) / c.impressions! * 100).toFixed(1) : '0.0'
              return (
                <Card key={c.id} className="border-brand-orange/30">
                  <CardContent className="p-4 flex items-start gap-4">
                    {c.image_url && <img src={c.image_url} alt={c.name} className="h-16 w-24 object-cover rounded-lg shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.store_name} · {c.position} · {formatDate(c.created_at)}</p>
                      {c.budget && <p className="text-xs text-muted-foreground">Presupuesto: {formatCurrency(Number(c.budget), 'USD')}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <form action={`/api/v1/admin/ads/${c.id}/approve`} method="POST">
                        <Button type="submit" size="sm" className="h-7 gap-1 text-xs bg-brand-green hover:bg-brand-green-dark text-white">
                          <FaCheck className="h-2.5 w-2.5" />Aprobar
                        </Button>
                      </form>
                      <form action={`/api/v1/admin/ads/${c.id}/reject`} method="POST">
                        <Button type="submit" variant="outline" size="sm" className="h-7 gap-1 text-xs text-red-500 border-red-500/30">
                          <FaTimes className="h-2.5 w-2.5" />Rechazar
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-base font-semibold mb-3">Todas las campañas</h2>
        <div className="flex flex-col gap-2">
          {campaigns.map(c => {
            const ctr = (c.impressions ?? 0) > 0 ? ((c.clicks ?? 0) / c.impressions! * 100).toFixed(1) : '0.0'
            return (
              <Card key={c.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-semibold text-sm truncate">{c.name}</p>
                      <Badge className={`text-xs border ${STATE_COLORS[c.state] ?? ''}`}>{STATE_LABELS[c.state] ?? c.state}</Badge>
                      <Badge variant="outline" className="text-xs">{c.position}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.store_name}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{(c.impressions ?? 0).toLocaleString()} imp.</span>
                      <span>{(c.clicks ?? 0).toLocaleString()} clicks</span>
                      <span>CTR {ctr}%</span>
                      <span>{(c.conversions ?? 0)} conv.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
