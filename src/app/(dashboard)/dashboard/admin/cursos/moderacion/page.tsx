import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaBook, FaCheck, FaTimes } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { product_template, marketplace_store, res_users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export default async function AdminCursosMoederacionPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const pending = await db
    .select({
      id: product_template.id, name: product_template.name, slug: product_template.slug,
      description: product_template.description, level: product_template.level,
      modality: product_template.modality, created_at: product_template.created_at,
      cover_url: product_template.cover_url, has_certificate: product_template.has_certificate,
      list_price: product_template.list_price, is_free: product_template.is_free,
      total_lessons: product_template.total_lessons, total_modules: product_template.total_modules,
      store_name: marketplace_store.name,
      instructor_name: res_users.name,
    })
    .from(product_template)
    .innerJoin(marketplace_store, eq(product_template.store_id, marketplace_store.id))
    .leftJoin(res_users, eq(product_template.instructor_id, res_users.id))
    .where(eq(product_template.state, 'pending_review'))
    .orderBy(product_template.created_at)
    .limit(50)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Moderación de cursos</h1>
        <p className="text-muted-foreground mt-0.5">{pending.length} curso{pending.length !== 1 ? 's' : ''} pendientes de revisión</p>
      </div>

      {pending.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaCheck className="h-16 w-16 text-brand-green/40 mb-4" />
          <h3 className="text-lg font-semibold">Todo al día</h3>
          <p className="text-muted-foreground">No hay cursos pendientes de revisión</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pending.map(c => (
            <Card key={c.id} className="border-brand-orange/30">
              <CardContent className="p-5 flex gap-4">
                <div className="h-20 w-28 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {c.cover_url ? <img src={c.cover_url} alt={c.name} className="object-cover h-full w-full" /> : <FaBook className="h-8 w-8 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.store_name} {c.instructor_name ? `· ${c.instructor_name}` : ''}</p>
                    </div>
                    <Badge className="text-xs bg-brand-orange/10 text-brand-orange border-brand-orange/20 shrink-0">En revisión</Badge>
                  </div>
                  {c.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{c.description}</p>}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="text-muted-foreground">{c.level}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{c.modality}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{c.total_modules} módulos, {c.total_lessons} lecciones</span>
                    {c.has_certificate && <Badge className="text-xs bg-brand-purple/10 text-brand-purple border-brand-purple/20">Certif.</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Enviado {formatDate(c.created_at)}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <form action={`/api/v1/admin/courses/${c.id}/publish`} method="POST">
                    <Button type="submit" size="sm" className="w-full gap-1 bg-brand-green hover:bg-brand-green-dark text-white text-xs">
                      <FaCheck className="h-3 w-3" />Aprobar
                    </Button>
                  </form>
                  <form action={`/api/v1/admin/courses/${c.id}/reject`} method="POST">
                    <Button type="submit" variant="outline" size="sm" className="w-full gap-1 text-red-500 border-red-500/30 hover:bg-red-500/10 text-xs">
                      <FaTimes className="h-3 w-3" />Rechazar
                    </Button>
                  </form>
                  <Button asChild variant="ghost" size="sm" className="text-xs">
                    <Link href={`/cursos/${c.slug}`}>Vista previa</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
