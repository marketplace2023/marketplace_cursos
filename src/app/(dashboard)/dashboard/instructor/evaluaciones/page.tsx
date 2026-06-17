import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaClipboardList, FaCheckCircle, FaUsers } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { product_template, marketplace_enrollment } from '@/lib/db/schema'
import { eq, count, and } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default async function InstructorEvaluacionesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const courses = await db
    .select({
      id: product_template.id, name: product_template.name,
      slug: product_template.slug, has_certificate: product_template.has_certificate,
      total_students: product_template.total_students,
    })
    .from(product_template)
    .where(and(eq(product_template.instructor_id, Number(session.sub)), eq(product_template.has_certificate, true)))

  const coursesWithStats = await Promise.all(
    courses.map(async c => {
      const [enrolled] = await db.select({ c: count() }).from(marketplace_enrollment).where(eq(marketplace_enrollment.course_id, c.id))
      const [completed] = await db.select({ c: count() }).from(marketplace_enrollment)
        .where(and(eq(marketplace_enrollment.course_id, c.id), eq(marketplace_enrollment.state, 'completed')))
      return { ...c, enrolled: enrolled.c, completed: completed.c }
    })
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Evaluaciones</h1>
        <p className="text-muted-foreground mt-0.5">Cursos con certificado y sus estadísticas de finalización</p>
      </div>

      {coursesWithStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaClipboardList className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin evaluaciones</h3>
          <p className="text-muted-foreground">Habilita el certificado en tus cursos para ver sus evaluaciones aquí</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {coursesWithStats.map(c => {
            const completionPct = c.enrolled > 0 ? (c.completed / c.enrolled) * 100 : 0
            return (
              <Card key={c.id}>
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/cursos/${c.slug}`} className="font-semibold text-sm hover:text-primary transition-colors">
                      {c.name}
                    </Link>
                    <FaCheckCircle className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div>
                      <p className="font-bold text-lg">{c.enrolled}</p>
                      <p className="text-muted-foreground">Inscritos</p>
                    </div>
                    <div>
                      <p className="font-bold text-lg text-brand-green">{c.completed}</p>
                      <p className="text-muted-foreground">Completados</p>
                    </div>
                    <div>
                      <p className="font-bold text-lg text-brand-orange">{completionPct.toFixed(0)}%</p>
                      <p className="text-muted-foreground">Tasa de éxito</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Tasa de finalización</span>
                      <span className="font-medium">{completionPct.toFixed(0)}%</span>
                    </div>
                    <Progress value={completionPct} className="h-2" />
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
