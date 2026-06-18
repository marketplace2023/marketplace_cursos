import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaBookOpen, FaPlay, FaCheckCircle, FaClock } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_enrollment, product_template, marketplace_store } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {enrollments.map(e => {
            const pct = Number(e.progress_pct ?? 0)
            const isCompleted = e.state === 'completed'
            return (
            <div key={e.id} className="flex flex-col rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-video bg-muted relative overflow-hidden">
                {e.course_cover
                  ? <img src={e.course_cover} alt={e.course_name ?? ''} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-brand-purple/10">
                      <FaBookOpen className="h-10 w-10 text-muted-foreground/20" />
                    </div>
                }
                {isCompleted && (
                  <div className="absolute inset-0 bg-brand-green/85 flex items-center justify-center">
                    <FaCheckCircle className="h-12 w-12 text-white drop-shadow-lg" />
                  </div>
                )}
                {/* Progress bar overlay at bottom */}
                {!isCompleted && (
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/30">
                    <div className="h-full bg-brand-green transition-all" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-1 gap-3 p-4">
                {e.store_name && <p className="text-xs text-brand-secondary font-semibold">{e.store_name}</p>}
                <h3 className="font-semibold text-sm line-clamp-2 leading-snug">{e.course_name}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {e.duration_hours && (
                    <span className="flex items-center gap-1"><FaClock className="h-3 w-3" />{durationLabel(Number(e.duration_hours))}</span>
                  )}
                  {e.total_lessons && <span>{e.total_lessons} lecciones</span>}
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className={`font-bold ${isCompleted ? 'text-brand-green' : pct >= 50 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={pct} className="h-2 rounded-full" />
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isCompleted ? 'bg-brand-green/10 text-brand-green' :
                    e.state === 'suspended' ? 'bg-destructive/10 text-destructive' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {STATE_LABELS[e.state ?? 'active']}
                  </span>
                  <Button asChild size="sm" className="gap-1.5 rounded-xl bg-primary hover:bg-primary/90">
                    <Link href={`/dashboard/comprador/cursos/${e.course_slug}`}>
                      <FaPlay className="h-3 w-3" />
                      {isCompleted ? 'Repasar' : 'Continuar'}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
