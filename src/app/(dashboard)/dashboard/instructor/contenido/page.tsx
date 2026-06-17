import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaBookOpen, FaEdit, FaVideo } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { product_template, slide_channel, slide_slide } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default async function InstructorContenidoPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const courses = await db
    .select({ id: product_template.id, name: product_template.name, state: product_template.state })
    .from(product_template)
    .where(eq(product_template.instructor_id, Number(session.sub)))

  const courseWithModules = await Promise.all(
    courses.map(async c => {
      const modules = await db.select().from(slide_channel).where(eq(slide_channel.course_id, c.id)).orderBy(slide_channel.sort_order)
      const modulesWithLessons = await Promise.all(
        modules.map(async m => {
          const slides = await db.select().from(slide_slide).where(eq(slide_slide.channel_id, m.id)).orderBy(slide_slide.sort_order)
          return { ...m, slides }
        })
      )
      return { ...c, modules: modulesWithLessons }
    })
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Contenido</h1>
        <p className="text-muted-foreground mt-0.5">Gestiona los módulos y lecciones de tus cursos</p>
      </div>

      {courseWithModules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaBookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin cursos</h3>
          <p className="text-muted-foreground">No tienes cursos asignados para gestionar</p>
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={courseWithModules.map(c => String(c.id))}>
          {courseWithModules.map(course => (
            <AccordionItem key={course.id} value={String(course.id)}>
              <Card className="mb-4 overflow-hidden">
                <AccordionTrigger className="px-5 py-4 hover:no-underline">
                  <div className="flex items-center gap-3 text-left w-full">
                    <span className="font-semibold flex-1">{course.name}</span>
                    <Badge variant={course.state === 'published' ? 'default' : 'secondary'} className="text-xs mr-2">{course.state}</Badge>
                    <span className="text-xs text-muted-foreground mr-2">
                      {course.modules.length} módulos · {course.modules.reduce((a, m) => a + m.slides.length, 0)} lecciones
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-5 pb-4 flex flex-col gap-2">
                    {course.modules.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">Sin módulos. Ve a gestionar el contenido.</p>
                    ) : course.modules.map(mod => (
                      <div key={mod.id} className="border rounded-lg overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/30">
                          <span className="font-medium text-sm flex-1">{mod.name}</span>
                          <span className="text-xs text-muted-foreground">{mod.slides.length} lecciones</span>
                        </div>
                        {mod.slides.map(slide => (
                          <div key={slide.id} className="flex items-center gap-3 px-4 py-2 border-t text-sm">
                            <FaVideo className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="flex-1 truncate">{slide.name}</span>
                            {(slide.duration ?? 0) > 0 && (
                              <span className="text-xs text-muted-foreground">{Math.floor((slide.duration ?? 0) / 60)}:{String((slide.duration ?? 0) % 60).padStart(2, '0')}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                    <div className="flex justify-end mt-2">
                      <Button asChild variant="outline" size="sm" className="gap-1 text-xs">
                        <Link href={`/dashboard/tienda/cursos/${course.id}/contenido`}>
                          <FaEdit className="h-3 w-3" />Editar contenido
                        </Link>
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
