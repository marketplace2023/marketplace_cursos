import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FaBookOpen, FaUsers, FaStar, FaCommentAlt,
  FaArrowRight, FaPlus, FaChalkboardTeacher, FaChevronRight,
} from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import {
  marketplace_instructor, product_template, marketplace_review, res_users,
} from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NumberTicker } from '@/components/ui/number-ticker'
import { formatDate } from '@/lib/utils'

const COURSE_BADGE: Record<string, string> = {
  published: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  draft: 'bg-muted text-muted-foreground border-border',
  pending_review: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
}
const COURSE_LABEL: Record<string, string> = {
  published: 'Publicado', draft: 'Borrador', pending_review: 'En revisión', rejected: 'Rechazado',
}

export default async function InstructorDashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const userId = Number(session.sub)

  const [[instructor], [user], courses, recentReviews] = await Promise.all([
    db.select().from(marketplace_instructor).where(eq(marketplace_instructor.user_id, userId)).limit(1),
    db.select({ name: res_users.name, avatar_url: res_users.avatar_url }).from(res_users).where(eq(res_users.id, userId)).limit(1),
    db.select({
      id: product_template.id, name: product_template.name, slug: product_template.slug,
      state: product_template.state, total_students: product_template.total_students,
      rating_avg: product_template.rating_avg, cover_url: product_template.cover_url,
    })
      .from(product_template)
      .where(eq(product_template.instructor_id, userId))
      .orderBy(desc(product_template.created_at))
      .limit(5),
    db.select({
      id: marketplace_review.id, rating: marketplace_review.rating,
      comment: marketplace_review.comment, created_at: marketplace_review.created_at,
      course_name: product_template.name, student_name: res_users.name,
    })
      .from(marketplace_review)
      .innerJoin(product_template, eq(marketplace_review.course_id, product_template.id))
      .innerJoin(res_users, eq(marketplace_review.user_id, res_users.id))
      .where(eq(product_template.instructor_id, userId))
      .orderBy(desc(marketplace_review.created_at))
      .limit(4),
  ])

  const firstName = user?.name?.split(' ')[0] ?? session.name.split(' ')[0]
  const ratingAvg = Number(instructor?.rating_avg ?? 0)
  const totalCourses = instructor?.total_courses ?? courses.length
  const totalStudents = instructor?.total_students ?? 0
  const totalReviews = instructor?.rating_count ?? 0

  const STATS = [
    { label: 'Cursos', value: totalCourses, icon: FaBookOpen, gradient: 'from-brand-purple/10 to-brand-purple/5', iconBg: 'bg-brand-purple', textColor: 'text-brand-purple', href: '/dashboard/instructor/cursos' },
    { label: 'Estudiantes', value: totalStudents, icon: FaUsers, gradient: 'from-brand-green/10 to-brand-green/5', iconBg: 'bg-brand-green', textColor: 'text-brand-green', href: '/dashboard/instructor/estudiantes' },
    { label: 'Rating', value: null, valueText: `${ratingAvg.toFixed(1)}/5`, icon: FaStar, gradient: 'from-brand-orange/10 to-brand-orange/5', iconBg: 'bg-brand-orange', textColor: 'text-brand-orange', href: '/dashboard/instructor/reviews' },
    { label: 'Reseñas', value: totalReviews, icon: FaCommentAlt, gradient: 'from-primary/8 to-brand-secondary/5', iconBg: 'bg-primary', textColor: 'text-primary', href: '/dashboard/instructor/reviews' },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-purple via-purple-500 to-brand-purple/60 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-black/10" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/70 font-medium">Instructor</p>
            <h1 className="text-2xl font-heading font-bold mt-0.5">¡Hola, {firstName}!</h1>
            {instructor?.headline
              ? <p className="text-white/60 text-sm mt-1 line-clamp-1">{instructor.headline}</p>
              : <p className="text-white/60 text-sm mt-1">Gestiona tus cursos y estudiantes</p>
            }
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            <div className="hidden sm:flex h-16 w-16 rounded-2xl bg-white/10 items-center justify-center">
              <FaChalkboardTeacher className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        {ratingAvg > 0 && (
          <div className="relative mt-3 flex items-center gap-3 rounded-lg bg-black/20 px-3 py-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <FaStar key={i} className={`h-3 w-3 ${i <= Math.round(ratingAvg) ? 'text-yellow-300' : 'text-white/20'}`} />
              ))}
            </div>
            <p className="text-xs text-white/80">{ratingAvg.toFixed(1)} · {totalReviews} reseñas</p>
          </div>
        )}
      </div>

      {/* Header actions */}
      <div className="flex items-center justify-between -mt-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resumen</p>
        <Button asChild size="sm" className="gap-2 bg-brand-purple hover:bg-brand-purple/90 text-white h-8">
          <Link href="/dashboard/tienda/cursos/nuevo"><FaPlus className="h-3.5 w-3.5" />Nuevo curso</Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <Link key={s.label} href={s.href} className="group">
            <Card className={`overflow-hidden border transition-all hover:shadow-md hover:-translate-y-0.5 bg-linear-to-br ${s.gradient}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-10 w-10 rounded-xl ${s.iconBg} flex items-center justify-center shadow-sm`}>
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <FaChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
                </div>
                {s.value !== null
                  ? <NumberTicker value={s.value} className={`text-3xl font-bold tabular-nums ${s.textColor}`} />
                  : <p className={`text-2xl font-bold tabular-nums ${s.textColor}`}>{s.valueText}</p>
                }
                <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div>
              <CardTitle className="text-base font-semibold">Mis cursos</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Rendimiento de contenido</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-primary hover:text-primary">
              <Link href="/dashboard/instructor/cursos">Ver todos <FaArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-2">
            {courses.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center gap-2">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-1">
                  <FaBookOpen className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">No tienes cursos asignados aún</p>
                <Button asChild size="sm" className="gap-1.5 bg-brand-purple hover:bg-brand-purple/90 text-white mt-1">
                  <Link href="/dashboard/tienda/cursos/nuevo"><FaPlus className="h-3 w-3" />Crear curso</Link>
                </Button>
              </div>
            ) : courses.map(c => (
              <div key={c.id} className="group flex items-center gap-3 rounded-xl p-2.5 hover:bg-muted/50 transition-colors">
                <div className="h-12 w-18 rounded-lg bg-muted overflow-hidden shrink-0 shadow-sm">
                  {c.cover_url
                    ? <img src={c.cover_url} alt={c.name} className="w-full h-full object-cover" />
                    : <div className="h-full w-full flex items-center justify-center bg-brand-purple/5">
                        <FaBookOpen className="h-4 w-4 text-brand-purple/30" />
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-brand-purple transition-colors">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.total_students ?? 0} estudiantes · ⭐ {Number(c.rating_avg ?? 0).toFixed(1)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${COURSE_BADGE[c.state ?? 'draft'] ?? 'bg-muted text-muted-foreground border-border'}`}>
                  {COURSE_LABEL[c.state ?? 'draft'] ?? c.state}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div>
              <CardTitle className="text-base font-semibold">Reseñas recientes</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Feedback de estudiantes</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-primary hover:text-primary">
              <Link href="/dashboard/instructor/reviews">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-3">
            {recentReviews.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center gap-2">
                <FaStar className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">Sin reseñas aún</p>
              </div>
            ) : recentReviews.map(r => (
              <div key={r.id} className="rounded-xl border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple text-xs font-bold">
                      {r.student_name?.[0]?.toUpperCase()}
                    </div>
                    <p className="text-sm font-medium">{r.student_name}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <FaStar key={i} className={`h-3 w-3 ${i <= r.rating ? 'text-brand-orange' : 'text-muted-foreground/20'}`} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-xs text-muted-foreground line-clamp-2">{r.comment}</p>}
                <p className="text-xs text-muted-foreground/50 mt-1.5">{r.course_name} · {formatDate(r.created_at)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
