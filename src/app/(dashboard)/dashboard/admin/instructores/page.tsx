import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaChalkboardTeacher } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_instructor, res_users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'

export default async function AdminInstructoresPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const instructors = await db
    .select({
      id: marketplace_instructor.id, headline: marketplace_instructor.headline,
      rating_avg: marketplace_instructor.rating_avg, rating_count: marketplace_instructor.rating_count,
      total_courses: marketplace_instructor.total_courses, total_students: marketplace_instructor.total_students,
      active: marketplace_instructor.active, created_at: marketplace_instructor.created_at,
      user_id: marketplace_instructor.user_id,
      user_name: res_users.name, user_email: res_users.email, user_state: res_users.state,
    })
    .from(marketplace_instructor)
    .innerJoin(res_users, eq(marketplace_instructor.user_id, res_users.id))
    .orderBy(desc(marketplace_instructor.total_students))
    .limit(100)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Instructores</h1>
        <p className="text-muted-foreground mt-0.5">{instructors.length} instructor{instructors.length !== 1 ? 'es' : ''} registrados</p>
      </div>

      {instructors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaChalkboardTeacher className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin instructores aún</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {instructors.map(inst => {
            const initials = inst.user_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'
            return (
              <Card key={inst.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="text-sm bg-brand-purple/10 text-brand-purple">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm">{inst.user_name}</p>
                      <Badge variant={inst.active ? 'default' : 'secondary'} className="text-xs">{inst.active ? 'Activo' : 'Inactivo'}</Badge>
                    </div>
                    {inst.headline && <p className="text-xs text-muted-foreground truncate">{inst.headline}</p>}
                    <p className="text-xs text-muted-foreground">{inst.user_email}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground shrink-0 space-y-0.5">
                    <p>{inst.total_courses} cursos</p>
                    <p>{inst.total_students} estudiantes</p>
                    <p className="text-brand-orange">{Number(inst.rating_avg ?? 0).toFixed(1)} ★</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="text-xs h-7 shrink-0">
                    <Link href={`/dashboard/admin/usuarios/${inst.user_id}`}>Ver</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
