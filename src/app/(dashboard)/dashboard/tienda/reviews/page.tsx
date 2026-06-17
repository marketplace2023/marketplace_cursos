'use client'

import { useState, useEffect } from 'react'
import { FaStar, FaComment, FaReply, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type Review = {
  id: number
  rating: number
  comment: string | null
  state: string
  verified_purchase: boolean
  created_at: string
  student_name: string
  student_avatar: string | null
  course_name: string
  reply?: { id: number; comment: string } | null
}

type StoreStats = {
  rating_avg: string
  rating_count: number
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ReviewCard({ review, onReplyUpdated }: { review: Review; onReplyUpdated: (id: number, comment: string | null) => void }) {
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState(review.reply?.comment ?? '')
  const [saving, setSaving] = useState(false)
  const initials = review.student_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'

  async function submitReply() {
    if (!replyText.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/v1/reviews/${review.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: replyText }),
      })
      const data = await res.json()
      if (data.success) {
        onReplyUpdated(review.id, replyText)
        setReplying(false)
      }
    } finally {
      setSaving(false)
    }
  }

  async function deleteReply() {
    setSaving(true)
    try {
      const res = await fetch(`/api/v1/reviews/${review.id}/reply`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        onReplyUpdated(review.id, null)
        setReplyText('')
        setReplying(false)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="text-xs bg-brand-purple/10 text-brand-purple">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{review.student_name}</p>
              <p className="text-xs text-muted-foreground">{review.course_name}</p>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar key={i} className={`h-3 w-3 ${i < review.rating ? 'text-brand-orange' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge className={review.state === 'published' ? 'bg-brand-green/10 text-brand-green border-0 text-xs' : 'bg-muted text-muted-foreground border-0 text-xs'}>
              {review.state === 'published' ? 'Publicada' : review.state}
            </Badge>
            {review.verified_purchase && <Badge variant="secondary" className="text-xs">Compra verificada</Badge>}
          </div>
        </div>

        {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}

        {/* Existing reply */}
        {review.reply && !replying && (
          <div className="bg-muted/40 rounded-lg p-3 border-l-2 border-primary flex flex-col gap-2">
            <p className="text-xs font-semibold text-primary">Respuesta de la tienda</p>
            <p className="text-sm">{review.reply.comment}</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-xs"
                onClick={() => { setReplyText(review.reply!.comment); setReplying(true) }}>
                <FaReply className="h-3 w-3 mr-1" /> Editar respuesta
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={deleteReply} disabled={saving}>
                <FaTimes className="h-3 w-3 mr-1" /> Eliminar
              </Button>
            </div>
          </div>
        )}

        {/* Reply form */}
        {replying && (
          <div className="flex flex-col gap-2 bg-muted/20 rounded-lg p-3">
            <Textarea
              placeholder="Escribe tu respuesta al estudiante…"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              className="min-h-20 resize-none text-sm"
              maxLength={2000}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setReplying(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button size="sm" onClick={submitReply} disabled={saving || !replyText.trim()}>
                {saving ? <FaSpinner className="h-3 w-3 animate-spin mr-1" /> : <FaCheck className="h-3 w-3 mr-1" />}
                Publicar respuesta
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
          {!review.reply && !replying && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setReplyText(''); setReplying(true) }}>
              <FaReply className="h-3 w-3 mr-1" /> Responder
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function TiendaReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<StoreStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/reviews?context=store').then(r => r.json()),
      fetch('/api/v1/stores/me').then(r => r.json()),
    ]).then(([rv, st]) => {
      if (rv.success) setReviews(rv.data ?? [])
      if (st.success) setStats({ rating_avg: st.data.rating_avg, rating_count: st.data.rating_count })
    }).finally(() => setLoading(false))
  }, [])

  function handleReplyUpdated(reviewId: number, comment: string | null) {
    setReviews(rs => rs.map(r => r.id === reviewId
      ? { ...r, reply: comment ? { id: r.reply?.id ?? 0, comment } : null }
      : r
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const ratingAvg = Number(stats?.rating_avg ?? 0)
  const dist = [5, 4, 3, 2, 1].map(r => ({ rating: r, count: reviews.filter(rv => rv.rating === r).length }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Reseñas</h1>
        <p className="text-muted-foreground mt-0.5">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</p>
      </div>

      {reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-1">
            <CardContent className="flex flex-col items-center p-6 gap-3">
              <p className="text-5xl font-bold text-brand-orange">{ratingAvg.toFixed(1)}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar key={i} className={`h-4 w-4 ${i < Math.round(ratingAvg) ? 'text-brand-orange' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{stats?.rating_count ?? 0} calificaciones</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardContent className="p-6 flex flex-col gap-2">
              {dist.map(d => (
                <div key={d.rating} className="flex items-center gap-3">
                  <span className="text-sm w-4 text-muted-foreground">{d.rating}</span>
                  <FaStar className="h-3 w-3 text-brand-orange shrink-0" />
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-brand-orange rounded-full transition-all"
                      style={{ width: reviews.length > 0 ? `${(d.count / reviews.length) * 100}%` : '0%' }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-6 text-right">{d.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaComment className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin reseñas aún</h3>
          <p className="text-muted-foreground">Las reseñas de tus estudiantes aparecerán aquí</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map(r => (
            <ReviewCard key={r.id} review={r} onReplyUpdated={handleReplyUpdated} />
          ))}
        </div>
      )}
    </div>
  )
}
