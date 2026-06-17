import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaBookOpen, FaUsers, FaStar, FaDollarSign, FaArrowRight, FaPlus, FaChalkboardTeacher } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import {
  marketplace_instructor, product_template, marketplace_enrollment,
  marketplace_review, res_users,
} from '@/lib/db/schema'
import { eq, count, desc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/utils'

export default async function InstructorDashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [instructor] = await db.select()
    .from(marketplace_instructor)
    .where(eq(marketplace_instructor.user_id, Number(session.sub)))
    .limit(1)

  const [user] = await db.select({ name: res_users.name, avatar_url: res_users.avatar_url })
    .from(res_users).where(eq(res_users.id, Number(session.sub))).limit(1)

  const courses = await db
    .select({
      id: product_template.id, name: product_template.name, slug: product_template.slug,
      state: product_template.state, total_students: product_template.total_students,
      rating_avg: product_template.rating_avg, cover_url: product_template.cover_url,
    })
    .from(product_template)
    .where(eq(product_template.instructor_id, Number(session.sub)))
    .orderBy(desc(product_template.created_at))
    .limit(5)

  const recentReviews = await db
    .select({
      id: marketplace_review.id, rating: marketplace_review.rating,
      comment: marketplace_review.comment, created_at: marketplace_review.created_at,
      course_name: product_template.name, student_name: res_users.name,
    })
    .from(marketplace_review)
    .innerJoin(product_template, eq(marketplace_review.course_id, product_template.id))
    .innerJoin(res_users, eq(marketplace_review.user_id, res_users.id))
    .where(eq(product_template.instructor_id, Number(session.sub)))
    .orderBy(desc(marketplace_review.created_at))
    .limit(4)

  const STATS = [
    { label: 'Cursos', value: instructor?.total_courses ?? courses.length, icon: FaBookOpen, color: 'text-primary', bg: 'bg-primary/10', href: '/dashboard/instructor/cursos' },
    { label: 'Estudiantes', value: instructor?.total_students ?? 0, icon: FaUsers, color: 'text-brand-green', bg: 'bg-brand-green/10', href: '/dashboard/instructor/estudiantes' },
    { label: 'Rating avg', value: `${Number(instructor?.rating_avg ?? 0).toFixed(1)}/5`, icon: FaStar, color: 'text-brand-orange', bg: 'bg-brand-orange/10', href: '/dashboard/instructor/reviews' },
    { label: 'Reseñas', value: instructor?.rating_count ?? 0, icon: FaDollarSign, color: 'text-brand-purple', bg: 'bg-brand-purple/10', href: '/dashboard/instructor/reviews' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">¡Hola, {user?.name?.split(' ')[0]}!</h1>
          {instructor?.headline && <p className="text-muted-foreground mt-0.5">{instructor.headline}</p>}
        </div>
        <Button asChild className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <Link href="/dashboard/tienda/cursos/nuevo"><FaPlus className="h-4 w-4" />Nuevo curso</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Mis cursos</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/dashboard/instructor/cursos">Ver todos <FaArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {courses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">No tienes cursos asignados</p>
              </div>
            ) : courses.map(c => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="h-10 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                  {c.cover_url && <img src={c.cover_url} alt={c.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.total_students ?? 0} estudiantes · ⭐ {Number(c.rating_avg ?? 0).toFixed(1)}</p>
                </div>
                <Badge variant={c.state === 'published' ? 'default' : 'secondary'} className="text-xs shrink-0">{c.state}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Reseñas recientes</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/dashboard/instructor/reviews">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sin reseñas aún</p>
            ) : recentReviews.map(r => (
              <div key={r.id} className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs">{r.student_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{r.student_name}</p>
                    <span className="text-brand-orange text-xs shrink-0">{'⭐'.repeat(r.rating)}</span>
                  </div>
                  {r.comment && <p className="text-xs text-muted-foreground line-clamp-2">{r.comment}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
