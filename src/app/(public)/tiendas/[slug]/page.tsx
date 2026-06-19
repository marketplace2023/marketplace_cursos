import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  FaStar, FaUsers, FaBookOpen, FaCheckCircle, FaStore,
  FaGlobe, FaEnvelope, FaPhone, FaHeart, FaShareAlt,
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn,
  FaMapMarkerAlt, FaShieldAlt, FaAward, FaChevronRight,
} from 'react-icons/fa'
import { JsonLd, storeJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonld'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StoreCourseCarousel } from '@/components/public/store-course-carousel'
import type { CourseSlide } from '@/components/public/store-course-carousel'
import { db } from '@/lib/db'
import { marketplace_store, res_users, product_template, product_category, marketplace_review } from '@/lib/db/schema'
import { eq, and, isNull, desc } from 'drizzle-orm'

async function getStore(slug: string) {
  try {
    const isNumeric = /^\d+$/.test(slug)
    const condition = and(
      isNumeric ? eq(marketplace_store.id, Number(slug)) : eq(marketplace_store.slug, slug),
      isNull(marketplace_store.deleted_at),
    )

    const [store] = await db
      .select({
        id: marketplace_store.id,
        name: marketplace_store.name,
        legal_name: marketplace_store.legal_name,
        slug: marketplace_store.slug,
        store_type: marketplace_store.store_type,
        state: marketplace_store.state,
        description: marketplace_store.description,
        logo_url: marketplace_store.logo_url,
        cover_url: marketplace_store.cover_url,
        email: marketplace_store.email,
        phone: marketplace_store.phone,
        website: marketplace_store.website,
        country: marketplace_store.country,
        city: marketplace_store.city,
        social_links: marketplace_store.social_links,
        total_courses: marketplace_store.total_courses,
        total_students: marketplace_store.total_students,
        rating_avg: marketplace_store.rating_avg,
        rating_count: marketplace_store.rating_count,
        is_verified: marketplace_store.is_verified,
        refund_policy: marketplace_store.refund_policy,
        support_policy: marketplace_store.support_policy,
        owner_id: res_users.id,
        owner_name: res_users.name,
        owner_avatar: res_users.avatar_url,
        owner_bio: res_users.bio,
      })
      .from(marketplace_store)
      .leftJoin(res_users, eq(marketplace_store.owner_id, res_users.id))
      .where(condition)
      .limit(1)

    if (!store) return null

    const courses = await db
      .select({
        id: product_template.id,
        name: product_template.name,
        slug: product_template.slug,
        cover_url: product_template.cover_url,
        level: product_template.level,
        duration_hours: product_template.duration_hours,
        list_price: product_template.list_price,
        sale_price: product_template.sale_price,
        is_free: product_template.is_free,
        currency: product_template.currency,
        rating_avg: product_template.rating_avg,
        rating_count: product_template.rating_count,
        total_students: product_template.total_students,
        has_certificate: product_template.has_certificate,
        is_bestseller: product_template.is_bestseller,
        category_name: product_category.name,
        category_slug: product_category.slug,
        instructor_name: res_users.name,
      })
      .from(product_template)
      .leftJoin(product_category, eq(product_template.category_id, product_category.id))
      .leftJoin(res_users, eq(product_template.instructor_id, res_users.id))
      .where(and(
        eq(product_template.store_id, store.id),
        eq(product_template.state, 'published'),
        isNull(product_template.deleted_at),
      ))
      .orderBy(desc(product_template.is_featured), desc(product_template.published_at))
      .limit(24)

    const reviews = await db
      .select({
        id: marketplace_review.id,
        rating: marketplace_review.rating,
        comment: marketplace_review.comment,
        verified_purchase: marketplace_review.verified_purchase,
        created_at: marketplace_review.created_at,
        reviewer_name: res_users.name,
        reviewer_avatar: res_users.avatar_url,
      })
      .from(marketplace_review)
      .leftJoin(res_users, eq(marketplace_review.user_id, res_users.id))
      .where(and(
        eq(marketplace_review.store_id, store.id),
        eq(marketplace_review.state, 'published'),
      ))
      .orderBy(desc(marketplace_review.created_at))
      .limit(10)

    return { ...store, courses, reviews }
  } catch { return null }
}

const TYPE_LABELS: Record<string, string> = {
  academy: 'Academia', individual: 'Instructor independiente',
  corporate: 'Corporativa', government: 'Institución',
}

type Review = {
  id: number; rating: number; comment?: string
  verified_purchase: boolean; created_at: string
  reviewer_name?: string; reviewer_avatar?: string
}

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eduumarket.netlify.app'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const store = await getStore(slug)
  if (!store) return {}
  const title = `${store.name} | EduMarket`
  const description = store.description ?? `Explora los cursos y formaciones de ${store.name}.`
  return {
    title, description,
    openGraph: { title, description, url: `${BASE}/tiendas/${slug}`, type: 'website', images: (store.logo_url ?? store.cover_url) ? [{ url: store.logo_url ?? store.cover_url, alt: store.name }] : [] },
    twitter: { card: 'summary_large_image', title, description, images: store.logo_url ? [store.logo_url] : [] },
    alternates: { canonical: `${BASE}/tiendas/${slug}` },
  }
}

export default async function TiendaFichaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const store = await getStore(slug)
  if (!store) notFound()

  const rating = Number(store.rating_avg ?? 0)
  const socialLinks = (() => { try { return JSON.parse(store.social_links ?? '{}') } catch { return {} } })()

  const jsonLdData = [
    storeJsonLd({ name: store.name, description: store.description, slug, logo_url: store.logo_url, cover_url: store.cover_url, email: store.email, phone: store.phone, city: store.city, country: store.country, rating_avg: store.rating_avg, rating_count: store.rating_count, store_type: store.store_type }),
    breadcrumbJsonLd([{ name: 'Inicio', url: BASE }, { name: 'Tiendas', url: `${BASE}/tiendas` }, { name: store.name, url: `${BASE}/tiendas/${slug}` }]),
  ]

  const courses: CourseSlide[] = store.courses ?? []
  const hasSocial = Object.keys(socialLinks).length > 0

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={jsonLdData} />

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative">
        {/* Cover image */}
        <div className="relative h-72 lg:h-96 overflow-hidden">
          {store.cover_url
            ? <img src={store.cover_url} alt={store.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-linear-to-br from-primary via-brand-secondary to-brand-purple" />
          }
          {/* Overlay gradients */}
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-background/30 to-transparent" />

          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>

        {/* Store info bar — overlaps cover */}
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="relative -mt-24 lg:-mt-28 pb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start">

              {/* Logo */}
              <div className="relative shrink-0">
                <div className="h-28 w-28 lg:h-32 lg:w-32 rounded-2xl border-4 border-background bg-background shadow-2xl overflow-hidden ring-2 ring-primary/10">
                  {store.logo_url
                    ? <img src={store.logo_url} alt={store.name} className="h-full w-full object-cover" />
                    : <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-primary/15 to-brand-purple/15">
                        <FaStore className="h-12 w-12 text-primary/40" />
                      </div>
                  }
                </div>
                {store.is_verified && (
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-brand-green border-2 border-background flex items-center justify-center shadow-lg">
                    <FaCheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0 pt-2 lg:pt-4">
                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                  <h1 className="text-3xl lg:text-4xl font-heading font-extrabold leading-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
                    {store.name}
                  </h1>
                  {store.is_verified && (
                    <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/25">
                      <FaCheckCircle className="h-3 w-3" /> Verificada
                    </span>
                  )}
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                    {TYPE_LABELS[store.store_type] ?? store.store_type}
                  </span>
                </div>

                {store.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3 max-w-2xl">
                    {store.description}
                  </p>
                )}

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <span className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <FaStar key={i} className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? 'text-brand-orange' : 'text-muted-foreground/20'}`} />
                      ))}
                    </div>
                    <span className="font-bold text-foreground">{rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({(store.rating_count ?? 0).toLocaleString()} reseñas)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <FaBookOpen className="h-3.5 w-3.5 text-primary" />
                    <span className="font-semibold text-foreground">{store.total_courses ?? 0}</span> cursos
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <FaUsers className="h-3.5 w-3.5 text-brand-green" />
                    <span className="font-semibold text-foreground">{(store.total_students ?? 0).toLocaleString()}</span> estudiantes
                  </span>
                  {store.city && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <FaMapMarkerAlt className="h-3.5 w-3.5" />
                      {[store.city, store.country].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex items-center gap-2.5 shrink-0 lg:pt-6">
                <Button variant="outline" size="sm" className="gap-1.5 h-9">
                  <FaHeart className="h-3.5 w-3.5" /> Seguir
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 h-9">
                  <FaShareAlt className="h-3.5 w-3.5" /> Compartir
                </Button>
                <Button size="sm" className="gap-1.5 h-9 bg-brand-green hover:bg-brand-green/90 text-white shadow-md shadow-brand-green/25">
                  Ver cursos <FaChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ BODY ══════════════ */}
      <div className="mx-auto max-w-7xl px-4 lg:px-8 pb-16">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* ── Main column ── */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="cursos">
              <TabsList className="mb-8 h-11 w-full sm:w-auto gap-1 bg-muted/60 border border-border/50 rounded-xl p-1">
                <TabsTrigger value="cursos" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">
                  Cursos ({courses.length})
                </TabsTrigger>
                <TabsTrigger value="about" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">
                  Sobre nosotros
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">
                  Reseñas ({store.rating_count ?? 0})
                </TabsTrigger>
              </TabsList>

              {/* ── Courses ── */}
              <TabsContent value="cursos" className="mt-0">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Cursos disponibles</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Explora el catálogo de {store.name}</p>
                  </div>
                </div>
                <StoreCourseCarousel courses={courses} />
              </TabsContent>

              {/* ── About ── */}
              <TabsContent value="about" className="mt-0">
                <div className="flex flex-col gap-8">
                  {store.description && (
                    <div>
                      <h2 className="text-xl font-bold mb-3">Sobre {store.name}</h2>
                      <p className="text-muted-foreground leading-relaxed">{store.description}</p>
                    </div>
                  )}

                  {store.owner_name && (
                    <div>
                      <h3 className="text-base font-semibold mb-4">Fundador / Director</h3>
                      <div className="flex items-start gap-4 p-5 rounded-2xl border border-border/50 bg-muted/30">
                        <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                          <AvatarImage src={store.owner_avatar ?? undefined} />
                          <AvatarFallback className="bg-linear-to-br from-primary to-brand-secondary text-primary-foreground text-lg font-bold">
                            {store.owner_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-base">{store.owner_name}</p>
                          {store.owner_bio && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{store.owner_bio}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    {store.refund_policy && (
                      <div className="p-5 rounded-2xl border border-border/50 bg-muted/20">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="h-8 w-8 rounded-xl bg-brand-green/10 flex items-center justify-center">
                            <FaShieldAlt className="h-4 w-4 text-brand-green" />
                          </div>
                          <h4 className="font-semibold text-sm">Política de reembolsos</h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{store.refund_policy}</p>
                      </div>
                    )}
                    {store.support_policy && (
                      <div className="p-5 rounded-2xl border border-border/50 bg-muted/20">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <FaAward className="h-4 w-4 text-primary" />
                          </div>
                          <h4 className="font-semibold text-sm">Soporte</h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{store.support_policy}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* ── Reviews ── */}
              <TabsContent value="reviews" className="mt-0">
                {(!store.reviews || store.reviews.length === 0) ? (
                  <div className="flex flex-col items-center py-16 text-center gap-3">
                    <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center">
                      <FaStar className="h-9 w-9 text-muted-foreground/25" />
                    </div>
                    <p className="text-muted-foreground font-medium">Aún no hay reseñas para esta tienda</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {/* Rating summary */}
                    <div className="flex items-center gap-6 p-6 rounded-2xl border border-border/50 bg-linear-to-br from-brand-orange/5 to-transparent">
                      <div className="text-center">
                        <div className="text-6xl font-extrabold text-brand-orange leading-none">{rating.toFixed(1)}</div>
                        <div className="flex gap-1 justify-center mt-2">
                          {[1,2,3,4,5].map(i => (
                            <FaStar key={i} className={`h-5 w-5 ${i <= Math.round(rating) ? 'text-brand-orange' : 'text-muted-foreground/20'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{(store.rating_count ?? 0).toLocaleString()} reseñas</p>
                      </div>
                      <Separator orientation="vertical" className="h-20" />
                      <div className="flex-1 flex flex-col gap-1.5">
                        {[5,4,3,2,1].map(star => {
                          const count = store.reviews?.filter((r: Review) => r.rating === star).length ?? 0
                          const pct = store.reviews?.length ? Math.round((count / store.reviews.length) * 100) : 0
                          return (
                            <div key={star} className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground w-3 text-right">{star}</span>
                              <FaStar className="h-3 w-3 text-brand-orange/60" />
                              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-brand-orange/70" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-muted-foreground w-6">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Review cards */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {store.reviews?.map((r: Review) => (
                        <div key={r.id} className="p-5 rounded-2xl border border-border/50 bg-card hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3 mb-3">
                            <Avatar className="h-10 w-10 ring-2 ring-border/50 shrink-0">
                              <AvatarImage src={r.reviewer_avatar ?? undefined} />
                              <AvatarFallback className="bg-linear-to-br from-primary/20 to-brand-purple/20 text-sm font-bold">
                                {r.reviewer_name?.[0] ?? 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-sm truncate">{r.reviewer_name ?? 'Usuario'}</p>
                                {r.verified_purchase && (
                                  <span className="text-xs text-brand-green flex items-center gap-1 shrink-0">
                                    <FaCheckCircle className="h-3 w-3" /> Verificada
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-0.5 mt-0.5">
                                {[1,2,3,4,5].map(i => (
                                  <FaStar key={i} className={`h-3 w-3 ${i <= r.rating ? 'text-brand-orange' : 'text-muted-foreground/20'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          {r.comment && (
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">"{r.comment}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* ── Sticky Sidebar ── */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">

            {/* Rating card */}
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
              {/* Subtle glow in corner */}
              <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-brand-orange/10 blur-2xl" />

              <div className="flex items-center gap-4 mb-5">
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-brand-orange">{rating.toFixed(1)}</div>
                  <div className="flex gap-0.5 mt-1 justify-center">
                    {[1,2,3,4,5].map(i => (
                      <FaStar key={i} className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? 'text-brand-orange' : 'text-muted-foreground/20'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-semibold">{store.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{(store.rating_count ?? 0).toLocaleString()} reseñas verificadas</p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Cursos', value: store.total_courses ?? 0, icon: FaBookOpen, color: 'text-primary bg-primary/10' },
                  { label: 'Estudiantes', value: (store.total_students ?? 0).toLocaleString(), icon: FaUsers, color: 'text-brand-green bg-brand-green/10' },
                  { label: 'Reseñas', value: (store.rating_count ?? 0).toLocaleString(), icon: FaStar, color: 'text-brand-orange bg-brand-orange/10' },
                  { label: 'Valoración', value: `${rating.toFixed(1)} / 5`, icon: FaAward, color: 'text-brand-purple bg-brand-purple/10' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-muted/40 p-3.5 flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-lg ${s.color} flex items-center justify-center shrink-0`}>
                      <s.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm leading-none truncate">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button asChild className="w-full h-11 bg-brand-green hover:bg-brand-green/90 text-white font-semibold shadow-lg shadow-brand-green/25 transition-all hover:shadow-brand-green/40">
                <Link href={`#cursos`}>Ver todos los cursos</Link>
              </Button>
            </div>

            {/* Contact card */}
            <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
              <h3 className="font-semibold text-sm mb-4">Información de contacto</h3>
              <div className="flex flex-col gap-3">
                {store.email && (
                  <a href={`mailto:${store.email}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                    <div className="h-8 w-8 rounded-lg bg-primary/8 group-hover:bg-primary/15 flex items-center justify-center shrink-0 transition-colors">
                      <FaEnvelope className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="truncate">{store.email}</span>
                  </a>
                )}
                {store.phone && (
                  <a href={`tel:${store.phone}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                    <div className="h-8 w-8 rounded-lg bg-brand-green/8 group-hover:bg-brand-green/15 flex items-center justify-center shrink-0 transition-colors">
                      <FaPhone className="h-3.5 w-3.5 text-brand-green" />
                    </div>
                    <span>{store.phone}</span>
                  </a>
                )}
                {store.website && (
                  <a href={store.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                    <div className="h-8 w-8 rounded-lg bg-brand-purple/8 group-hover:bg-brand-purple/15 flex items-center justify-center shrink-0 transition-colors">
                      <FaGlobe className="h-3.5 w-3.5 text-brand-purple" />
                    </div>
                    <span>Sitio web</span>
                  </a>
                )}
                {store.city && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FaMapMarkerAlt className="h-3.5 w-3.5" />
                    </div>
                    <span>{[store.city, store.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Social links */}
              {hasSocial && (
                <>
                  <Separator className="my-4" />
                  <div className="flex gap-2">
                    {socialLinks.facebook && (
                      <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                        className="h-9 w-9 rounded-xl bg-muted hover:bg-primary hover:text-white flex items-center justify-center transition-all">
                        <FaFacebookF className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {socialLinks.twitter && (
                      <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                        className="h-9 w-9 rounded-xl bg-muted hover:bg-primary hover:text-white flex items-center justify-center transition-all">
                        <FaTwitter className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {socialLinks.instagram && (
                      <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                        className="h-9 w-9 rounded-xl bg-muted hover:bg-brand-orange hover:text-white flex items-center justify-center transition-all">
                        <FaInstagram className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {socialLinks.linkedin && (
                      <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                        className="h-9 w-9 rounded-xl bg-muted hover:bg-brand-secondary hover:text-white flex items-center justify-center transition-all">
                        <FaLinkedinIn className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* B2B CTA */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/8 via-brand-secondary/5 to-brand-purple/8 p-5">
              <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <FaAward className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-bold text-sm mb-1">Formación corporativa B2B</h4>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  ¿Necesitas capacitar a tu equipo? Solicita una cotización personalizada.
                </p>
                <Button asChild variant="outline" className="w-full h-10 border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all font-semibold">
                  <Link href={`/empresas?tienda=${store.slug}`}>Solicitar cotización B2B</Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
