'use client'

import { useState, useEffect } from 'react'
import {
  FaQuestion, FaCheckCircle, FaRegClock, FaReply, FaChevronDown,
  FaChevronUp, FaSpinner, FaTimes, FaSearch,
} from 'react-icons/fa'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

/* ─── Types ─── */
type Reply = {
  id: number; body: string; is_instructor_reply: boolean; is_accepted: boolean
  upvotes: number; created_at: string; user_id: number
  user_name: string | null; user_avatar: string | null
}
type Question = {
  id: number; title: string; body: string | null
  course_id: number; course_name: string | null
  lesson_id: number | null; is_answered: boolean
  upvotes: number; created_at: string; user_id: number
  user_name: string | null; user_avatar: string | null
  reply_count: number
  replies?: Reply[]
}

function timeAgo(dateStr: string) {
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (d < 60) return 'hace un momento'
  if (d < 3600) return `hace ${Math.floor(d / 60)} min`
  if (d < 86400) return `hace ${Math.floor(d / 3600)} h`
  return `hace ${Math.floor(d / 86400)} días`
}

function QuestionRow({ question, onUpdated }: { question: Question; onUpdated: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [replies, setReplies] = useState<Reply[]>(question.replies ?? [])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function loadReplies() {
    if (replies.length > 0 && expanded) { setExpanded(false); return }
    if (!expanded) {
      setLoadingReplies(true)
      try {
        const res = await fetch(`/api/v1/questions/${question.id}`)
        const data = await res.json()
        if (data.success) setReplies(data.data.replies ?? [])
      } finally {
        setLoadingReplies(false)
      }
    }
    setExpanded(p => !p)
  }

  async function submitReply() {
    if (!replyBody.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/v1/questions/${question.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: replyBody }),
      })
      const data = await res.json()
      if (data.success) {
        setReplies(prev => [...prev, data.data])
        setReplyBody('')
        onUpdated()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const initials = (question.user_name ?? '?')[0].toUpperCase()

  return (
    <Card className={`transition-colors ${question.is_answered ? 'border-brand-green/20' : 'border-brand-orange/20'}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 shrink-0 mt-0.5">
            <AvatarImage src={question.user_avatar ?? undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm leading-snug">{question.title}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{question.user_name}</span>
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(question.created_at)}</span>
                  {question.course_name && (
                    <>
                      <span className="text-muted-foreground/40 text-xs">·</span>
                      <span className="text-xs text-primary truncate max-w-40">{question.course_name}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {question.is_answered ? (
                  <Badge className="bg-brand-green/10 text-brand-green border-0 text-xs gap-1">
                    <FaCheckCircle className="h-3 w-3" />Respondida
                  </Badge>
                ) : (
                  <Badge className="bg-brand-orange/10 text-brand-orange border-0 text-xs gap-1">
                    <FaRegClock className="h-3 w-3" />Pendiente
                  </Badge>
                )}
              </div>
            </div>

            {question.body && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{question.body}</p>
            )}

            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={loadReplies}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {loadingReplies ? <FaSpinner className="h-3 w-3 animate-spin" /> : <FaReply className="h-3 w-3" />}
                {question.reply_count > 0 ? `${question.reply_count} respuesta${question.reply_count !== 1 ? 's' : ''}` : 'Responder'}
                {replies.length > 0 ? (expanded ? <FaChevronUp className="h-3 w-3" /> : <FaChevronDown className="h-3 w-3" />) : null}
              </button>
            </div>

            {/* Replies + form */}
            {expanded && (
              <div className="mt-4 flex flex-col gap-3 pl-4 border-l-2 border-muted">
                {replies.map(r => (
                  <div key={r.id} className="flex gap-3">
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{r.user_name ?? 'Usuario'}</span>
                        {r.is_instructor_reply && (
                          <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-1.5 py-0">Instructor</Badge>
                        )}
                        {r.is_accepted && (
                          <Badge className="bg-brand-green/10 text-brand-green border-0 text-[10px] px-1.5 py-0">
                            <FaCheckCircle className="h-2.5 w-2.5 mr-1" />Aceptada
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">{timeAgo(r.created_at)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.body}</p>
                    </div>
                  </div>
                ))}

                {/* Reply form */}
                <Separator className="my-1" />
                <div className="flex flex-col gap-2">
                  <Textarea
                    placeholder="Escribe tu respuesta como instructor…"
                    value={replyBody}
                    onChange={e => setReplyBody(e.target.value)}
                    rows={3}
                    className="text-sm resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setReplyBody('')}>Cancelar</Button>
                    <Button
                      size="sm"
                      onClick={submitReply}
                      disabled={submitting || !replyBody.trim()}
                      className="bg-primary text-primary-foreground gap-1.5"
                    >
                      {submitting ? <FaSpinner className="h-3 w-3 animate-spin" /> : <FaReply className="h-3 w-3" />}
                      Publicar respuesta
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Main page ─── */
export default function InstructorPreguntasPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  async function fetchQuestions(p = 1) {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' })
      if (q) params.set('q', q)
      const res = await fetch(`/api/v1/questions?${params}`)
      const data = await res.json()
      if (data.success) {
        setQuestions(prev => p === 1 ? data.data : [...prev, ...data.data])
        setTotal(data.meta?.total ?? 0)
        setPage(p)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchQuestions(1) }, [filter])

  const filtered = filter === 'pending'
    ? questions.filter(q => !q.is_answered)
    : filter === 'answered'
      ? questions.filter(q => q.is_answered)
      : questions

  const pending = questions.filter(q => !q.is_answered).length
  const answered = questions.filter(q => q.is_answered).length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold">Preguntas</h1>
        <p className="text-muted-foreground mt-0.5">Preguntas de tus estudiantes — respóndelas para mejorar tus valoraciones</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: total, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Pendientes', value: pending, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
          { label: 'Respondidas', value: answered, color: 'text-brand-green', bg: 'bg-brand-green/10' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className={`p-4 text-center rounded-xl ${s.bg}`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pregunta…"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchQuestions(1)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'answered'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Respondidas'}
            </Button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading && questions.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaQuestion className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {filter === 'pending' ? 'Sin preguntas pendientes' : filter === 'answered' ? 'Aún no has respondido preguntas' : 'Sin preguntas aún'}
          </h3>
          <p className="text-muted-foreground">
            {filter === 'all' ? 'Las preguntas de tus estudiantes aparecerán aquí' : 'Prueba cambiando el filtro'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(question => (
            <QuestionRow
              key={question.id}
              question={question}
              onUpdated={() => fetchQuestions(1)}
            />
          ))}

          {questions.length < total && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={() => fetchQuestions(page + 1)} disabled={loading}>
                {loading ? <FaSpinner className="h-4 w-4 animate-spin mr-2" /> : null}
                Cargar más
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
