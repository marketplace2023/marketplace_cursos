import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaHome, FaEye, FaEyeSlash } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_home_section } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function MarketingBannersPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['marketing', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const sections = await db.select().from(marketplace_home_section).orderBy(marketplace_home_section.sort_order)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Banners y secciones de inicio</h1>
          <p className="text-muted-foreground mt-0.5">{sections.filter(s => s.active).length} secciones activas de {sections.length} total</p>
        </div>
        <Button asChild variant="outline" size="sm" className="text-xs">
          <Link href="/dashboard/admin/home-manager">Gestor avanzado</Link>
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaHome className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin secciones configuradas</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sections.map(s => (
            <Card key={s.id} className={!s.active ? 'opacity-60' : ''}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="text-2xl w-8 text-center shrink-0">
                  {s.active ? <FaEye className="h-4 w-4 text-brand-green mx-auto" /> : <FaEyeSlash className="h-4 w-4 text-muted-foreground mx-auto" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-sm">{s.title || 'Sin título'}</p>
                    <Badge variant="outline" className="text-xs font-mono">{s.key}</Badge>
                    <Badge variant={s.active ? 'default' : 'secondary'} className="text-xs">{s.active ? 'Visible' : 'Oculta'}</Badge>
                  </div>
                  {s.subtitle && <p className="text-xs text-muted-foreground truncate">{s.subtitle}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">Orden: {s.sort_order}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">Para editar el contenido y visibilidad de cada sección, usa el Gestor de inicio</p>
        <Button asChild className="bg-brand-green hover:bg-brand-green-dark text-white">
          <Link href="/dashboard/admin/home-manager">Abrir gestor de inicio</Link>
        </Button>
      </div>
    </div>
  )
}
