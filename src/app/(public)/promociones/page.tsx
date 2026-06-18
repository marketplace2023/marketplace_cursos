import { db } from '@/lib/db'
import { marketplace_coupon, marketplace_store, product_template } from '@/lib/db/schema'
import { eq, and, or, isNull, gte, sql } from 'drizzle-orm'
import { FaTag, FaFire, FaClock, FaPercent, FaDollarSign, FaSearch, FaBookOpen, FaGraduationCap } from 'react-icons/fa'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CopyCodeButton } from '@/components/public/copy-code-button'

async function getActivePromos() {
  try {
    const now = new Date()
    return await db
      .select({
        id: marketplace_coupon.id,
        code: marketplace_coupon.code,
        description: marketplace_coupon.description,
        coupon_type: marketplace_coupon.coupon_type,
        discount_value: marketplace_coupon.discount_value,
        min_purchase: marketplace_coupon.min_purchase,
        max_discount: marketplace_coupon.max_discount,
        max_uses: marketplace_coupon.max_uses,
        used_count: marketplace_coupon.used_count,
        expires_at: marketplace_coupon.expires_at,
        starts_at: marketplace_coupon.starts_at,
        store_name: marketplace_store.name,
        store_slug: marketplace_store.slug,
        course_name: product_template.name,
        course_slug: product_template.slug,
      })
      .from(marketplace_coupon)
      .leftJoin(marketplace_store, eq(marketplace_coupon.store_id, marketplace_store.id))
      .leftJoin(product_template, eq(marketplace_coupon.course_id, product_template.id))
      .where(and(
        eq(marketplace_coupon.active, true),
        or(isNull(marketplace_coupon.starts_at), gte(marketplace_coupon.starts_at, now))!,
        or(isNull(marketplace_coupon.expires_at), gte(marketplace_coupon.expires_at, now))!,
      ))
      .orderBy(marketplace_coupon.expires_at)
      .limit(50)
  } catch {
    return []
  }
}

function timeLeft(expiresAt: Date | null): string {
  if (!expiresAt) return 'Sin vencimiento'
  const diff = expiresAt.getTime() - Date.now()
  if (diff <= 0) return 'Expirado'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `Vence en ${days}d ${hours}h`
  return `Vence en ${hours}h`
}

const PROMO_GRADIENTS = [
  'from-brand-green/15 to-emerald-400/10',
  'from-brand-orange/15 to-yellow-400/10',
  'from-brand-purple/15 to-violet-400/10',
  'from-brand-secondary/15 to-blue-400/10',
  'from-rose-500/15 to-pink-400/10',
]

export default async function PromocionesPage() {
  const promos = await getActivePromos()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary via-[#0d3a6e] to-brand-secondary py-20">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand-orange/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-brand-green/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-4 py-1.5 text-sm text-brand-orange font-medium mb-6">
            <FaFire className="h-3.5 w-3.5" />
            Ofertas y descuentos exclusivos
          </div>
          <h1 className="font-heading font-extrabold text-4xl text-white sm:text-5xl lg:text-6xl mb-4">
            Aprende más,<br />
            <span className="text-brand-orange">paga menos</span>
          </h1>
          <p className="mx-auto max-w-xl text-white/65 text-lg leading-relaxed">
            Cupones y descuentos activos para cursos de nuestras academias. Copia el código y aplícalo en el checkout.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {promos.length === 0 ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
                <FaTag className="h-9 w-9 text-muted-foreground/40" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
                No hay promociones activas ahora
              </h2>
              <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
                Actualmente no tenemos cupones disponibles. Vuelve pronto — publicamos ofertas periódicamente o navega nuestro catálogo completo.
              </p>
              <div className="flex gap-3 flex-wrap justify-center">
                <Button asChild size="lg" className="rounded-xl bg-brand-green hover:bg-brand-green-dark text-white gap-2">
                  <Link href="/cursos"><FaBookOpen className="h-4 w-4" /> Explorar cursos</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl gap-2">
                  <Link href="/buscar"><FaSearch className="h-4 w-4" /> Buscar por tema</Link>
                </Button>
              </div>

              {/* Teaser cards */}
              <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 w-full max-w-2xl">
                {[
                  { icon: FaFire,          title: 'Flash sales',         desc: 'Descuentos de hasta 80% por tiempo limitado' },
                  { icon: FaGraduationCap, title: 'Bundles de cursos',   desc: 'Paquetes de cursos relacionados con precio especial' },
                  { icon: FaTag,           title: 'Cupones de tienda',   desc: 'Códigos exclusivos de nuestras academias verificadas' },
                ].map(t => (
                  <div key={t.title} className="rounded-2xl border border-border/50 bg-card p-5 text-center shadow-sm">
                    <div className="h-10 w-10 rounded-xl bg-brand-orange/10 flex items-center justify-center mx-auto mb-3">
                      <t.icon className="h-5 w-5 text-brand-orange" />
                    </div>
                    <p className="font-semibold text-sm mb-1">{t.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── Promo grid ── */
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-heading text-xl font-bold">{promos.length} promoción{promos.length !== 1 ? 'es' : ''} activa{promos.length !== 1 ? 's' : ''}</h2>
                  <p className="text-muted-foreground text-sm mt-0.5">Copia el código y pégalo en el checkout para aplicar el descuento</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {promos.map((promo, i) => {
                  const isPercent = promo.coupon_type === 'percent'
                  const discountLabel = isPercent
                    ? `${Number(promo.discount_value)}% OFF`
                    : `$${Number(promo.discount_value)} OFF`
                  const gradient = PROMO_GRADIENTS[i % PROMO_GRADIENTS.length]
                  const remaining = promo.max_uses ? promo.max_uses - (promo.used_count ?? 0) : null

                  return (
                    <div
                      key={promo.id}
                      className={`relative rounded-2xl border border-border/50 bg-linear-to-br ${gradient} overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                    >
                      {/* Top stripe */}
                      <div className="h-1.5 bg-linear-to-r from-brand-orange to-brand-green" />

                      <div className="p-5">
                        {/* Discount badge */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-xl bg-white/80 shadow-sm flex items-center justify-center shrink-0">
                              {isPercent
                                ? <FaPercent className="h-4 w-4 text-brand-orange" />
                                : <FaDollarSign className="h-4 w-4 text-brand-green" />
                              }
                            </div>
                            <div>
                              <p className="text-2xl font-extrabold text-foreground leading-none">{discountLabel}</p>
                              {promo.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 leading-tight line-clamp-1">{promo.description}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Scope */}
                        {(promo.store_name || promo.course_name) && (
                          <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                            <FaTag className="h-3 w-3 shrink-0" />
                            {promo.course_name
                              ? <span>Solo en: <Link href={`/cursos/${promo.course_slug}`} className="font-medium text-foreground hover:underline">{promo.course_name}</Link></span>
                              : promo.store_name
                                ? <span>Academia: <Link href={`/tiendas/${promo.store_slug}`} className="font-medium text-foreground hover:underline">{promo.store_name}</Link></span>
                                : null
                            }
                          </div>
                        )}

                        {/* Conditions */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {promo.min_purchase && Number(promo.min_purchase) > 0 && (
                            <span className="text-xs bg-white/70 rounded-lg px-2.5 py-1 font-medium">
                              Compra mín. ${Number(promo.min_purchase)}
                            </span>
                          )}
                          {promo.max_discount && (
                            <span className="text-xs bg-white/70 rounded-lg px-2.5 py-1 font-medium">
                              Máx. ${Number(promo.max_discount)}
                            </span>
                          )}
                          {remaining !== null && (
                            <span className={`text-xs rounded-lg px-2.5 py-1 font-medium ${remaining <= 10 ? 'bg-destructive/10 text-destructive' : 'bg-white/70'}`}>
                              {remaining} uso{remaining !== 1 ? 's' : ''} restante{remaining !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {/* Code copy */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-xl border-2 border-dashed border-foreground/20 bg-white/60 px-3 py-2 text-center">
                            <span className="font-mono font-bold text-sm tracking-widest text-foreground">{promo.code}</span>
                          </div>
                          <CopyCodeButton code={promo.code} />
                        </div>

                        {/* Expiry */}
                        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                          <FaClock className="h-3 w-3 shrink-0" />
                          {timeLeft(promo.expires_at)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

