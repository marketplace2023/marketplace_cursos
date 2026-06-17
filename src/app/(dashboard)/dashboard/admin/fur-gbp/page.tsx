import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_fur_gbp, marketplace_store } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

const VERIF_COLORS: Record<string, string> = {
  verified: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  pending: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  unverified: 'bg-muted text-muted-foreground',
}

export default async function AdminFurGbpPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin', 'compliance', 'marketing'].includes(session.role)) redirect('/dashboard')

  const gbps = await db
    .select({
      id: marketplace_fur_gbp.id, fur_code: marketplace_fur_gbp.fur_code,
      commercial_name: marketplace_fur_gbp.commercial_name,
      legal_name: marketplace_fur_gbp.legal_name,
      entity_type: marketplace_fur_gbp.entity_type,
      city: marketplace_fur_gbp.city, country: marketplace_fur_gbp.country,
      verification_state: marketplace_fur_gbp.verification_state,
      publish_state: marketplace_fur_gbp.publish_state,
      rating: marketplace_fur_gbp.rating, review_count: marketplace_fur_gbp.review_count,
      created_at: marketplace_fur_gbp.created_at,
      store_name: marketplace_store.name, store_id: marketplace_store.id,
    })
    .from(marketplace_fur_gbp)
    .innerJoin(marketplace_store, eq(marketplace_fur_gbp.store_id, marketplace_store.id))
    .orderBy(desc(marketplace_fur_gbp.created_at))
    .limit(100)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">FUR-GBP — Perfiles de negocio</h1>
        <p className="text-muted-foreground mt-0.5">{gbps.length} perfil{gbps.length !== 1 ? 'es' : ''} de negocio registrados</p>
      </div>

      {gbps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaMapMarkerAlt className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin perfiles GBP registrados</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {gbps.map(g => (
            <Card key={g.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-sm">{g.commercial_name || g.store_name}</p>
                    <Badge className={`text-xs border ${VERIF_COLORS[g.verification_state ?? 'unverified'] ?? ''}`}>{g.verification_state ?? 'unverified'}</Badge>
                    <Badge variant="outline" className="text-xs">{g.publish_state}</Badge>
                    {g.entity_type && <Badge variant="secondary" className="text-xs">{g.entity_type}</Badge>}
                  </div>
                  {(g.city || g.country) && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FaMapMarkerAlt className="h-3 w-3" />
                      <span>{[g.city, g.country].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{g.store_name} · {formatDate(g.created_at)}</p>
                </div>
                {g.rating && (
                  <div className="text-right text-xs shrink-0">
                    <p className="font-semibold text-brand-orange">{Number(g.rating).toFixed(1)} ★</p>
                    <p className="text-muted-foreground">{g.review_count} reseñas</p>
                  </div>
                )}
                <Button asChild variant="outline" size="sm" className="text-xs h-7 shrink-0">
                  <Link href={`/dashboard/admin/tiendas/${g.store_id}`}>Ver</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
