import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaGraduationCap } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_fur_p, product_template } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export default async function AdminFurPPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin', 'compliance'].includes(session.role)) redirect('/dashboard')

  const furps = await db
    .select({
      id: marketplace_fur_p.id, fur_code: marketplace_fur_p.fur_code,
      accreditation_type: marketplace_fur_p.accreditation_type,
      accreditation_body: marketplace_fur_p.accreditation_body,
      recognition: marketplace_fur_p.recognition, published_at: marketplace_fur_p.published_at,
      created_at: marketplace_fur_p.created_at,
      course_name: product_template.name, course_slug: product_template.slug,
      course_state: product_template.state,
    })
    .from(marketplace_fur_p)
    .innerJoin(product_template, eq(marketplace_fur_p.course_id, product_template.id))
    .orderBy(desc(marketplace_fur_p.created_at))
    .limit(100)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">FUR-P — Fichas de curso</h1>
        <p className="text-muted-foreground mt-0.5">{furps.length} curso{furps.length !== 1 ? 's' : ''} con ficha FUR-P</p>
      </div>

      {furps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaGraduationCap className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin fichas FUR-P registradas</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {furps.map(f => (
            <Card key={f.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-sm truncate">{f.course_name}</p>
                    <Badge variant={f.course_state === 'published' ? 'default' : 'secondary'} className="text-xs">{f.course_state}</Badge>
                    {f.fur_code && <span className="font-mono text-xs text-muted-foreground">{f.fur_code}</span>}
                  </div>
                  {f.accreditation_type && (
                    <p className="text-xs text-muted-foreground">{f.accreditation_type}{f.accreditation_body ? ` · ${f.accreditation_body}` : ''}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Registrado {formatDate(f.created_at)}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="text-xs h-7 shrink-0">
                  <Link href={`/cursos/${f.course_slug}`}>Ver</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
