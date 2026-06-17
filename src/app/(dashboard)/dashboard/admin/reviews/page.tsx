import { redirect } from 'next/navigation'
import { FaStar, FaCheck, FaTimes, FaEyeSlash } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_review, product_template, res_users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  published: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  pending: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  hidden: 'bg-muted text-muted-foreground',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
}
const STATE_LABELS: Record<string, string> = {
  published: 'Publicada', pending: 'Pendiente', hidden: 'Oculta', rejected: 'Rechazada',
}

export default async function AdminReviewsPage(props: { searchParams: Promise<{ state?: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const sp = await props.searchParams
  const filterState = sp.state

  const reviews = await db
    .select({
      id: marketplace_review.id, rating: marketplace_review.rating,
      comment: marketplace_review.comment, state: marketplace_review.state,
      created_at: marketplace_review.created_at,
      course_name: product_template.name, course_slug: product_template.slug,
      student_name: res_users.name,
    })
    .from(marketplace_review)
    .innerJoin(product_template, eq(marketplace_review.course_id, product_template.id))
    .innerJoin(res_users, eq(marketplace_review.user_id, res_users.id))
    .orderBy(desc(marketplace_review.created_at))
    .limit(100)

  const filtered = filterState ? reviews.filter(r => r.state === filterState) : reviews
  const STATES = ['pending', 'published', 'hidden', 'rejected']

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Reseñas</h1>
        <p className="text-muted-foreground mt-0.5">{filtered.length} reseña{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href="/dashboard/admin/reviews" className={`h-7 px-3 text-xs rounded-md border flex items-center font-medium transition-colors ${!filterState ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background hover:bg-muted'}`}>Todas</a>
        {STATES.map(s => (
          <a key={s} href={`/dashboard/admin/reviews?state=${s}`} className={`h-7 px-3 text-xs rounded-md border flex items-center font-medium transition-colors ${filterState === s ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background hover:bg-muted'}`}>{STATE_LABELS[s]}</a>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map(r => {
          const initials = r.student_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'
          return (
            <Card key={r.id}>
              <CardContent className="p-4 flex gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-semibold text-sm">{r.student_name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-48">{r.course_name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge className={`text-xs border ${STATE_COLORS[r.state] ?? ''}`}>{STATE_LABELS[r.state] ?? r.state}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar key={i} className={`h-3 w-3 ${i < r.rating ? 'text-brand-orange' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                  {r.comment && <p className="text-xs text-muted-foreground line-clamp-2">{r.comment}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(r.created_at)}</p>
                </div>
                {r.state === 'pending' && (
                  <div className="flex flex-col gap-1 shrink-0">
                    <form action={`/api/v1/admin/reviews/${r.id}/publish`} method="POST">
                      <button type="submit" className="h-7 w-7 rounded-md bg-brand-green/10 text-brand-green hover:bg-brand-green/20 flex items-center justify-center" title="Aprobar">
                        <FaCheck className="h-3 w-3" />
                      </button>
                    </form>
                    <form action={`/api/v1/admin/reviews/${r.id}/reject`} method="POST">
                      <button type="submit" className="h-7 w-7 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center justify-center" title="Rechazar">
                        <FaTimes className="h-3 w-3" />
                      </button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
