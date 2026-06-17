import { redirect } from 'next/navigation'
import { FaBullhorn, FaPlus, FaEye, FaMousePointer } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_store, marketplace_ad_campaign } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'

const AD_STATE: Record<string, { label: string; class: string }> = {
  draft: { label: 'Borrador', class: 'bg-muted text-muted-foreground' },
  pending: { label: 'En revisión', class: 'bg-brand-orange/10 text-brand-orange' },
  active: { label: 'Activa', class: 'bg-brand-green/10 text-brand-green' },
  paused: { label: 'Pausada', class: 'bg-muted text-muted-foreground' },
  ended: { label: 'Finalizada', class: 'bg-muted text-muted-foreground' },
  rejected: { label: 'Rechazada', class: 'bg-destructive/10 text-destructive' },
}

export default async function TiendaPublicidadPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [store] = await db.select({ id: marketplace_store.id })
    .from(marketplace_store).where(eq(marketplace_store.owner_id, Number(session.sub))).limit(1)
  if (!store) redirect('/dashboard/tienda/perfil?setup=1')

  const campaigns = await db
    .select()
    .from(marketplace_ad_campaign)
    .where(eq(marketplace_ad_campaign.store_id, store.id))
    .orderBy(desc(marketplace_ad_campaign.created_at))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Publicidad</h1>
          <p className="text-muted-foreground mt-0.5">Campañas patrocinadas para destacar tu tienda</p>
        </div>
        <Button className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <FaPlus className="h-4 w-4" />Nueva campaña
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaBullhorn className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin campañas</h3>
          <p className="text-muted-foreground mb-4">Crea una campaña patrocinada para llevar más tráfico a tus cursos</p>
          <Button className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
            <FaPlus className="h-4 w-4" />Crear campaña
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {campaigns.map(c => {
            const st = AD_STATE[c.state] ?? AD_STATE.draft
            const ctr = c.impressions && c.impressions > 0 ? ((c.clicks ?? 0) / c.impressions * 100).toFixed(2) : '0.00'
            return (
              <Card key={c.id}>
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{c.position?.replace('_', ' ')}</p>
                    </div>
                    <Badge className={`text-xs border-0 shrink-0 ${st.class}`}>{st.label}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5"><FaEye className="h-3 w-3" />Impresiones</div>
                      <p className="font-bold">{(c.impressions ?? 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5"><FaMousePointer className="h-3 w-3" />Clics</div>
                      <p className="font-bold">{(c.clicks ?? 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">CTR</div>
                      <p className="font-bold text-brand-green">{ctr}%</p>
                    </div>
                  </div>
                  {c.budget && (
                    <p className="text-xs text-muted-foreground">
                      Presupuesto: {formatCurrency(Number(c.budget), 'USD')}
                      {c.starts_at && ` · ${formatDate(c.starts_at)} → ${c.ends_at ? formatDate(c.ends_at) : '∞'}`}
                    </p>
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
