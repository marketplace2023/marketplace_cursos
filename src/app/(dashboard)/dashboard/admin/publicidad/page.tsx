import { redirect } from 'next/navigation'
import { FaBullhorn, FaCheck, FaTimes } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_ad_campaign, marketplace_store } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

export default async function AdminPublicidadPage(props: { searchParams: Promise<{ state?: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const sp = await props.searchParams
  const filterState = sp.state

  const campaigns = await db
    .select({
      id: marketplace_ad_campaign.id, name: marketplace_ad_campaign.name,
      position: marketplace_ad_campaign.position, state: marketplace_ad_campaign.state,
      budget: marketplace_ad_campaign.budget, impressions: marketplace_ad_campaign.impressions,
      clicks: marketplace_ad_campaign.clicks, conversions: marketplace_ad_campaign.conversions,
      starts_at: marketplace_ad_campaign.starts_at, ends_at: marketplace_ad_campaign.ends_at,
      created_at: marketplace_ad_campaign.created_at,
      store_name: marketplace_store.name,
    })
    .from(marketplace_ad_campaign)
    .innerJoin(marketplace_store, eq(marketplace_ad_campaign.store_id, marketplace_store.id))
    .orderBy(desc(marketplace_ad_campaign.created_at))
    .limit(100)

  const filtered = filterState ? campaigns.filter(c => c.state === filterState) : campaigns
  const pending = campaigns.filter(c => c.state === 'pending')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Publicidad</h1>
        <p className="text-muted-foreground mt-0.5">{filtered.length} campaña{filtered.length !== 1 ? 's' : ''} · {pending.length} pendientes de revisión</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['Todas', 'pending', 'active', 'paused', 'ended', 'rejected'].map((s, i) => (
          <a key={s} href={i === 0 ? '/dashboard/admin/publicidad' : `/dashboard/admin/publicidad?state=${s}`}
            className={`h-7 px-3 text-xs rounded-md border flex items-center font-medium transition-colors ${(i === 0 ? !filterState : filterState === s) ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background hover:bg-muted'}`}>
            {i === 0 ? 'Todas' : (STATE_LABELS[s] ?? s)}
          </a>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaBullhorn className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin campañas que mostrar</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(c => {
            const ctr = c.impressions && c.impressions > 0 ? ((c.clicks ?? 0) / c.impressions * 100).toFixed(1) : '0.0'
            return (
              <Card key={c.id} className={c.state === 'pending' ? 'border-brand-orange/30' : ''}>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-semibold text-sm">{c.name}</p>
                      <Badge className={`text-xs border ${STATE_COLORS[c.state] ?? ''}`}>{STATE_LABELS[c.state] ?? c.state}</Badge>
                      <Badge variant="outline" className="text-xs">{c.position}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.store_name} · {formatDate(c.created_at)}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{c.impressions?.toLocaleString()} imp.</span>
                      <span>{c.clicks?.toLocaleString()} clicks</span>
                      <span>CTR {ctr}%</span>
                      {c.budget && <span>Presupuesto: {formatCurrency(Number(c.budget), 'USD')}</span>}
                    </div>
                  </div>
                  {c.state === 'pending' && (
                    <div className="flex gap-1 shrink-0">
                      <form action={`/api/v1/admin/ads/${c.id}/approve`} method="POST">
                        <button type="submit" className="h-7 w-7 rounded-md bg-brand-green/10 text-brand-green hover:bg-brand-green/20 flex items-center justify-center" title="Aprobar">
                          <FaCheck className="h-3 w-3" />
                        </button>
                      </form>
                      <form action={`/api/v1/admin/ads/${c.id}/reject`} method="POST">
                        <button type="submit" className="h-7 w-7 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center justify-center" title="Rechazar">
                          <FaTimes className="h-3 w-3" />
                        </button>
                      </form>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
