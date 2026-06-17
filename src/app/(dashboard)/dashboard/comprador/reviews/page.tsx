import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaStar, FaComment, FaEdit } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_review, product_template } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

const STATE_BADGE: Record<string, { label: string; class: string }> = {
  published: { label: 'Publicada', class: 'bg-brand-green/10 text-brand-green' },
  pending: { label: 'En revisión', class: 'bg-brand-orange/10 text-brand-orange' },
  hidden: { label: 'Oculta', class: 'bg-muted text-muted-foreground' },
  rejected: { label: 'Rechazada', class: 'bg-destructive/10 text-destructive' },
}

export default async function MisReviewsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const reviews = await db
    .select({
      id: marketplace_review.id,
      rating: marketplace_review.rating,
      comment: marketplace_review.comment,
      state: marketplace_review.state,
      verified_purchase: marketplace_review.verified_purchase,
      created_at: marketplace_review.created_at,
      course_name: product_template.name,
      course_slug: product_template.slug,
    })
    .from(marketplace_review)
    .leftJoin(product_template, eq(marketplace_review.course_id, product_template.id))
    .where(eq(marketplace_review.user_id, Number(session.sub)))
    .orderBy(desc(marketplace_review.created_at))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Mis Reseñas</h1>
        <p className="text-muted-foreground mt-0.5">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''} publicada{reviews.length !== 1 ? 's' : ''}</p>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaComment className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin reseñas aún</h3>
          <p className="text-muted-foreground mb-4">Comparte tu experiencia en los cursos que hayas completado</p>
          <Button asChild className="bg-brand-green hover:bg-brand-green-dark text-white">
            <Link href="/dashboard/comprador/cursos">Ver mis cursos</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map(r => {
            const badge = STATE_BADGE[r.state] ?? STATE_BADGE.pending
            return (
              <Card key={r.id}>
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link href={`/cursos/${r.course_slug}`} className="font-semibold text-sm hover:text-primary transition-colors">
                        {r.course_name}
                      </Link>
                      <div className="flex items-center gap-1.5 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FaStar key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'text-brand-orange' : 'text-muted-foreground/30'}`} />
                        ))}
                        <span className="text-xs font-bold text-brand-orange ml-1">{r.rating}/5</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge className={`text-xs border-0 ${badge.class}`}>{badge.label}</Badge>
                      {r.verified_purchase && (
                        <Badge variant="secondary" className="text-xs">Compra verificada</Badge>
                      )}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{r.comment}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                    <Button asChild size="sm" variant="ghost" className="gap-1 text-xs">
                      <Link href={`/cursos/${r.course_slug}#review-${r.id}`}>
                        <FaEdit className="h-3 w-3" /> Editar
                      </Link>
                    </Button>
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
