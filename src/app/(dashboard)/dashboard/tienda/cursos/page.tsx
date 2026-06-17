import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaBookOpen, FaPlus, FaEdit, FaStar, FaUsers, FaEye } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_store, product_template } from '@/lib/db/schema'
import { eq, desc, isNull, and } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

const STATE: Record<string, { label: string; class: string }> = {
  published: { label: 'Publicado', class: 'bg-brand-green/10 text-brand-green' },
  draft: { label: 'Borrador', class: 'bg-muted text-muted-foreground' },
  pending_review: { label: 'En revisión', class: 'bg-brand-orange/10 text-brand-orange' },
  rejected: { label: 'Rechazado', class: 'bg-destructive/10 text-destructive' },
  archived: { label: 'Archivado', class: 'bg-muted text-muted-foreground' },
}

export default async function TiendaCursosPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [store] = await db.select({ id: marketplace_store.id })
    .from(marketplace_store).where(eq(marketplace_store.owner_id, Number(session.sub))).limit(1)
  if (!store) redirect('/dashboard/tienda/perfil?setup=1')

  const courses = await db
    .select({
      id: product_template.id,
      name: product_template.name,
      slug: product_template.slug,
      cover_url: product_template.cover_url,
      state: product_template.state,
      list_price: product_template.list_price,
      is_free: product_template.is_free,
      currency: product_template.currency,
      rating_avg: product_template.rating_avg,
      rating_count: product_template.rating_count,
      total_students: product_template.total_students,
      level: product_template.level,
      created_at: product_template.created_at,
    })
    .from(product_template)
    .where(and(eq(product_template.store_id, store.id), isNull(product_template.deleted_at)))
    .orderBy(desc(product_template.created_at))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Mis Cursos</h1>
          <p className="text-muted-foreground mt-0.5">{courses.length} curso{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <Button asChild className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <Link href="/dashboard/tienda/cursos/nuevo"><FaPlus className="h-4 w-4" />Nuevo curso</Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaBookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin cursos aún</h3>
          <p className="text-muted-foreground mb-4">Crea tu primer curso y empieza a enseñar</p>
          <Button asChild className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
            <Link href="/dashboard/tienda/cursos/nuevo"><FaPlus className="h-4 w-4" />Crear curso</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {courses.map(c => {
            const st = STATE[c.state ?? 'draft'] ?? STATE.draft
            return (
              <Card key={c.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-16 w-24 rounded-lg bg-muted overflow-hidden shrink-0">
                    {c.cover_url
                      ? <img src={c.cover_url} alt={c.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><FaBookOpen className="h-6 w-6 text-muted-foreground/30" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm line-clamp-1">{c.name}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><FaUsers className="h-3 w-3" />{c.total_students ?? 0}</span>
                      <span className="flex items-center gap-1">
                        <FaStar className="h-3 w-3 text-brand-orange" />
                        {Number(c.rating_avg ?? 0).toFixed(1)} ({c.rating_count ?? 0})
                      </span>
                      <span className="capitalize">{c.level}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="font-bold text-sm">
                      {c.is_free ? <span className="text-brand-green">Gratis</span> : formatCurrency(Number(c.list_price), c.currency ?? 'USD')}
                    </p>
                    <Badge className={`text-xs border-0 ${st.class}`}>{st.label}</Badge>
                    <div className="flex gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/cursos/${c.slug}`} target="_blank"><FaEye className="h-3.5 w-3.5" /></Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="gap-1 text-xs">
                        <Link href={`/dashboard/tienda/cursos/${c.id}`}><FaEdit className="h-3 w-3" />Editar</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
