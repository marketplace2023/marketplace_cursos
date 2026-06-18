import { redirect } from 'next/navigation'
import { FaStar, FaComment } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_review, product_template, res_users, marketplace_instructor } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'

export default async function InstructorReviewsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [instructor] = await db.select({ rating_avg: marketplace_instructor.rating_avg, rating_count: marketplace_instructor.rating_count })
    .from(marketplace_instructor).where(eq(marketplace_instructor.user_id, Number(session.sub))).limit(1)

  const reviews = await db
    .select({
      id: marketplace_review.id, rating: marketplace_review.rating,
      comment: marketplace_review.comment, state: marketplace_review.state,
      created_at: marketplace_review.created_at,
      course_name: product_template.name,
      student_name: res_users.name,
    })
    .from(marketplace_review)
    .innerJoin(product_template, eq(marketplace_review.course_id, product_template.id))
    .innerJoin(res_users, eq(marketplace_review.user_id, res_users.id))
    .where(eq(product_template.instructor_id, Number(session.sub)))
    .orderBy(desc(marketplace_review.created_at))
    .limit(100)

  const ratingAvg = Number(instructor?.rating_avg ?? 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Mis Reseñas</h1>
        <p className="text-muted-foreground mt-0.5">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''} · Promedio: {ratingAvg.toFixed(1)}/5</p>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaComment className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin reseñas</h3>
          <p className="text-muted-foreground">Las reseñas de tus cursos aparecerán aquí</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map(r => {
            const initials = r.student_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'
            return (
              <div key={r.id} className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0 ring-2 ring-brand-purple/20">
                    <AvatarFallback className="text-xs font-bold bg-linear-to-br from-brand-purple/20 to-primary/20 text-brand-purple">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-semibold text-sm">{r.student_name}</p>
                        <p className="text-xs text-muted-foreground">{r.course_name}</p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FaStar key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'text-brand-orange' : 'text-muted-foreground/20'}`} />
                        ))}
                        <span className="text-xs font-bold text-brand-orange ml-1">{r.rating}.0</span>
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{r.comment}</p>}
                    <p className="text-xs text-muted-foreground mt-2">{formatDate(r.created_at)}</p>
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
