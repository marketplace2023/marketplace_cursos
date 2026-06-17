'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FaClipboardList, FaCheckCircle, FaClock, FaSpinner,
  FaStar, FaTrophy, FaRedo,
} from 'react-icons/fa'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

type Quiz = {
  id: number
  course_id: number
  course_name: string
  title: string
  pass_score: number
  time_limit: number | null
  max_attempts: number
  attempts_used: number
  best_score: number | null
  passed: boolean
}

type Enrollment = {
  id: number
  state: string
  progress_pct: string
  course_id: number
  course_name: string
  course_slug: string
  has_certificate: boolean
}

export default function EvaluacionesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/quizzes').then(r => r.json()),
      fetch('/api/v1/enrollments').then(r => r.json()),
    ]).then(([qz, en]) => {
      if (qz.success) setQuizzes(qz.data ?? [])
      if (en.success) setEnrollments(en.data ?? [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  /* Merge quiz data with enrollment progress */
  const enrollmentMap = Object.fromEntries(enrollments.map(e => [e.course_id, e]))

  /* Also show certificate-eligible courses without quizzes */
  const certCourses = enrollments.filter(e => e.has_certificate)
  const quizCourseIds = new Set(quizzes.map(q => q.course_id))
  const certWithoutQuiz = certCourses.filter(e => !quizCourseIds.has(e.course_id))

  const total = quizzes.length + certWithoutQuiz.length
  const passed = quizzes.filter(q => q.passed).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Evaluaciones</h1>
          <p className="text-muted-foreground mt-0.5">Exámenes y progreso de certificación</p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FaTrophy className="h-4 w-4 text-brand-orange" />
            <span>{passed} / {quizzes.length} aprobada{passed !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaClipboardList className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin evaluaciones pendientes</h3>
          <p className="text-muted-foreground mb-4">Inscríbete en cursos con certificado para ver sus evaluaciones aquí</p>
          <Button asChild className="bg-brand-green hover:bg-brand-green-dark text-white">
            <Link href="/cursos?has_certificate=1">Cursos con certificado</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Quizzes with real data */}
          {quizzes.map(quiz => {
            const enrollment = enrollmentMap[quiz.course_id]
            const progress = Number(enrollment?.progress_pct ?? 0)
            const attemptsLeft = quiz.max_attempts - quiz.attempts_used
            const canAttempt = progress >= 80 && attemptsLeft > 0 && !quiz.passed
            const slug = enrollment?.course_slug ?? ''

            return (
              <Card key={quiz.id}>
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">{quiz.course_name}</p>
                      <h3 className="font-semibold text-sm">{quiz.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {quiz.passed && (
                          <Badge className="bg-brand-green/10 text-brand-green border-0 gap-1 text-xs">
                            <FaCheckCircle className="h-3 w-3" /> Aprobado
                          </Badge>
                        )}
                        {!quiz.passed && quiz.best_score !== null && (
                          <Badge variant="destructive" className="gap-1 text-xs">
                            Reprobado
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          Aprobación: {quiz.pass_score}%
                        </Badge>
                        {quiz.time_limit && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <FaClock className="h-3 w-3" /> {quiz.time_limit} min
                          </Badge>
                        )}
                      </div>
                    </div>
                    {quiz.best_score !== null && (
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold text-primary">{quiz.best_score}<span className="text-sm font-normal">%</span></p>
                        <p className="text-xs text-muted-foreground">Mejor puntaje</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                      <span>Progreso del curso</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                    {progress < 80 && (
                      <p className="text-xs text-muted-foreground mt-1">Completa el 80% del curso para desbloquear el examen</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {quiz.attempts_used}/{quiz.max_attempts} intentos usados
                    </p>
                    <div className="flex gap-2">
                      {quiz.passed && slug && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/comprador/certificados`}>
                            <FaTrophy className="h-3 w-3 mr-1" /> Ver certificado
                          </Link>
                        </Button>
                      )}
                      {canAttempt && slug && (
                        <Button asChild size="sm" className="bg-brand-green hover:bg-brand-green-dark text-white">
                          <Link href={`/dashboard/comprador/cursos/${slug}?tab=quiz&quiz_id=${quiz.id}`}>
                            {quiz.attempts_used > 0 ? <><FaRedo className="h-3 w-3 mr-1" /> Reintentar</> : 'Iniciar examen'}
                          </Link>
                        </Button>
                      )}
                      {!canAttempt && attemptsLeft === 0 && !quiz.passed && (
                        <Badge variant="secondary" className="text-xs">Sin intentos restantes</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Cert-eligible courses without formal quiz yet */}
          {certWithoutQuiz.length > 0 && (
            <>
              {quizzes.length > 0 && <Separator />}
              <p className="text-sm text-muted-foreground">Cursos con certificado — examen próximamente</p>
              {certWithoutQuiz.map(e => {
                const progress = Number(e.progress_pct ?? 0)
                return (
                  <Card key={e.id}>
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Link href={`/dashboard/comprador/cursos/${e.course_slug}`}
                            className="font-semibold text-sm hover:text-primary transition-colors">
                            {e.course_name}
                          </Link>
                          <div className="mt-1.5">
                            <Badge variant="secondary" className="text-xs">Examen disponible próximamente</Badge>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-2xl font-bold text-primary">{progress.toFixed(0)}<span className="text-sm font-normal text-muted-foreground">%</span></p>
                        </div>
                      </div>
                      <div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
