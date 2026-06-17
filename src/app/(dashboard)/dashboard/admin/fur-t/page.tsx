import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaBuilding, FaCheckCircle, FaClock } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_fur_t, marketplace_store } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

const VERIF_COLORS: Record<string, string> = {
  verified: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  pending: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  unverified: 'bg-muted text-muted-foreground',
  under_review: 'bg-primary/10 text-primary border-primary/20',
}
const VERIF_LABELS: Record<string, string> = {
  verified: 'Verificada', pending: 'Pendiente', rejected: 'Rechazada',
  unverified: 'Sin verificar', under_review: 'En revisión',
}

export default async function AdminFurTPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin', 'compliance'].includes(session.role)) redirect('/dashboard')

  const furt = await db
    .select({
      id: marketplace_fur_t.id, fur_code: marketplace_fur_t.fur_code,
      verification_state: marketplace_fur_t.verification_state,
      verification_notes: marketplace_fur_t.verification_notes,
      verified_at: marketplace_fur_t.verified_at, created_at: marketplace_fur_t.created_at,
      store_name: marketplace_store.name, store_id: marketplace_store.id,
      store_state: marketplace_store.state,
    })
    .from(marketplace_fur_t)
    .innerJoin(marketplace_store, eq(marketplace_fur_t.store_id, marketplace_store.id))
    .orderBy(desc(marketplace_fur_t.created_at))
    .limit(100)

  const pending = furt.filter(f => f.verification_state === 'pending' || f.verification_state === 'under_review')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">FUR-T — Fichas de tienda</h1>
        <p className="text-muted-foreground mt-0.5">{furt.length} tienda{furt.length !== 1 ? 's' : ''} · {pending.length} pendientes de revisión</p>
      </div>

      {furt.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaBuilding className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin fichas FUR-T registradas</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {furt.map(f => (
            <Card key={f.id} className={f.verification_state === 'pending' || f.verification_state === 'under_review' ? 'border-brand-orange/30' : ''}>
              <CardContent className="p-4 flex items-center gap-4">
                <div>
                  {f.verification_state === 'verified'
                    ? <FaCheckCircle className="h-5 w-5 text-brand-green" />
                    : <FaClock className="h-5 w-5 text-brand-orange" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-sm">{f.store_name}</p>
                    <Badge className={`text-xs border ${VERIF_COLORS[f.verification_state ?? 'unverified'] ?? ''}`}>
                      {VERIF_LABELS[f.verification_state ?? 'unverified'] ?? f.verification_state}
                    </Badge>
                    {f.fur_code && <span className="font-mono text-xs text-muted-foreground">{f.fur_code}</span>}
                  </div>
                  {f.verification_notes && <p className="text-xs text-muted-foreground line-clamp-1">{f.verification_notes}</p>}
                  <p className="text-xs text-muted-foreground">{f.verified_at ? `Verificada ${formatDate(f.verified_at)}` : `Registrada ${formatDate(f.created_at)}`}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="text-xs h-7 shrink-0">
                  <Link href={`/dashboard/admin/tiendas/${f.store_id}`}>Ver tienda</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
