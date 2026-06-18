'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import {
  FaArrowLeft, FaPlay, FaCheckCircle, FaChevronDown, FaChevronRight,
  FaLock, FaFileAlt, FaVideo, FaVolumeUp, FaClipboardList,
  FaSpinner, FaTrophy, FaRedo, FaTimes, FaChevronLeft,
} from 'react-icons/fa'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'

/* ─── Types ─── */
interface Lesson {
  id: number; name: string; slide_type: string; duration: number
  content_url: string | null; is_preview: boolean; completed: boolean
}
interface Module { id: number; name: string; slides: Lesson[] }
interface CourseData {
  id: number; name: string; cover_url: string | null
  progress_pct: number; state: string; enrolled: boolean
  modules: Module[]
}

type QuizOption = { text: string }
type QuizQuestion = {
  id: number; question: string; question_type: string
  options: QuizOption[] | null; points: number
}
type QuizData = {
  id: number; title: string; pass_score: number; time_limit: number | null
  max_attempts: number; attempts_used: number; attempts_left: number
  best_score: number | null; passed: boolean
  questions: QuizQuestion[]
}
type QuizResult = {
  score: number; passed: boolean; pass_score: number
  attempts_left: number; show_results: boolean
  results: { question_id: number; correct: boolean; explanation?: string }[]
}

/* ─── Helpers ─── */
const SLIDE_ICONS: Record<string, React.ReactNode> = {
  video: <FaVideo className="h-3.5 w-3.5" />,
  text: <FaFileAlt className="h-3.5 w-3.5" />,
  audio: <FaVolumeUp className="h-3.5 w-3.5" />,
}

function durationStr(secs: number) {
  const m = Math.floor(secs / 60)
  return `${m}:${String(secs % 60).padStart(2, '0')}`
}

/* ─── Quiz Player ─── */
function QuizPlayer({ quizId, onClose }: { quizId: number; onClose: () => void }) {
  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    fetch(`/api/v1/quizzes/${quizId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setQuiz(d.data) })
      .finally(() => setLoading(false))
  }, [quizId])

  /* Timer */
  useEffect(() => {
    if (!started || !quiz?.time_limit) return
    setSecondsLeft(quiz.time_limit * 60)
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev === null || prev <= 1) { clearInterval(interval); handleSubmit(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started])

  function selectAnswer(questionId: number, answer: string, type: string) {
    setAnswers(prev => {
      if (type === 'multiple') {
        const current = (prev[questionId] as string[] | undefined) ?? []
        return {
          ...prev,
          [questionId]: current.includes(answer)
            ? current.filter(a => a !== answer)
            : [...current, answer],
        }
      }
      return { ...prev, [questionId]: answer }
    })
  }

  async function handleSubmit() {
    if (!quiz) return
    setSubmitting(true)
    try {
      const payload = quiz.questions.map(q => ({
        question_id: q.id,
        answer: answers[q.id] ?? '',
      }))
      const res = await fetch(`/api/v1/quizzes/${quizId}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: payload, time_spent: Math.floor((Date.now() - startTime) / 1000) }),
      })
      const data = await res.json()
      if (data.success) setResult(data.data)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <FaSpinner className="h-6 w-6 animate-spin text-primary" />
    </div>
  )

  if (!quiz) return (
    <div className="p-6 text-center text-muted-foreground">Quiz no encontrado.</div>
  )

  /* Already passed / no attempts */
  if (quiz.passed) return (
    <div className="p-6 flex flex-col items-center gap-4 text-center">
      <FaTrophy className="h-12 w-12 text-brand-orange" />
      <h2 className="text-xl font-bold">¡Quiz aprobado!</h2>
      <p className="text-muted-foreground">Mejor puntaje: <strong>{quiz.best_score}%</strong> · Aprobación: {quiz.pass_score}%</p>
      <Button onClick={onClose} variant="outline">Volver al curso</Button>
    </div>
  )

  if (quiz.attempts_left === 0) return (
    <div className="p-6 flex flex-col items-center gap-4 text-center">
      <FaTimes className="h-10 w-10 text-destructive" />
      <h2 className="text-xl font-bold">Sin intentos restantes</h2>
      <p className="text-muted-foreground">Mejor puntaje: {quiz.best_score ?? 0}% · Necesitabas {quiz.pass_score}%</p>
      <Button onClick={onClose} variant="outline">Volver al curso</Button>
    </div>
  )

  /* Results screen */
  if (result) return (
    <div className="p-6 flex flex-col gap-6 max-w-2xl mx-auto">
      <div className={`rounded-xl p-6 text-center ${result.passed ? 'bg-brand-green/10 border border-brand-green/20' : 'bg-destructive/10 border border-destructive/20'}`}>
        {result.passed
          ? <FaTrophy className="h-10 w-10 text-brand-orange mx-auto mb-3" />
          : <FaTimes className="h-10 w-10 text-destructive mx-auto mb-3" />
        }
        <h2 className="text-2xl font-bold">{result.passed ? '¡Aprobado!' : 'No aprobado'}</h2>
        <p className="text-5xl font-bold mt-3 mb-1">{result.score}<span className="text-xl font-normal">%</span></p>
        <p className="text-sm text-muted-foreground">Puntaje mínimo requerido: {result.pass_score}%</p>
        {result.attempts_left > 0 && !result.passed && (
          <p className="text-sm mt-2 text-muted-foreground">{result.attempts_left} intento{result.attempts_left !== 1 ? 's' : ''} restante{result.attempts_left !== 1 ? 's' : ''}</p>
        )}
      </div>

      {result.show_results && result.results.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold">Revisión de respuestas</h3>
          {quiz.questions.map((q, idx) => {
            const res = result.results.find(r => r.question_id === q.id)
            return (
              <div key={q.id} className={`rounded-lg border p-4 ${res?.correct ? 'border-brand-green/30 bg-brand-green/5' : 'border-destructive/30 bg-destructive/5'}`}>
                <div className="flex items-start gap-2">
                  {res?.correct
                    ? <FaCheckCircle className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                    : <FaTimes className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  }
                  <div className="flex-1">
                    <p className="text-sm font-medium">{idx + 1}. {q.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">Tu respuesta: {
                      Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).join(', ') : (answers[q.id] as string) || '(sin respuesta)'
                    }</p>
                    {res?.explanation && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{res.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex gap-3">
        {!result.passed && result.attempts_left > 0 && (
          <Button onClick={() => { setResult(null); setAnswers({}); setCurrentIdx(0); setStarted(false) }} variant="outline" className="gap-2">
            <FaRedo className="h-3 w-3" /> Reintentar
          </Button>
        )}
        <Button onClick={onClose}>Volver al curso</Button>
      </div>
    </div>
  )

  /* Intro screen */
  if (!started) return (
    <div className="p-6 flex flex-col gap-5 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FaClipboardList className="h-5 w-5 text-primary" /> {quiz.title}
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}><FaTimes className="h-4 w-4" /></Button>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border p-3">
          <p className="text-muted-foreground text-xs">Preguntas</p>
          <p className="font-bold text-lg">{quiz.questions.length}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-muted-foreground text-xs">Puntaje mínimo</p>
          <p className="font-bold text-lg">{quiz.pass_score}%</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-muted-foreground text-xs">Límite de tiempo</p>
          <p className="font-bold text-lg">{quiz.time_limit ? `${quiz.time_limit} min` : 'Sin límite'}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-muted-foreground text-xs">Intentos restantes</p>
          <p className="font-bold text-lg">{quiz.attempts_left}</p>
        </div>
      </div>
      {quiz.best_score !== null && (
        <p className="text-sm text-muted-foreground">Mejor puntaje anterior: <strong>{quiz.best_score}%</strong></p>
      )}
      <Button onClick={() => setStarted(true)} size="lg" className="w-full bg-brand-green hover:bg-brand-green-dark text-white">
        Iniciar quiz
      </Button>
    </div>
  )

  /* Question screen */
  const currentQ = quiz.questions[currentIdx]
  const isMultiple = currentQ.question_type === 'multiple'
  const selectedAnswer = answers[currentQ.id]
  const hasAnswer = Array.isArray(selectedAnswer) ? selectedAnswer.length > 0 : !!selectedAnswer
  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount >= quiz.questions.length

  return (
    <div className="p-6 flex flex-col gap-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{currentIdx + 1} / {quiz.questions.length}</span>
          {secondsLeft !== null && (
            <Badge variant={secondsLeft < 60 ? 'destructive' : 'secondary'} className="font-mono text-xs">
              {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
            </Badge>
          )}
        </div>
        <Progress value={((currentIdx + 1) / quiz.questions.length) * 100} className="h-1.5 w-32" />
      </div>

      {/* Question */}
      <div>
        <p className="font-semibold text-base leading-relaxed">{currentQ.question}</p>
        {isMultiple && <p className="text-xs text-muted-foreground mt-1">Selecciona todas las opciones correctas</p>}
      </div>

      {/* Options */}
      {currentQ.options && (
        <div className="flex flex-col gap-2">
          {currentQ.options.map((opt, i) => {
            const isSelected = Array.isArray(selectedAnswer)
              ? selectedAnswer.includes(opt.text)
              : selectedAnswer === opt.text
            return (
              <button
                key={i}
                onClick={() => selectAnswer(currentQ.id, opt.text, currentQ.question_type)}
                className={`flex items-center gap-3 rounded-lg border p-4 text-left text-sm transition-colors w-full
                  ${isSelected
                    ? 'border-primary bg-primary/5 font-medium'
                    : 'hover:bg-muted/50 hover:border-muted-foreground/30'
                  }`}
              >
                <div className={`h-5 w-5 rounded-${isMultiple ? 'sm' : 'full'} border-2 shrink-0 flex items-center justify-center transition-colors
                  ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}>
                  {isSelected && <FaCheckCircle className="h-3 w-3 text-primary-foreground" />}
                </div>
                {opt.text}
              </button>
            )
          })}
        </div>
      )}

      {/* Short answer */}
      {currentQ.question_type === 'short' && (
        <textarea
          className="w-full rounded-lg border p-3 text-sm min-h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Escribe tu respuesta aquí…"
          value={(answers[currentQ.id] as string) ?? ''}
          onChange={e => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button variant="outline" onClick={() => setCurrentIdx(p => p - 1)} disabled={currentIdx === 0} className="gap-2">
          <FaChevronLeft className="h-3 w-3" /> Anterior
        </Button>

        <span className="text-xs text-muted-foreground">{answeredCount}/{quiz.questions.length} respondidas</span>

        {currentIdx < quiz.questions.length - 1 ? (
          <Button onClick={() => setCurrentIdx(p => p + 1)} disabled={!hasAnswer} className="gap-2">
            Siguiente <FaChevronRight className="h-3 w-3" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting || !allAnswered}
            className="bg-brand-green hover:bg-brand-green-dark text-white gap-2"
          >
            {submitting ? <FaSpinner className="h-4 w-4 animate-spin" /> : <FaCheckCircle className="h-4 w-4" />}
            Enviar examen
          </Button>
        )}
      </div>

      {/* Question dots */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {quiz.questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIdx(i)}
            className={`h-6 w-6 rounded-full text-xs font-medium transition-colors
              ${i === currentIdx ? 'bg-primary text-primary-foreground'
                : answers[q.id] ? 'bg-brand-green/20 text-brand-green border border-brand-green/30'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Course Player Page ─── */
export default function CursoPlayerPage() {
  return <Suspense><CursoPlayerInner /></Suspense>
}

function CursoPlayerInner() {
  const { slug } = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const [course, setCourse] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<'player' | 'quiz'>('player')
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null)

  useEffect(() => {
    const tab = searchParams.get('tab')
    const quizId = searchParams.get('quiz_id')
    if (tab === 'quiz' && quizId) {
      setActiveTab('quiz')
      setActiveQuizId(Number(quizId))
    }
  }, [searchParams])

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/courses/${slug}`).then(r => r.json()),
      fetch(`/api/v1/enrollments/${slug}/progress`).then(r => r.json()).catch(() => ({ progress: [] })),
    ]).then(([courseData, progressData]) => {
      if (!courseData.course) { setLoading(false); return }
      const progressMap = new Map<number, boolean>(
        (progressData.progress ?? []).map((p: { lesson_id: number; completed: boolean }) => [p.lesson_id, p.completed])
      )
      const modules: Module[] = (courseData.course.modules ?? []).map((m: any) => ({
        ...m,
        slides: (m.slides ?? []).map((s: any) => ({ ...s, completed: progressMap.get(s.id) ?? false })),
      }))
      setCourse({ ...courseData.course, modules, enrolled: true })
      const first = modules[0]?.slides?.[0]
      if (first) setActiveLesson(first)
      setLoading(false)
    })
  }, [slug])

  async function markComplete(lessonId: number) {
    await fetch(`/api/v1/enrollments/${slug}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lesson_id: lessonId, completed: true }),
    })
    setCourse(prev => {
      if (!prev) return prev
      const modules = prev.modules.map(m => ({
        ...m, slides: m.slides.map(s => s.id === lessonId ? { ...s, completed: true } : s),
      }))
      const total = modules.reduce((acc, m) => acc + m.slides.length, 0)
      const done = modules.reduce((acc, m) => acc + m.slides.filter(s => s.completed).length, 0)
      return { ...prev, modules, progress_pct: total > 0 ? (done / total) * 100 : 0 }
    })
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Cargando curso…</p>
      </div>
    </div>
  )

  if (!course) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-lg font-semibold mb-2">Curso no encontrado</p>
      <Button asChild variant="outline"><Link href="/dashboard/comprador/cursos">Mis cursos</Link></Button>
    </div>
  )

  const totalLessons = course.modules.reduce((a, m) => a + m.slides.length, 0)
  const completedLessons = course.modules.reduce((a, m) => a + m.slides.filter(s => s.completed).length, 0)
  const progressPct = course.progress_pct

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Topbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background sticky top-0 z-10">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/comprador/cursos"><FaArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{course.name}</p>
          <div className="flex items-center gap-2">
            <Progress value={progressPct} className="h-1 w-32" />
            <span className="text-xs text-muted-foreground">{completedLessons}/{totalLessons} lecciones</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/30">
          <button
            onClick={() => setActiveTab('player')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
              ${activeTab === 'player' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <FaPlay className="h-3 w-3" /> Clases
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
              ${activeTab === 'quiz' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <FaClipboardList className="h-3 w-3" /> Examen
          </button>
        </div>

        <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(p => !p)} className="shrink-0">
          {sidebarOpen ? <FaChevronRight className="h-4 w-4" /> : <FaChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main area */}
        <div className="flex-1 overflow-y-auto">

          {/* Quiz tab */}
          {activeTab === 'quiz' && (
            <div className="py-4">
              {progressPct < 80 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                  <FaLock className="h-10 w-10 text-muted-foreground/30 mb-4" />
                  <h2 className="text-lg font-semibold mb-2">Examen bloqueado</h2>
                  <p className="text-muted-foreground mb-4">Completa al menos el 80% del curso para acceder al examen.</p>
                  <p className="text-sm">Tu progreso actual: <strong>{Math.round(progressPct)}%</strong></p>
                  <Progress value={progressPct} className="w-48 mt-3" />
                  <Button className="mt-6" onClick={() => setActiveTab('player')}>Continuar curso</Button>
                </div>
              ) : activeQuizId ? (
                <QuizPlayer quizId={activeQuizId} onClose={() => { setActiveTab('player'); setActiveQuizId(null) }} />
              ) : (
                <div className="p-6 flex flex-col items-center gap-4 text-center">
                  <FaClipboardList className="h-10 w-10 text-primary" />
                  <p className="text-muted-foreground">Ve a <Link href="/dashboard/comprador/evaluaciones" className="text-primary underline">Evaluaciones</Link> para seleccionar tu examen.</p>
                </div>
              )}
            </div>
          )}

          {/* Player tab */}
          {activeTab === 'player' && activeLesson && (
            <div className="flex flex-col">
              {/* Player */}
              <div className="aspect-video bg-black relative">
                {activeLesson.content_url ? (
                  <iframe
                    src={activeLesson.content_url}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/50 gap-3">
                    <FaPlay className="h-12 w-12" />
                    <p className="text-sm">Contenido no disponible</p>
                  </div>
                )}
              </div>

              {/* Lesson info */}
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">{activeLesson.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {SLIDE_ICONS[activeLesson.slide_type] ?? <FaPlay className="h-3.5 w-3.5" />}
                      <span className="text-sm text-muted-foreground capitalize">{activeLesson.slide_type}</span>
                      {activeLesson.duration > 0 && (
                        <span className="text-sm text-muted-foreground">· {durationStr(activeLesson.duration)}</span>
                      )}
                    </div>
                  </div>
                  {!activeLesson.completed ? (
                    <Button onClick={() => markComplete(activeLesson.id)} className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white shrink-0">
                      <FaCheckCircle className="h-4 w-4" /> Marcar completada
                    </Button>
                  ) : (
                    <Badge className="bg-brand-green/10 text-brand-green border-0 gap-1 py-1.5 px-3">
                      <FaCheckCircle className="h-3 w-3" /> Completada
                    </Badge>
                  )}
                </div>
                <Separator />
                <div className="flex gap-3">
                  {(() => {
                    const allLessons = course.modules.flatMap(m => m.slides)
                    const idx = allLessons.findIndex(l => l.id === activeLesson.id)
                    const prev = allLessons[idx - 1]
                    const next = allLessons[idx + 1]
                    return (
                      <>
                        <Button variant="outline" disabled={!prev} onClick={() => prev && setActiveLesson(prev)}>
                          ← Anterior
                        </Button>
                        <Button disabled={!next} onClick={() => next && setActiveLesson(next)}
                          className={next ? 'bg-primary text-primary-foreground' : ''}>
                          Siguiente →
                        </Button>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'player' && !activeLesson && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <FaPlay className="h-16 w-16 opacity-20 mb-4" />
              <p>Selecciona una lección para comenzar</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 shrink-0 border-l overflow-y-auto bg-muted/20">
            <div className="p-4 border-b">
              <p className="font-semibold text-sm">Contenido del curso</p>
              <p className="text-xs text-muted-foreground">{totalLessons} lecciones · {completedLessons} completadas</p>
            </div>
            <Accordion type="multiple" defaultValue={course.modules.map(m => String(m.id))} className="px-2 py-2">
              {course.modules.map(mod => {
                const modDone = mod.slides.filter(s => s.completed).length
                return (
                  <AccordionItem key={mod.id} value={String(mod.id)} className="border-0">
                    <AccordionTrigger className="py-3 px-2 text-sm font-medium hover:no-underline">
                      <div className="flex items-start gap-2 text-left">
                        <span className="flex-1">{mod.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0 font-normal">{modDone}/{mod.slides.length}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-2">
                      <div className="flex flex-col gap-0.5">
                        {mod.slides.map(lesson => {
                          const isActive = activeLesson?.id === lesson.id && activeTab === 'player'
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => { setActiveLesson(lesson); setActiveTab('player') }}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors w-full
                                ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                            >
                              <span className="shrink-0">
                                {lesson.completed
                                  ? <FaCheckCircle className="h-3.5 w-3.5 text-brand-green" />
                                  : SLIDE_ICONS[lesson.slide_type] ?? <FaPlay className="h-3 w-3" />
                                }
                              </span>
                              <span className="flex-1 line-clamp-2 text-xs">{lesson.name}</span>
                              {lesson.duration > 0 && (
                                <span className={`text-xs shrink-0 ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                  {durationStr(lesson.duration)}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>
        )}
      </div>
    </div>
  )
}
