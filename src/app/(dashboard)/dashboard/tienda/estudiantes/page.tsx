import { redirect } from 'next/navigation'
import { FaUsers, FaCheckCircle, FaClock } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_store, marketplace_enrollment, product_template, res_users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/utils'

export default async function TiendaEstudiantesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [store] = await db.select({ id: marketplace_store.id })
    .from(marketplace_store).where(eq(marketplace_store.owner_id, Number(session.sub))).limit(1)
  if (!store) redirect('/dashboard/tienda/perfil?setup=1')

  const students = await db
    .select({
      id: marketplace_enrollment.id,
      state: marketplace_enrollment.state,
      progress_pct: marketplace_enrollment.progress_pct,
      enrolled_at: marketplace_enrollment.enrolled_at,
      completed_at: marketplace_enrollment.completed_at,
      student_name: res_users.name,
      student_email: res_users.email,
      student_avatar: res_users.avatar_url,
      course_name: product_template.name,
    })
    .from(marketplace_enrollment)
    .innerJoin(product_template, eq(marketplace_enrollment.course_id, product_template.id))
    .innerJoin(res_users, eq(marketplace_enrollment.user_id, res_users.id))
    .where(eq(product_template.store_id, store.id))
    .orderBy(desc(marketplace_enrollment.enrolled_at))
    .limit(100)

  const completed = students.filter(s => s.state === 'completed').length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Estudiantes</h1>
        <p className="text-muted-foreground mt-0.5">
          {students.length} inscripciones · {completed} completadas
        </p>
      </div>

      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaUsers className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin estudiantes aún</h3>
          <p className="text-muted-foreground">Cuando alguien se inscriba en un curso, aparecerá aquí</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {students.map(s => {
            const progress = Number(s.progress_pct ?? 0)
            const initials = s.student_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'
            return (
              <Card key={s.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-brand-green/10 text-brand-green text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{s.student_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.student_email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">📚 {s.course_name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {s.state === 'completed' ? (
                      <Badge className="bg-brand-green/10 text-brand-green border-0 gap-1 text-xs">
                        <FaCheckCircle className="h-3 w-3" />Completado
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="w-20 h-1.5" />
                        <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">{formatDate(s.enrolled_at)}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
