import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaBookOpen, FaPlay, FaCheckCircle, FaClock } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_enrollment, product_template, marketplace_store } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { durationLabel } from '@/lib/utils'

const STATE_LABELS: Record<string, string> = { active: 'En progreso', completed: 'Completado', suspended: 'Suspendido', expired: 'Expirado' }
const STATE_COLORS: Record<string, string> = { active: 'secondary', completed: 'default', suspended: 'destructive', expired: 'outline' }

export default async function MisCursosPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const enrollments = await db
    .select({
      id: marketplace_enrollment.id,
      state: marketplace_enrollment.state,
      progress_pct: marketplace_enrollment.progress_pct,
      enrolled_at: marketplace_enrollment.enrolled_at,
      completed_at: marketplace_enrollment.completed_at,
      course_name: product_template.name,
      course_slug: product_template.slug,
      course_cover: product_template.cover_url,
      course_level: product_template.level,
      duration_hours: product_template.duration_hours,
      total_lessons: product_template.total_lessons,
      has_certificate: product_template.has_certificate,
      store_name: marketplace_store.name,
    })
    .from(marketplace_enrollment)
    .leftJoin(product_template, eq(marketplace_enrollment.course_id, product_template.id))
    .leftJoin(marketplace_store, eq(product_template.store_id, marketplace_store.id))
    .where(eq(marketplace_enrollment.user_id, Number(session.sub)))
    .orderBy(desc(marketplace_enrollment.updated_at))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Mis Cursos</h1>
        <p className="text-muted-foreground mt-0.5">{enrollments.length} curso{enrollments.length !== 1 ? 's' : ''} inscrito{enrollments.length !== 1 ? 's' : ''}</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaBookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tienes cursos aún</h3>
          <p className="text-muted-foreground mb-4">Explora el catálogo y comienza a aprender hoy</p>
          <Button asChild className="bg-brand-green hover:bg-brand-green-dark text-white">
            <Link href="/cursos">Explorar cursos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {enrollments.map(e => (
            <Card key={e.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-muted relative overflow-hidden">
                {e.course_cover
                  ? <img src={e.course_cover} alt={e.course_name ?? ''} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><FaBookOpen className="h-10 w-10 text-muted-foreground/30" /></div>
                }
                {e.state === 'completed' && (
                  <div className="absolute inset-0 bg-brand-green/80 flex items-center justify-center">
                    <FaCheckCircle className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
              <CardContent className="flex flex-col flex-1 gap-3 p-4">
                {e.store_name && <p className="text-xs text-brand-secondary font-medium">{e.store_name}</p>}
                <h3 className="font-semibold text-sm line-clamp-2">{e.course_name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {e.duration_hours && (
                    <span className="flex items-center gap-1"><FaClock className="h-3 w-3" />{durationLabel(Number(e.duration_hours))}</span>
                  )}
                  {e.total_lessons && <span>{e.total_lessons} lecciones</span>}
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium">{Number(e.progress_pct ?? 0).toFixed(0)}%</span>
                  </div>
                  <Progress value={Number(e.progress_pct ?? 0)} className="h-1.5" />
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <Badge variant={STATE_COLORS[e.state ?? 'active'] as 'secondary' | 'default' | 'destructive' | 'outline'} className="text-xs">
                    {STATE_LABELS[e.state ?? 'active']}
                  </Badge>
                  <Button asChild size="sm" className="gap-1 bg-primary">
                    <Link href={`/dashboard/comprador/cursos/${e.course_slug}`}>
                      <FaPlay className="h-3 w-3" />
                      {e.state === 'completed' ? 'Repasar' : 'Continuar'}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
