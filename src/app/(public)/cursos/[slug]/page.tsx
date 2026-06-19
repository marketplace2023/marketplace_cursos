import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  FaStar, FaUsers, FaClock, FaCheckCircle, FaCertificate,
  FaShoppingCart, FaHeart, FaShare, FaGraduationCap,
  FaPlayCircle, FaFileAlt, FaChevronDown, FaStore,
  FaGlobe, FaInfinity, FaMobile, FaShieldAlt,
} from 'react-icons/fa'
import { JsonLd, courseJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonld'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatCurrency, durationLabel } from '@/lib/utils'
import { db } from '@/lib/db'
import { product_template, product_category, marketplace_store, res_users, slide_channel, slide_slide, marketplace_review } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'

async function getCourse(slug: string) {
  try {
    const isNumeric = /^\d+$/.test(slug)
    const condition = and(
      isNumeric ? eq(product_template.id, Number(slug)) : eq(product_template.slug, slug),
      isNull(product_template.deleted_at),
    )

    const [course] = await db
      .select({
        id: product_template.id,
        name: product_template.name,
        subtitle: product_template.subtitle,
        slug: product_template.slug,
        description: product_template.description,
        short_description: product_template.short_description,
        learning_objectives: product_template.learning_objectives,
        requirements: product_template.requirements,
        target_audience: product_template.target_audience,
        level: product_template.level,
        modality: product_template.modality,
        format: product_template.format,
        language: product_template.language,
        duration_hours: product_template.duration_hours,
        total_modules: product_template.total_modules,
        total_lessons: product_template.total_lessons,
        list_price: product_template.list_price,
        sale_price: product_template.sale_price,
        is_free: product_template.is_free,
        currency: product_template.currency,
        access_type: product_template.access_type,
        access_days: product_template.access_days,
        refund_days: product_template.refund_days,
        cover_url: product_template.cover_url,
        preview_video_url: product_template.preview_video_url,
        preview_video_duration: product_template.preview_video_duration,
        rating_avg: product_template.rating_avg,
        rating_count: product_template.rating_count,
        total_students: product_template.total_students,
        has_certificate: product_template.has_certificate,
        is_featured: product_template.is_featured,
        is_bestseller: product_template.is_bestseller,
        is_new: product_template.is_new,
        state: product_template.state,
        published_at: product_template.published_at,
        store_id: marketplace_store.id,
        store_name: marketplace_store.name,
        store_slug: marketplace_store.slug,
        store_logo: marketplace_store.logo_url,
        store_verified: marketplace_store.is_verified,
        store_students: marketplace_store.total_students,
        store_courses: marketplace_store.total_courses,
        instructor_id: res_users.id,
        instructor_name: res_users.name,
        instructor_avatar: res_users.avatar_url,
        instructor_bio: res_users.bio,
        category_name: product_category.name,
        category_slug: product_category.slug,
      })
      .from(product_template)
      .leftJoin(marketplace_store, eq(product_template.store_id, marketplace_store.id))
      .leftJoin(res_users, eq(product_template.instructor_id, res_users.id))
      .leftJoin(product_category, eq(product_template.category_id, product_category.id))
      .where(condition)
      .limit(1)

    if (!course) return null

    const modules = await db
      .select()
      .from(slide_channel)
      .where(and(eq(slide_channel.course_id, course.id), eq(slide_channel.active, true)))
      .orderBy(slide_channel.sort_order)

    const lessons = await db
      .select()
      .from(slide_slide)
      .where(and(eq(slide_slide.course_id, course.id), eq(slide_slide.active, true)))
      .orderBy(slide_slide.sort_order)

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
        eq(marketplace_review.course_id, course.id),
        eq(marketplace_review.state, 'published'),
      ))
      .orderBy(marketplace_review.created_at)
      .limit(10)

    const modulesWithLessons = modules.map(m => ({
      ...m,
      lessons: lessons.filter(l => l.channel_id === m.id),
    }))

    return { ...course, modules: modulesWithLessons, reviews }
  } catch {
    return null
  }
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  all_levels: 'Todos los niveles',
}

const MODALITY_LABELS: Record<string, string> = {
  online_async: 'Online asíncrono',
  online_sync: 'Online en vivo',
  presential: 'Presencial',
  hybrid: 'Híbrido',
  recorded: 'Grabado',
}

type SlideType = 'video' | 'text' | 'quiz' | 'file' | 'live'

function slideIcon(type: SlideType) {
  if (type === 'video' || type === 'live') return <FaPlayCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
  return <FaFileAlt className="h-4 w-4 shrink-0 text-muted-foreground" />
}

function secondsToLabel(secs: number) {
  if (!secs) return ''
  const m = Math.floor(secs / 60)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)}h ${m % 60}min`
}

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eduumarket.netlify.app'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourse(slug)
  if (!course) return {}

  const title = `${course.name} | EduMarket`
  const description = course.subtitle ?? course.description ?? undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE}/cursos/${slug}`,
      type: 'article',
      images: course.cover_url ? [{ url: course.cover_url, width: 1200, height: 630, alt: course.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: course.cover_url ? [course.cover_url] : [],
    },
    alternates: { canonical: `${BASE}/cursos/${slug}` },
  }
}

export default async function CursoFichaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const course = await getCourse(slug)

  if (!course) notFound()

  const price = Number(course.sale_price ?? course.list_price)
  const originalPrice = course.sale_price ? Number(course.list_price) : null
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0
  const objectives: string[] = (() => {
    try { return JSON.parse(course.learning_objectives ?? '[]') } catch { return [] }
  })()
  const requirements: string[] = (() => {
    try { return JSON.parse(course.requirements ?? '[]') } catch { return [] }
  })()
  const rating = Number(course.rating_avg ?? 0)

  const jsonLdData = [
    courseJsonLd({
      name: course.name,
      description: course.description,
      slug,
      cover_url: course.cover_url,
      list_price: course.list_price,
      sale_price: course.sale_price,
      currency: course.currency ?? 'USD',
      rating_avg: course.rating_avg,
      rating_count: course.rating_count,
      duration_hours: course.duration_hours,
      level: course.level,
      language: course.language,
      instructor_name: course.instructor_name,
      store_name: course.store_name,
      store_slug: course.store_slug,
    }),
    breadcrumbJsonLd([
      { name: 'Inicio', url: BASE },
      { name: 'Cursos', url: `${BASE}/cursos` },
      ...(course.category_name ? [{ name: course.category_name, url: `${BASE}/cursos?category=${course.category_slug}` }] : []),
      { name: course.name, url: `${BASE}/cursos/${slug}` },
    ]),
  ]

  return (
    <div className="min-h-screen">
      <JsonLd data={jsonLdData} />
      {/* ─── Hero ─── */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-xs text-primary-foreground/60">
                <Link href="/cursos" className="hover:text-primary-foreground transition-colors">Cursos</Link>
                {course.category_name && (
                  <>
                    <span>/</span>
                    <Link href={`/cursos?category=${course.category_slug}`} className="hover:text-primary-foreground transition-colors">
                      {course.category_name}
                    </Link>
                  </>
                )}
              </nav>

              <h1 className="text-2xl lg:text-3xl font-heading font-bold leading-tight">{course.name}</h1>
              {course.subtitle && (
                <p className="text-primary-foreground/80 text-lg">{course.subtitle}</p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {course.is_bestseller && <Badge className="bg-brand-orange border-0 text-white">Bestseller</Badge>}
                {course.is_new && <Badge className="bg-brand-green border-0 text-white">Nuevo</Badge>}
                {course.has_certificate && (
                  <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">
                    <FaCertificate className="mr-1 h-3 w-3" /> Certificado
                  </Badge>
                )}
                <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">
                  {LEVEL_LABELS[course.level] ?? course.level}
                </Badge>
              </div>

              {/* Rating row */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-brand-orange">{rating.toFixed(1)}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FaStar key={i} className={`h-4 w-4 ${i < Math.round(rating) ? 'text-brand-orange' : 'text-primary-foreground/20'}`} />
                    ))}
                  </div>
                  <span className="text-primary-foreground/70">({(course.rating_count ?? 0).toLocaleString()} reseñas)</span>
                </div>
                <span className="flex items-center gap-1 text-primary-foreground/70">
                  <FaUsers className="h-4 w-4" />
                  {(course.total_students ?? 0).toLocaleString()} estudiantes
                </span>
                <span className="flex items-center gap-1 text-primary-foreground/70">
                  <FaClock className="h-4 w-4" />
                  {course.duration_hours ? durationLabel(Number(course.duration_hours)) : 'N/A'}
                </span>
                {course.language && (
                  <span className="flex items-center gap-1 text-primary-foreground/70">
                    <FaGlobe className="h-4 w-4" />
                    {course.language.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Instructor / Store */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/70">
                {course.instructor_name && (
                  <span>
                    Instructor:{' '}
                    <span className="text-primary-foreground font-medium underline cursor-pointer">
                      {course.instructor_name}
                    </span>
                  </span>
                )}
                {course.store_name && (
                  <span>
                    Academia:{' '}
                    <Link href={`/tiendas/${course.store_slug}`} className="text-primary-foreground font-medium underline">
                      {course.store_name}
                    </Link>
                    {course.store_verified && <FaCheckCircle className="inline ml-1 h-3 w-3 text-brand-green" />}
                  </span>
                )}
              </div>
            </div>

            {/* Price card — visible on desktop within hero */}
            <div className="hidden lg:block">
              <PriceCard course={course} price={price} originalPrice={originalPrice} discount={discount} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 flex flex-col gap-10">

            {/* Cover video preview */}
            {course.preview_video_url && (
              <div className="aspect-video rounded-xl overflow-hidden bg-black">
                <video controls className="w-full h-full" poster={course.cover_url ?? undefined}>
                  <source src={course.preview_video_url} />
                </video>
              </div>
            )}

            {/* What you'll learn */}
            {objectives.length > 0 && (
              <section>
                <h2 className="text-xl font-heading font-bold mb-4">¿Qué aprenderás?</h2>
                <div className="border rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <FaCheckCircle className="h-4 w-4 shrink-0 text-brand-green mt-0.5" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
              <section>
                <h2 className="text-xl font-heading font-bold mb-4">Requisitos</h2>
                <ul className="flex flex-col gap-2">
                  {requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Target audience */}
            {course.target_audience && (
              <section>
                <h2 className="text-xl font-heading font-bold mb-4">¿A quién está dirigido?</h2>
                <p className="text-muted-foreground">{course.target_audience}</p>
              </section>
            )}

            {/* Description */}
            {course.description && (
              <section>
                <h2 className="text-xl font-heading font-bold mb-4">Descripción del curso</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                  {course.description}
                </div>
              </section>
            )}

            {/* Modules / Curriculum */}
            {course.modules?.length > 0 && (
              <section>
                <h2 className="text-xl font-heading font-bold mb-1">Temario</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {course.total_modules} módulos · {course.total_lessons} lecciones ·{' '}
                  {course.duration_hours ? durationLabel(Number(course.duration_hours)) : ''}
                </p>
                <Accordion type="multiple" className="border rounded-xl overflow-hidden divide-y">
                  {course.modules.map((mod: { id: number; name: string; lessons: { id: number; name: string; slide_type: SlideType; duration: number; is_preview: boolean }[] }) => (
                    <AccordionItem key={mod.id} value={String(mod.id)} className="border-0">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/40 font-medium text-sm">
                        <span className="text-left">{mod.name}</span>
                        <span className="ml-auto mr-3 text-xs text-muted-foreground shrink-0">
                          {mod.lessons.length} lecciones
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3 pt-0">
                        <ul className="flex flex-col gap-1">
                          {mod.lessons.map((lesson) => (
                            <li key={lesson.id} className="flex items-center gap-2 py-1.5 text-sm">
                              {slideIcon(lesson.slide_type)}
                              <span className="flex-1">{lesson.name}</span>
                              {lesson.is_preview && (
                                <Badge variant="outline" className="text-xs border-brand-green text-brand-green">
                                  Vista previa
                                </Badge>
                              )}
                              {lesson.duration > 0 && (
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {secondsToLabel(lesson.duration)}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}

            {/* Instructor */}
            {course.instructor_name && (
              <section>
                <h2 className="text-xl font-heading font-bold mb-4">Instructor</h2>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={course.instructor_avatar ?? undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                      {course.instructor_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{course.instructor_name}</h3>
                    {course.instructor_bio && (
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{course.instructor_bio}</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Store / Academy */}
            {course.store_name && (
              <section>
                <h2 className="text-xl font-heading font-bold mb-4">Academia</h2>
                <Card>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center shrink-0">
                      {course.store_logo ? (
                        <img src={course.store_logo} alt={course.store_name} className="h-14 w-14 rounded-full object-cover" />
                      ) : (
                        <FaStore className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 font-semibold">
                        {course.store_name}
                        {course.store_verified && <FaCheckCircle className="h-4 w-4 text-brand-green" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(course.store_courses ?? 0)} cursos · {(course.store_students ?? 0).toLocaleString()} estudiantes
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/tiendas/${course.store_slug}`}>Ver tienda</Link>
                    </Button>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Certificate */}
            {course.has_certificate && (
              <section>
                <h2 className="text-xl font-heading font-bold mb-4">Certificación</h2>
                <Card className="border-brand-purple/20 bg-brand-purple/5">
                  <CardContent className="flex items-start gap-4 p-4">
                    <FaCertificate className="h-8 w-8 text-brand-purple shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-brand-purple">Certificado de finalización</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Al completar el curso recibirás un certificado verificable con tu nombre. Comparte tu logro en LinkedIn y en tu CV.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* What's included */}
            <section>
              <h2 className="text-xl font-heading font-bold mb-4">Este curso incluye</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {[
                  { icon: FaClock, label: `${course.duration_hours ? durationLabel(Number(course.duration_hours)) : ''} de contenido en video` },
                  { icon: FaInfinity, label: 'Acceso de por vida' },
                  { icon: FaMobile, label: 'Disponible en móvil y escritorio' },
                  ...(course.has_certificate ? [{ icon: FaCertificate, label: 'Certificado de finalización' }] : []),
                  { icon: FaShieldAlt, label: `Garantía de devolución ${course.refund_days ?? 30} días` },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    {item.label}
                  </li>
                ))}
              </ul>
            </section>

            {/* Reviews */}
            {course.reviews?.length > 0 && (
              <section>
                <h2 className="text-xl font-heading font-bold mb-2">Reseñas de estudiantes</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl font-bold text-brand-orange">{rating.toFixed(1)}</div>
                  <div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <FaStar key={i} className={`h-5 w-5 ${i < Math.round(rating) ? 'text-brand-orange' : 'text-muted-foreground/20'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Basado en {(course.rating_count ?? 0).toLocaleString()} reseñas
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  {course.reviews.map((review: { id: number; rating: number; comment?: string; verified_purchase: boolean; created_at: string; reviewer_name?: string; reviewer_avatar?: string }) => (
                    <div key={review.id} className="flex gap-4">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={review.reviewer_avatar ?? undefined} />
                        <AvatarFallback>{review.reviewer_name?.[0] ?? 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{review.reviewer_name ?? 'Usuario'}</span>
                          {review.verified_purchase && (
                            <Badge variant="outline" className="text-xs border-brand-green text-brand-green">
                              Compra verificada
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-0.5 mb-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <FaStar key={i} className={`h-3 w-3 ${i < review.rating ? 'text-brand-orange' : 'text-muted-foreground/20'}`} />
                          ))}
                        </div>
                        {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right column — sticky price card */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <PriceCard course={course} price={price} originalPrice={originalPrice} discount={discount} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t bg-background/95 backdrop-blur p-4 flex items-center gap-3">
        <div>
          {course.is_free ? (
            <p className="text-lg font-bold text-brand-green">Gratis</p>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-primary">{formatCurrency(price, course.currency)}</p>
              {originalPrice && (
                <p className="text-sm text-muted-foreground line-through">{formatCurrency(originalPrice, course.currency)}</p>
              )}
            </div>
          )}
        </div>
        <Button className="flex-1 bg-brand-green hover:bg-brand-green-dark text-white gap-2">
          <FaShoppingCart className="h-4 w-4" />
          {course.is_free ? 'Inscribirme gratis' : 'Comprar ahora'}
        </Button>
      </div>
    </div>
  )
}

function PriceCard({
  course,
  price,
  originalPrice,
  discount,
}: {
  course: { name: string; cover_url?: string; is_free: boolean; currency: string; access_type?: string; refund_days?: number; has_certificate?: boolean; store_slug?: string; store_name?: string }
  price: number
  originalPrice: number | null
  discount: number
}) {
  return (
    <Card className="overflow-hidden shadow-xl">
      {course.cover_url && (
        <div className="aspect-video">
          <img src={course.cover_url} alt={course.name} className="w-full h-full object-cover" />
        </div>
      )}
      <CardContent className="p-6 flex flex-col gap-4">
        <div>
          {course.is_free ? (
            <p className="text-3xl font-bold text-brand-green">Gratis</p>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold text-primary">{formatCurrency(price, course.currency)}</p>
              {originalPrice && (
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground line-through">{formatCurrency(originalPrice, course.currency)}</span>
                  <Badge className="w-fit bg-destructive text-white border-0 text-xs">-{discount}% OFF</Badge>
                </div>
              )}
            </div>
          )}
        </div>

        <Button size="lg" className="w-full bg-brand-green hover:bg-brand-green-dark text-white gap-2">
          <FaShoppingCart className="h-4 w-4" />
          {course.is_free ? 'Inscribirme gratis' : 'Comprar ahora'}
        </Button>

        <Button size="lg" variant="outline" className="w-full gap-2">
          <FaShoppingCart className="h-4 w-4" />
          Agregar al carrito
        </Button>

        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
            <FaHeart className="h-3 w-3" /> Favoritos
          </button>
          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
            <FaShare className="h-3 w-3" /> Compartir
          </button>
        </div>

        <Separator />

        <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <FaInfinity className="h-3 w-3 shrink-0" />
            {course.access_type === 'lifetime' ? 'Acceso de por vida' : `Acceso por ${course.access_type}`}
          </li>
          <li className="flex items-center gap-2">
            <FaMobile className="h-3 w-3 shrink-0" />
            Disponible en móvil y escritorio
          </li>
          <li className="flex items-center gap-2">
            <FaShieldAlt className="h-3 w-3 shrink-0" />
            Garantía de devolución {course.refund_days ?? 30} días
          </li>
          {course.has_certificate && (
            <li className="flex items-center gap-2">
              <FaCertificate className="h-3 w-3 shrink-0" />
              Certificado de finalización
            </li>
          )}
        </ul>

        {course.store_name && course.store_slug && (
          <Button asChild variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground">
            <Link href={`/tiendas/${course.store_slug}`}>
              <FaStore className="h-3 w-3" /> Ver más cursos de {course.store_name}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
