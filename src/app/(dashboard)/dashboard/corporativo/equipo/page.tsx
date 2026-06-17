import { redirect } from 'next/navigation'
import { FaUsers, FaBook } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_enrollment, product_template, res_users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'

export default async function CorporativoEquipoPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['b2b_user', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const myEnrollments = await db
    .select({
      id: marketplace_enrollment.id,
      state: marketplace_enrollment.state,
      progress_pct: marketplace_enrollment.progress_pct,
      enrolled_at: marketplace_enrollment.enrolled_at,
      completed_at: marketplace_enrollment.completed_at,
      course_name: product_template.name,
      course_slug: product_template.slug,
    })
    .from(marketplace_enrollment)
    .innerJoin(product_template, eq(marketplace_enrollment.course_id, product_template.id))
    .where(eq(marketplace_enrollment.user_id, Number(session.sub)))
    .orderBy(desc(marketplace_enrollment.enrolled_at))
    .limit(50)

  const [user] = await db.select({ name: res_users.name, email: res_users.email }).from(res_users).where(eq(res_users.id, Number(session.sub))).limit(1)
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Mi formación</h1>
        <p className="text-muted-foreground mt-0.5">Progreso de tus cursos corporativos</p>
      </div>

      <Card>
        <CardContent className="p-5 flex items-center gap-4">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarFallback className="text-lg bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{myEnrollments.length} curso{myEnrollments.length !== 1 ? 's' : ''} · {myEnrollments.filter(e => e.state === 'completed').length} completados</p>
          </div>
        </CardContent>
      </Card>

      {myEnrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaBook className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin cursos asignados. Contacta a tu administrador.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {myEnrollments.map(e => (
            <Card key={e.id}>
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-sm">{e.course_name}</p>
                  <Badge variant={e.state === 'completed' ? 'default' : 'secondary'} className="text-xs shrink-0">
                    {e.state === 'completed' ? '✓ Completado' : 'En progreso'}
                  </Badge>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium">{Number(e.progress_pct ?? 0).toFixed(0)}%</span>
                  </div>
                  <Progress value={Number(e.progress_pct ?? 0)} className="h-1.5" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Inscrito: {formatDate(e.enrolled_at)}
                  {e.completed_at && ` · Completado: ${formatDate(e.completed_at)}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
