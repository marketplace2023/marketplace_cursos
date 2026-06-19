import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  FaStar, FaUsers, FaBookOpen, FaGlobe, FaLinkedinIn,
  FaBriefcase, FaCertificate, FaClock, FaGraduationCap,
} from 'react-icons/fa'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { JsonLd, instructorJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonld'
import { formatCurrency, durationLabel } from '@/lib/utils'
import { db } from '@/lib/db'
import { res_users, marketplace_instructor, product_template, marketplace_store } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eduumarket.netlify.app'

async function getInstructor(slug: string) {
  try {
    const [user] = await db
      .select({
        id: res_users.id,
        name: res_users.name,
        last_name: res_users.last_name,
        public_name: res_users.public_name,
        username: res_users.username,
        avatar_url: res_users.avatar_url,
        bio: res_users.bio,
        website: res_users.website,
        country: res_users.country,
        user_type: res_users.user_type,
        headline: marketplace_instructor.headline,
        expertise: marketplace_instructor.expertise,
        credentials: marketplace_instructor.credentials,
        linkedin_url: marketplace_instructor.linkedin_url,
        portfolio_url: marketplace_instructor.portfolio_url,
        rating_avg: marketplace_instructor.rating_avg,
        rating_count: marketplace_instructor.rating_count,
        total_courses: marketplace_instructor.total_courses,
        total_students: marketplace_instructor.total_students,
      })
      .from(res_users)
      .leftJoin(marketplace_instructor, eq(marketplace_instructor.user_id, res_users.id))
      .where(and(eq(res_users.username, slug), eq(res_users.user_type, 'instructor')))
      .limit(1)

    if (!user) return null

    const courses = await db
      .select({
        id: product_template.id,
        name: product_template.name,
        slug: product_template.slug,
        cover_url: product_template.cover_url,
        list_price: product_template.list_price,
        sale_price: product_template.sale_price,
        is_free: product_template.is_free,
        currency: product_template.currency,
        level: product_template.level,
        duration_hours: product_template.duration_hours,
        rating_avg: product_template.rating_avg,
        rating_count: product_template.rating_count,
        total_students: product_template.total_students,
        has_certificate: product_template.has_certificate,
        is_bestseller: product_template.is_bestseller,
        store_name: marketplace_store.name,
        store_slug: marketplace_store.slug,
      })
      .from(product_template)
      .leftJoin(marketplace_store, eq(marketplace_store.id, product_template.store_id))
      .where(and(eq(product_template.instructor_id, user.id), eq(product_template.state, 'published')))
      .limit(50)

    const display_name = user.public_name ?? `${user.name}${user.last_name ? ' ' + user.last_name : ''}`
    return { ...user, display_name, courses }
  } catch { return null }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const instructor = await getInstructor(slug)
  if (!instructor) return {}

  const title = `${instructor.display_name} — Instructor | EduMarket`
  const description = instructor.headline ?? instructor.bio ?? `Conoce el perfil de ${instructor.display_name} en EduMarket.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE}/instructores/${slug}`,
      type: 'profile',
      images: instructor.avatar_url ? [{ url: instructor.avatar_url, alt: instructor.display_name }] : [],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: instructor.avatar_url ? [instructor.avatar_url] : [],
    },
    alternates: { canonical: `${BASE}/instructores/${slug}` },
  }
}

type Course = {
  id: number; name: string; slug: string; cover_url?: string | null
  list_price: string; sale_price?: string | null; is_free: boolean; currency: string | null
  level: string | null; duration_hours?: string | null; rating_avg: string | null; rating_count: number | null
  total_students: number | null; has_certificate: boolean | null; is_bestseller: boolean | null
  store_name?: string | null
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  all_levels: 'Todos los niveles',
}

function CourseCard({ course }: { course: Course }) {
  const price = Number(course.sale_price ?? course.list_price)
  const originalPrice = course.sale_price ? Number(course.list_price) : null

  return (
    <Link href={`/cursos/${course.slug}`} className="group flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border">
      <div className="h-20 w-32 rounded-lg bg-muted overflow-hidden shrink-0">
        {course.cover_url
          ? <img src={course.cover_url} alt={course.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
          : <div className="h-full w-full flex items-center justify-center"><FaBookOpen className="h-6 w-6 text-muted-foreground/40" /></div>
        }
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">{course.name}</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {(course.rating_count ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <FaStar className="h-3 w-3 text-yellow-500" />
              {Number(course.rating_avg ?? 0).toFixed(1)} ({(course.rating_count ?? 0).toLocaleString()})
            </span>
          )}
          <span className="flex items-center gap-1">
            <FaUsers className="h-3 w-3" />{(course.total_students ?? 0).toLocaleString()}
          </span>
          {course.duration_hours && (
            <span className="flex items-center gap-1"><FaClock className="h-3 w-3" />{durationLabel(Number(course.duration_hours))}</span>
          )}
          {course.has_certificate && (
            <span className="flex items-center gap-1 text-brand-purple"><FaCertificate className="h-3 w-3" />Cert.</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{LEVEL_LABELS[course.level ?? ''] ?? course.level}</Badge>
          {course.is_bestseller && <Badge className="text-xs bg-brand-orange border-0 text-white">Bestseller</Badge>}
        </div>
      </div>
      <div className="shrink-0 text-right">
        {course.is_free ? (
          <span className="font-bold text-brand-green text-sm">Gratis</span>
        ) : (
          <div>
            <span className="font-bold text-primary text-sm">{formatCurrency(price, course.currency ?? 'USD')}</span>
            {originalPrice && <p className="text-xs text-muted-foreground line-through">{formatCurrency(originalPrice, course.currency ?? 'USD')}</p>}
          </div>
        )}
      </div>
    </Link>
  )
}

export default async function InstructorFichaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const instructor = await getInstructor(slug)
  if (!instructor) notFound()

  const rating = Number(instructor.rating_avg ?? 0)
  const expertise: string[] = (() => { try { return JSON.parse(instructor.expertise ?? '[]') } catch { return [] } })()
  const courses: Course[] = instructor.courses ?? []

  const jsonLdData = [
    instructorJsonLd({
      name: instructor.display_name,
      headline: instructor.headline,
      avatar_url: instructor.avatar_url,
      bio: instructor.bio,
      username: slug,
      linkedin_url: instructor.linkedin_url,
      rating_avg: instructor.rating_avg,
      rating_count: instructor.rating_count,
    }),
    breadcrumbJsonLd([
      { name: 'Inicio', url: BASE },
      { name: 'Instructores', url: `${BASE}/instructores` },
      { name: instructor.display_name, url: `${BASE}/instructores/${slug}` },
    ]),
  ]

  return (
    <div className="min-h-screen">
      <JsonLd data={jsonLdData} />

      {/* ─── Profile header ─── */}
      <div className="bg-linear-to-br from-primary/10 to-accent/10 border-b">
        <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/instructores" className="hover:text-foreground transition-colors">Instructores</Link>
            <span>/</span>
            <span className="text-foreground">{instructor.display_name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Avatar className="h-28 w-28 ring-4 ring-background shadow-lg">
              <AvatarImage src={instructor.avatar_url ?? undefined} alt={instructor.display_name} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {instructor.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-heading font-bold">{instructor.display_name}</h1>
              {instructor.headline && (
                <p className="text-muted-foreground text-lg mt-1">{instructor.headline}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-4 text-sm">
                {rating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <FaStar className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({(instructor.rating_count ?? 0).toLocaleString()} reseñas)</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <FaUsers className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold">{(instructor.total_students ?? 0).toLocaleString()}</span>
                  <span className="text-muted-foreground">estudiantes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaGraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold">{courses.length}</span>
                  <span className="text-muted-foreground">{courses.length === 1 ? 'curso' : 'cursos'}</span>
                </div>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-3 mt-4">
                {instructor.linkedin_url && (
                  <a href={instructor.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#0A66C2] transition-colors">
                    <FaLinkedinIn className="h-4 w-4" /> LinkedIn
                  </a>
                )}
                {instructor.website && (
                  <a href={instructor.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <FaGlobe className="h-4 w-4" /> Sitio web
                  </a>
                )}
                {instructor.portfolio_url && (
                  <a href={instructor.portfolio_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <FaBriefcase className="h-4 w-4" /> Portafolio
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main content ─── */}
      <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8 grid gap-8 lg:grid-cols-3">
        {/* Left column: about + expertise */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {instructor.bio && (
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold mb-3">Sobre mí</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{instructor.bio}</p>
              </CardContent>
            </Card>
          )}

          {expertise.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold mb-3">Áreas de expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {expertise.map((e: string) => (
                    <Badge key={e} variant="secondary">{e}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: courses */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-heading font-bold mb-4">
            Cursos publicados
            <span className="ml-2 text-sm font-normal text-muted-foreground">({courses.length})</span>
          </h2>

          {courses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FaBookOpen className="mx-auto h-8 w-8 mb-3 opacity-40" />
              <p>Este instructor aún no tiene cursos publicados.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
