import { redirect } from 'next/navigation'
import { FaCalendarAlt, FaVideo, FaUsers } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { product_template, marketplace_enrollment } from '@/lib/db/schema'
import { eq, and, gte, count } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export default async function InstructorCalendarioPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const courses = await db
    .select({
      id: product_template.id, name: product_template.name,
      state: product_template.state, modality: product_template.modality,
      created_at: product_template.created_at, published_at: product_template.published_at,
    })
    .from(product_template)
    .where(eq(product_template.instructor_id, Number(session.sub)))

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const recentEnrollments = await Promise.all(
    courses.map(async c => {
      const [row] = await db.select({ c: count() }).from(marketplace_enrollment)
        .where(and(eq(marketplace_enrollment.course_id, c.id), gte(marketplace_enrollment.enrolled_at, startOfMonth)))
      return { courseId: c.id, newThisMonth: row.c }
    })
  )
  const enrollMap = Object.fromEntries(recentEnrollments.map(r => [r.courseId, r.newThisMonth]))

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const currentMonth = months[now.getMonth()]
  const currentYear = now.getFullYear()

  const published = courses.filter(c => c.state === 'published')
  const drafts = courses.filter(c => c.state === 'draft')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Calendario</h1>
        <p className="text-muted-foreground mt-0.5">{currentMonth} {currentYear} — actividad de tus cursos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{published.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Cursos activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-brand-orange">{drafts.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">En borrador</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-brand-green">
              {recentEnrollments.reduce((a, r) => a + r.newThisMonth, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Inscritos este mes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Mis cursos activos</CardTitle></CardHeader>
        <CardContent>
          {published.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FaCalendarAlt className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No tienes cursos publicados aún</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {published.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FaVideo className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Publicado {c.published_at ? formatDate(c.published_at) : formatDate(c.created_at)}
                      {c.modality && ` · ${c.modality}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-brand-green">+{enrollMap[c.id] ?? 0}</p>
                    <p className="text-xs text-muted-foreground">este mes</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {drafts.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Borradores pendientes</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {drafts.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-dashed hover:bg-muted/30 transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FaVideo className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">Creado {formatDate(c.created_at)}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">Borrador</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
