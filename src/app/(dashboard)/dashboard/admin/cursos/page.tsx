import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaBook } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { product_template, marketplace_store } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  published: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  pending_review: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  draft: 'bg-muted text-muted-foreground',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  suspended: 'bg-red-600/10 text-red-600 border-red-600/20',
  archived: 'bg-muted text-muted-foreground',
}
const STATE_LABELS: Record<string, string> = {
  published: 'Publicado', pending_review: 'En revisión', draft: 'Borrador',
  rejected: 'Rechazado', suspended: 'Suspendido', archived: 'Archivado',
}

export default async function AdminCursosPage(props: { searchParams: Promise<{ state?: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const sp = await props.searchParams
  const filterState = sp.state

  const courses = await db
    .select({
      id: product_template.id, name: product_template.name, slug: product_template.slug,
      state: product_template.state, level: product_template.level, modality: product_template.modality,
      list_price: product_template.list_price, is_free: product_template.is_free,
      total_students: product_template.total_students, rating_avg: product_template.rating_avg,
      rating_count: product_template.rating_count, has_certificate: product_template.has_certificate,
      created_at: product_template.created_at, cover_url: product_template.cover_url,
      store_name: marketplace_store.name,
    })
    .from(product_template)
    .innerJoin(marketplace_store, eq(product_template.store_id, marketplace_store.id))
    .orderBy(desc(product_template.created_at))
    .limit(100)

  const filtered = filterState ? courses.filter(c => c.state === filterState) : courses
  const STATES = ['published', 'pending_review', 'draft', 'rejected', 'suspended', 'archived']

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Cursos</h1>
        <p className="text-muted-foreground mt-0.5">{filtered.length} curso{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant={!filterState ? 'default' : 'outline'} size="sm" className="h-7 text-xs">
          <Link href="/dashboard/admin/cursos">Todos</Link>
        </Button>
        {STATES.map(s => (
          <Button key={s} asChild variant={filterState === s ? 'default' : 'outline'} size="sm" className="h-7 text-xs">
            <Link href={`/dashboard/admin/cursos?state=${s}`}>{STATE_LABELS[s]}</Link>
          </Button>
        ))}
        <Button asChild variant="outline" size="sm" className="h-7 text-xs ml-auto">
          <Link href="/dashboard/admin/cursos/moderacion">Moderación</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map(c => (
          <Card key={c.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-14 w-20 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                {c.cover_url ? <img src={c.cover_url} alt={c.name} className="object-cover h-full w-full" /> : <FaBook className="h-6 w-6 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="font-semibold text-sm truncate">{c.name}</p>
                  <Badge className={`text-xs border ${STATE_COLORS[c.state] ?? ''}`}>{STATE_LABELS[c.state] ?? c.state}</Badge>
                  {c.has_certificate && <Badge className="text-xs bg-brand-purple/10 text-brand-purple border-brand-purple/20">Certif.</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{c.store_name} · {c.level} · {formatDate(c.created_at)}</p>
                <p className="text-xs text-muted-foreground">{c.total_students} estudiantes · {Number(c.rating_avg ?? 0).toFixed(1)} ★</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-sm">{c.is_free ? 'Gratis' : formatCurrency(Number(c.list_price ?? 0), 'USD')}</p>
                <Button asChild variant="outline" size="sm" className="mt-1 h-7 text-xs">
                  <Link href={`/cursos/${c.slug}`}>Ver</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
