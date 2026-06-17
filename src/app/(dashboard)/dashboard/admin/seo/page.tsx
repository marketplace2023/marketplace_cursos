import { redirect } from 'next/navigation'
import { FaSearch } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_seo_meta } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export default async function AdminSeoPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin', 'marketing'].includes(session.role)) redirect('/dashboard')

  const metas = await db
    .select()
    .from(marketplace_seo_meta)
    .orderBy(desc(marketplace_seo_meta.updated_at))
    .limit(100)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">SEO Global</h1>
        <p className="text-muted-foreground mt-0.5">{metas.length} entradas de metadatos SEO</p>
      </div>

      {metas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaSearch className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">Sin datos SEO</h3>
          <p className="text-muted-foreground">Los metadatos SEO se registran automáticamente al publicar cursos y tiendas</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {metas.map(m => (
            <Card key={m.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant="outline" className="text-xs">{m.entity_type}</Badge>
                      <span className="text-xs text-muted-foreground">#{m.entity_id}</span>
                      {m.robots && <Badge variant="secondary" className="text-xs">{m.robots}</Badge>}
                    </div>
                    {m.meta_title && <p className="font-semibold text-sm">{m.meta_title}</p>}
                    {m.meta_description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{m.meta_description}</p>}
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">{formatDate(m.updated_at)}</p>
                </div>
                {m.canonical_url && (
                  <p className="text-xs text-primary truncate">{m.canonical_url}</p>
                )}
                <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                  <span>Título: <span className={m.meta_title && m.meta_title.length > 60 ? 'text-brand-orange' : 'text-brand-green'}>{m.meta_title?.length ?? 0} car.</span></span>
                  <span>·</span>
                  <span>Descripción: <span className={m.meta_description && m.meta_description.length > 160 ? 'text-brand-orange' : 'text-brand-green'}>{m.meta_description?.length ?? 0} car.</span></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
