import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  FaStar, FaUsers, FaBookOpen, FaCheckCircle, FaStore,
  FaGlobe, FaEnvelope, FaPhone, FaHeart, FaShareAlt,
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn,
  FaClock, FaCertificate,
} from 'react-icons/fa'
import { JsonLd, storeJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonld'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, durationLabel } from '@/lib/utils'

async function getStore(slug: string) {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/v1/stores/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data.success ? data.data : null
  } catch { return null }
}

const TYPE_LABELS: Record<string, string> = {
  academy: 'Academia',
  individual: 'Instructor independiente',
  corporate: 'Corporativa',
  government: 'Gobierno / Institución',
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  all_levels: 'Todos los niveles',
}

type Course = {
  id: number; name: string; slug: string; cover_url?: string; level: string
  duration_hours?: string; list_price: string; sale_price?: string
  is_free: boolean; currency: string; rating_avg: string; rating_count: number
  total_students: number; has_certificate: boolean; is_bestseller: boolean
  category_name?: string; instructor_name?: string
}

type Review = {
  id: number; rating: number; comment?: string
  verified_purchase: boolean; created_at: string
  reviewer_name?: string; reviewer_avatar?: string
}

function CourseRow({ course }: { course: Course }) {
  const price = Number(course.sale_price ?? course.list_price)
  const originalPrice = course.sale_price ? Number(course.list_price) : null
  return (
    <Link href={`/cursos/${course.slug}`} className="group flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="h-20 w-32 rounded-lg bg-muted overflow-hidden shrink-0">
        {course.cover_url
          ? <img src={course.cover_url} alt={course.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
          : <div className="h-full w-full flex items-center justify-center"><FaBookOpen className="h-6 w-6 text-muted-foreground/40" /></div>
        }
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">{course.name}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FaStar className="h-3 w-3 text-brand-orange" />
            {Number(course.rating_avg).toFixed(1)} ({course.rating_count.toLocaleString()})
          </span>
          {course.duration_hours && (
            <span className="flex items-center gap-1"><FaClock className="h-3 w-3" />{durationLabel(Number(course.duration_hours))}</span>
          )}
          {course.has_certificate && (
            <span className="flex items-center gap-1 text-brand-purple"><FaCertificate className="h-3 w-3" />Certificado</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">{LEVEL_LABELS[course.level] ?? course.level}</Badge>
          {course.is_bestseller && <Badge className="text-xs bg-brand-orange border-0 text-white">Bestseller</Badge>}
        </div>
      </div>
      <div className="shrink-0 text-right">
        {course.is_free ? (
          <span className="font-bold text-brand-green text-sm">Gratis</span>
        ) : (
          <div>
            <span className="font-bold text-primary text-sm">{formatCurrency(price, course.currency)}</span>
            {originalPrice && <p className="text-xs text-muted-foreground line-through">{formatCurrency(originalPrice, course.currency)}</p>}
          </div>
        )}
      </div>
    </Link>
  )
}

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const store = await getStore(slug)
  if (!store) return {}

  const title = `${store.name} | EduMarket`
  const description = store.description ?? `Explora los cursos y formaciones de ${store.name}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE}/tiendas/${slug}`,
      type: 'website',
      images: (store.logo_url ?? store.cover_url) ? [{ url: store.logo_url ?? store.cover_url, alt: store.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: store.logo_url ? [store.logo_url] : [],
    },
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
    storeJsonLd({
      name: store.name,
      description: store.description,
      slug,
      logo_url: store.logo_url,
      cover_url: store.cover_url,
      email: store.email,
      phone: store.phone,
      city: store.city,
      country: store.country,
      rating_avg: store.rating_avg,
      rating_count: store.rating_count,
      store_type: store.store_type,
    }),
    breadcrumbJsonLd([
      { name: 'Inicio', url: BASE },
      { name: 'Tiendas', url: `${BASE}/tiendas` },
      { name: store.name, url: `${BASE}/tiendas/${slug}` },
    ]),
  ]

  return (
    <div className="min-h-screen">
      <JsonLd data={jsonLdData} />
      {/* Cover */}
      <div className="relative h-48 lg:h-64 bg-linear-to-br from-primary to-accent overflow-hidden">
        {store.cover_url && <img src={store.cover_url} alt={store.name} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Store header */}
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative -mt-12 flex flex-col sm:flex-row gap-4 items-start sm:items-end mb-6">
          {/* Logo */}
          <div className="h-24 w-24 rounded-2xl border-4 border-background bg-background shadow-lg overflow-hidden shrink-0">
            {store.logo_url
              ? <img src={store.logo_url} alt={store.name} className="h-full w-full object-cover" />
              : <div className="h-full w-full flex items-center justify-center bg-muted"><FaStore className="h-10 w-10 text-muted-foreground" /></div>
            }
          </div>
          <div className="flex-1 pt-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-heading font-bold">{store.name}</h1>
              {store.is_verified && (
                <Badge className="bg-brand-green/10 text-brand-green border-(--brand-green)/30 gap-1">
                  <FaCheckCircle className="h-3 w-3" /> Verificada
                </Badge>
              )}
              <Badge variant="outline">{TYPE_LABELS[store.store_type] ?? store.store_type}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <FaStar className="h-4 w-4 text-brand-orange" />
                <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
                <span>({store.rating_count?.toLocaleString()} reseñas)</span>
              </span>
              <span className="flex items-center gap-1"><FaBookOpen className="h-4 w-4" />{store.total_courses} cursos</span>
              <span className="flex items-center gap-1"><FaUsers className="h-4 w-4" />{store.total_students?.toLocaleString()} estudiantes</span>
              {store.city && <span className="flex items-center gap-1"><FaGlobe className="h-4 w-4" />{[store.city, store.country].filter(Boolean).join(', ')}</span>}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" className="gap-1"><FaHeart className="h-4 w-4" /> Seguir</Button>
            <Button variant="outline" size="sm" className="gap-1"><FaShareAlt className="h-4 w-4" /> Compartir</Button>
            <Button size="sm" className="bg-brand-green hover:bg-brand-green-dark text-white">Ver cursos</Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="cursos">
              <TabsList className="mb-6">
                <TabsTrigger value="cursos">Cursos ({store.courses?.length ?? 0})</TabsTrigger>
                <TabsTrigger value="about">Sobre nosotros</TabsTrigger>
                <TabsTrigger value="reviews">Reseñas</TabsTrigger>
              </TabsList>

              <TabsContent value="cursos">
                {store.courses?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FaBookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>Esta tienda aún no tiene cursos publicados</p>
                  </div>
                ) : (
                  <div className="flex flex-col divide-y rounded-xl border overflow-hidden">
                    {store.courses?.map((c: Course) => <CourseRow key={c.id} course={c} />)}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="about">
                <div className="flex flex-col gap-6">
                  {store.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Descripción</h3>
                      <p className="text-muted-foreground leading-relaxed">{store.description}</p>
                    </div>
                  )}

                  {store.owner_name && (
                    <div>
                      <h3 className="font-semibold mb-3">Fundador / Director</h3>
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={store.owner_avatar ?? undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                            {store.owner_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{store.owner_name}</p>
                          {store.owner_bio && <p className="text-sm text-muted-foreground mt-1">{store.owner_bio}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {store.refund_policy && (
                    <div>
                      <h3 className="font-semibold mb-2">Política de reembolsos</h3>
                      <p className="text-sm text-muted-foreground">{store.refund_policy}</p>
                    </div>
                  )}

                  {store.support_policy && (
                    <div>
                      <h3 className="font-semibold mb-2">Soporte</h3>
                      <p className="text-sm text-muted-foreground">{store.support_policy}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                {store.reviews?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FaStar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>Aún no hay reseñas para esta tienda</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl font-bold text-brand-orange">{rating.toFixed(1)}</div>
                      <div>
                        <div className="flex gap-0.5 mb-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <FaStar key={i} className={`h-5 w-5 ${i < Math.round(rating) ? 'text-brand-orange' : 'text-muted-foreground/20'}`} />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{store.rating_count?.toLocaleString()} reseñas</p>
                      </div>
                    </div>
                    <Separator />
                    {store.reviews?.map((r: Review) => (
                      <div key={r.id} className="flex gap-4">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={r.reviewer_avatar ?? undefined} />
                          <AvatarFallback>{r.reviewer_name?.[0] ?? 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{r.reviewer_name ?? 'Usuario'}</span>
                            {r.verified_purchase && (
                              <Badge variant="outline" className="text-xs border-brand-green text-brand-green">Compra verificada</Badge>
                            )}
                          </div>
                          <div className="flex gap-0.5 mb-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <FaStar key={i} className={`h-3 w-3 ${i < r.rating ? 'text-brand-orange' : 'text-muted-foreground/20'}`} />
                            ))}
                          </div>
                          {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4">
            <Card>
              <CardContent className="p-5 flex flex-col gap-3">
                <h3 className="font-semibold">Información de contacto</h3>
                <div className="flex flex-col gap-2 text-sm">
                  {store.email && (
                    <a href={`mailto:${store.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <FaEnvelope className="h-4 w-4 shrink-0" /> {store.email}
                    </a>
                  )}
                  {store.phone && (
                    <a href={`tel:${store.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <FaPhone className="h-4 w-4 shrink-0" /> {store.phone}
                    </a>
                  )}
                  {store.website && (
                    <a href={store.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <FaGlobe className="h-4 w-4 shrink-0" /> Sitio web
                    </a>
                  )}
                </div>

                {/* Social */}
                {Object.keys(socialLinks).length > 0 && (
                  <>
                    <Separator />
                    <div className="flex gap-2">
                      {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"><FaFacebookF className="h-4 w-4" /></a>}
                      {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"><FaTwitter className="h-4 w-4" /></a>}
                      {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"><FaInstagram className="h-4 w-4" /></a>}
                      {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"><FaLinkedinIn className="h-4 w-4" /></a>}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex flex-col gap-3">
                <h3 className="font-semibold">Estadísticas</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Cursos', value: store.total_courses },
                    { label: 'Estudiantes', value: store.total_students?.toLocaleString() },
                    { label: 'Reseñas', value: store.rating_count?.toLocaleString() },
                    { label: 'Valoración', value: `${rating.toFixed(1)} / 5` },
                  ].map(s => (
                    <div key={s.label} className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-primary">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button asChild className="w-full bg-brand-green hover:bg-brand-green-dark text-white">
              <Link href={`/empresas?tienda=${store.slug}`}>Solicitar cotización B2B</Link>
            </Button>
          </aside>
        </div>
      </div>
    </div>
  )
}
