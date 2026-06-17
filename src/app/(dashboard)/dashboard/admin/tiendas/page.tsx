import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaStore, FaCheckCircle } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_store, res_users } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  active: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  pending_review: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  draft: 'bg-muted text-muted-foreground',
  suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
  rejected: 'bg-red-600/10 text-red-600 border-red-600/20',
  archived: 'bg-muted text-muted-foreground',
}
const STATE_LABELS: Record<string, string> = {
  active: 'Activa', pending_review: 'En revisión', draft: 'Borrador',
  suspended: 'Suspendida', rejected: 'Rechazada', archived: 'Archivada',
}

export default async function AdminTiendasPage(props: { searchParams: Promise<{ state?: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const sp = await props.searchParams
  const filterState = sp.state

  const stores = await db
    .select({
      id: marketplace_store.id, name: marketplace_store.name, slug: marketplace_store.slug,
      state: marketplace_store.state, store_type: marketplace_store.store_type,
      is_verified: marketplace_store.is_verified, plan: marketplace_store.plan,
      total_courses: marketplace_store.total_courses, total_students: marketplace_store.total_students,
      total_sales: marketplace_store.total_sales, logo_url: marketplace_store.logo_url,
      created_at: marketplace_store.created_at,
      owner_name: res_users.name, owner_email: res_users.email,
    })
    .from(marketplace_store)
    .innerJoin(res_users, eq(marketplace_store.owner_id, res_users.id))
    .orderBy(desc(marketplace_store.created_at))
    .limit(100)

  const filtered = filterState ? stores.filter(s => s.state === filterState) : stores
  const STATES = ['active', 'pending_review', 'draft', 'suspended', 'rejected', 'archived']

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Tiendas</h1>
        <p className="text-muted-foreground mt-0.5">{filtered.length} tienda{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant={!filterState ? 'default' : 'outline'} size="sm" className="h-7 text-xs">
          <Link href="/dashboard/admin/tiendas">Todas</Link>
        </Button>
        {STATES.map(s => (
          <Button key={s} asChild variant={filterState === s ? 'default' : 'outline'} size="sm" className="h-7 text-xs">
            <Link href={`/dashboard/admin/tiendas?state=${s}`}>{STATE_LABELS[s]}</Link>
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map(s => (
          <Card key={s.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                {s.logo_url ? <img src={s.logo_url} alt={s.name} className="object-cover h-full w-full" /> : <FaStore className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="font-semibold text-sm truncate">{s.name}</p>
                  {s.is_verified && <FaCheckCircle className="h-3.5 w-3.5 text-brand-green shrink-0" />}
                  <Badge className={`text-xs border ${STATE_COLORS[s.state] ?? ''}`}>{STATE_LABELS[s.state] ?? s.state}</Badge>
                  <Badge variant="outline" className="text-xs">{s.plan}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{s.owner_name} · {s.owner_email}</p>
                <p className="text-xs text-muted-foreground">{s.total_courses} cursos · {s.total_students} estudiantes · {formatDate(s.created_at)}</p>
              </div>
              <Button asChild variant="outline" size="sm" className="text-xs h-7 shrink-0">
                <Link href={`/dashboard/admin/tiendas/${s.id}`}>Ver</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
