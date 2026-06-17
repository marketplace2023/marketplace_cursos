import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaTag, FaPlus, FaTrash } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_store, marketplace_coupon } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function TiendaPromocionesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [store] = await db.select({ id: marketplace_store.id })
    .from(marketplace_store).where(eq(marketplace_store.owner_id, Number(session.sub))).limit(1)
  if (!store) redirect('/dashboard/tienda/perfil?setup=1')

  const coupons = await db
    .select()
    .from(marketplace_coupon)
    .where(eq(marketplace_coupon.store_id, store.id))
    .orderBy(desc(marketplace_coupon.created_at))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Promociones</h1>
          <p className="text-muted-foreground mt-0.5">{coupons.length} cupón{coupons.length !== 1 ? 'es' : ''}</p>
        </div>
        <Button asChild className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <Link href="/dashboard/tienda/promociones/nuevo"><FaPlus className="h-4 w-4" />Nuevo cupón</Link>
        </Button>
      </div>

      {coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaTag className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin cupones</h3>
          <p className="text-muted-foreground mb-4">Crea cupones de descuento para tus cursos</p>
          <Button className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
            <FaPlus className="h-4 w-4" />Crear cupón
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {coupons.map(c => {
            const expired = c.expires_at && new Date(c.expires_at) < new Date()
            return (
              <Card key={c.id} className={expired ? 'opacity-60' : ''}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-lg bg-brand-green/10 flex items-center justify-center shrink-0">
                    <FaTag className="h-5 w-5 text-brand-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="font-bold text-sm">{c.code}</code>
                      <Badge variant={c.active && !expired ? 'default' : 'secondary'} className="text-xs">
                        {expired ? 'Expirado' : c.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.coupon_type === 'percent' ? `${c.discount_value}% de descuento` : `${formatCurrency(Number(c.discount_value), 'USD')} de descuento`}
                      {c.expires_at && ` · Expira: ${formatDate(c.expires_at)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Usado: {c.used_count ?? 0}{c.max_uses ? `/${c.max_uses}` : ''} veces
                    </p>
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
