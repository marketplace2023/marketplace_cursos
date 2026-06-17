import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaHeart, FaStar, FaShoppingCart, FaClock } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_favorite, product_template, marketplace_store } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, durationLabel } from '@/lib/utils'

export default async function FavoritosPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const favorites = await db
    .select({
      id: marketplace_favorite.id,
      saved_at: marketplace_favorite.created_at,
      course_name: product_template.name,
      course_slug: product_template.slug,
      course_cover: product_template.cover_url,
      list_price: product_template.list_price,
      sale_price: product_template.sale_price,
      is_free: product_template.is_free,
      currency: product_template.currency,
      rating_avg: product_template.rating_avg,
      rating_count: product_template.rating_count,
      duration_hours: product_template.duration_hours,
      is_bestseller: product_template.is_bestseller,
      store_name: marketplace_store.name,
    })
    .from(marketplace_favorite)
    .leftJoin(product_template, eq(marketplace_favorite.course_id, product_template.id))
    .leftJoin(marketplace_store, eq(product_template.store_id, marketplace_store.id))
    .where(eq(marketplace_favorite.user_id, Number(session.sub)))
    .orderBy(desc(marketplace_favorite.created_at))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Favoritos</h1>
        <p className="text-muted-foreground mt-0.5">{favorites.length} curso{favorites.length !== 1 ? 's' : ''} guardado{favorites.length !== 1 ? 's' : ''}</p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaHeart className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin favoritos aún</h3>
          <p className="text-muted-foreground mb-4">Guarda cursos que te interesen para verlos más tarde</p>
          <Button asChild className="bg-brand-green hover:bg-brand-green-dark text-white">
            <Link href="/cursos">Explorar cursos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {favorites.map(f => {
            const price = Number(f.sale_price ?? f.list_price)
            const original = f.sale_price ? Number(f.list_price) : null
            const discount = original ? Math.round((1 - price / original) * 100) : 0
            return (
              <Link key={f.id} href={`/cursos/${f.course_slug}`} className="group">
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {f.course_cover
                      ? <img src={f.course_cover} alt={f.course_name ?? ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      : <div className="w-full h-full flex items-center justify-center"><FaHeart className="h-8 w-8 text-muted-foreground/30" /></div>
                    }
                    {f.is_bestseller && <Badge className="absolute top-2 left-2 bg-brand-orange text-white border-0 text-xs">Bestseller</Badge>}
                  </div>
                  <CardContent className="p-4 flex flex-col gap-2">
                    {f.store_name && <p className="text-xs text-brand-secondary font-medium">{f.store_name}</p>}
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{f.course_name}</h3>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="font-bold text-brand-orange">{Number(f.rating_avg ?? 0).toFixed(1)}</span>
                      <FaStar className="h-3 w-3 text-brand-orange" />
                      <span className="text-muted-foreground">({(f.rating_count ?? 0).toLocaleString()})</span>
                      {f.duration_hours && (
                        <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                          <FaClock className="h-3 w-3" />{durationLabel(Number(f.duration_hours))}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      {f.is_free ? (
                        <span className="font-bold text-brand-green">Gratis</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">{formatCurrency(price, f.currency ?? 'USD')}</span>
                          {original && <span className="text-xs text-muted-foreground line-through">{formatCurrency(original, f.currency ?? 'USD')}</span>}
                          {discount > 0 && <Badge className="text-xs bg-destructive text-white border-0">-{discount}%</Badge>}
                        </div>
                      )}
                      <Button size="sm" variant="outline" className="gap-1 ml-auto" onClick={(e) => { e.preventDefault() }}>
                        <FaShoppingCart className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
