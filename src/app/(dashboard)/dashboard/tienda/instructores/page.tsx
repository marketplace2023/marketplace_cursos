import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaChalkboardTeacher, FaStar, FaUsers, FaBookOpen } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_store, marketplace_instructor, res_users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default async function TiendaInstructoresPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [store] = await db.select({ id: marketplace_store.id })
    .from(marketplace_store).where(eq(marketplace_store.owner_id, Number(session.sub))).limit(1)
  if (!store) redirect('/dashboard/tienda/perfil?setup=1')

  const instructors = await db
    .select({
      id: marketplace_instructor.id,
      headline: marketplace_instructor.headline,
      rating_avg: marketplace_instructor.rating_avg,
      rating_count: marketplace_instructor.rating_count,
      total_courses: marketplace_instructor.total_courses,
      total_students: marketplace_instructor.total_students,
      active: marketplace_instructor.active,
      name: res_users.name,
      email: res_users.email,
      avatar_url: res_users.avatar_url,
    })
    .from(marketplace_instructor)
    .innerJoin(res_users, eq(marketplace_instructor.user_id, res_users.id))
    .where(eq(marketplace_instructor.store_id, store.id))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Instructores</h1>
        <p className="text-muted-foreground mt-0.5">{instructors.length} instructor{instructors.length !== 1 ? 'es' : ''}</p>
      </div>

      {instructors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaChalkboardTeacher className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin instructores</h3>
          <p className="text-muted-foreground mb-4">Los instructores asignados a tu tienda aparecerán aquí</p>
          <Link href="/dashboard/tienda/usuarios" className="text-primary text-sm hover:underline">Gestionar equipo →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {instructors.map(inst => {
            const initials = inst.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'
            return (
              <Card key={inst.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={inst.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-brand-purple/10 text-brand-purple">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{inst.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{inst.headline ?? inst.email}</p>
                    </div>
                    <Badge className={`text-xs border-0 shrink-0 ${inst.active ? 'bg-brand-green/10 text-brand-green' : 'bg-muted text-muted-foreground'}`}>
                      {inst.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="font-bold text-primary">{inst.total_courses ?? 0}</p>
                      <p className="text-muted-foreground">Cursos</p>
                    </div>
                    <div>
                      <p className="font-bold text-brand-green">{inst.total_students ?? 0}</p>
                      <p className="text-muted-foreground">Estudiantes</p>
                    </div>
                    <div>
                      <p className="font-bold text-brand-orange">{Number(inst.rating_avg ?? 0).toFixed(1)}</p>
                      <p className="text-muted-foreground">Rating</p>
                    </div>
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
