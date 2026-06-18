'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  FaSearch, FaStar, FaUsers, FaBookOpen, FaGlobe,
  FaChevronRight, FaUserTie,
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

/* ─── Types ─── */
type Instructor = {
  id: number; display_name: string; username: string | null
  avatar_url: string | null; bio: string | null; country: string | null
  headline: string | null; expertise: string[]
  rating_avg: string | null; rating_count: number | null
  total_courses: number | null; total_students: number | null
}
type Meta = { total: number; page: number; limit: number; total_pages: number }

const SORT_OPTIONS = [
  { value: 'popular', label: 'Más populares' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'courses', label: 'Más cursos' },
  { value: 'students', label: 'Más estudiantes' },
]

function InstructorCard({ instructor: i }: { instructor: Instructor }) {
  const initials = i.display_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <Link href={`/instructores/${i.username ?? i.id}`} className="group block h-full">
      <div className="h-full rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col">
        {/* Colored top stripe */}
        <div className="h-1.5 w-full bg-linear-to-r from-brand-purple to-brand-secondary" />
        <div className="p-5 flex flex-col gap-3 flex-1">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 shrink-0 ring-2 ring-border/50 shadow-sm">
              <AvatarImage src={i.avatar_url ?? undefined} alt={i.display_name} />
              <AvatarFallback className="text-lg font-bold bg-linear-to-br from-brand-purple/20 to-primary/20 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
                {i.display_name}
              </h3>
              {i.headline && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{i.headline}</p>
              )}
              {i.country && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <FaGlobe className="h-3 w-3" />{i.country}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-brand-orange/8 p-2.5">
              <div className="flex items-center justify-center gap-1 text-brand-orange font-bold text-sm">
                <FaStar className="h-3 w-3" />
                {Number(i.rating_avg ?? 0).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">{(i.rating_count ?? 0).toLocaleString()} reseñas</p>
            </div>
            <div className="rounded-xl bg-primary/8 p-2.5">
              <div className="flex items-center justify-center gap-1 font-bold text-sm text-primary">
                <FaUsers className="h-3 w-3" />
                {(i.total_students ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">estudiantes</p>
            </div>
            <div className="rounded-xl bg-brand-green/8 p-2.5">
              <div className="flex items-center justify-center gap-1 font-bold text-sm text-brand-green">
                <FaBookOpen className="h-3 w-3" />
                {i.total_courses ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">cursos</p>
            </div>
          </div>

          {/* Bio */}
          {i.bio && (
            <p className="text-xs text-muted-foreground line-clamp-2">{i.bio}</p>
          )}

          {/* Expertise */}
          {i.expertise.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {i.expertise.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-xs bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full font-medium">{tag}</span>
              ))}
              {i.expertise.length > 3 && (
                <span className="text-xs border border-border/60 text-muted-foreground px-2.5 py-0.5 rounded-full">+{i.expertise.length - 3}</span>
              )}
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-border/50">
            <span className="text-xs text-primary font-semibold group-hover:underline flex items-center gap-1">
              Ver perfil completo <FaChevronRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function InstructorSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </CardContent>
    </Card>
  )
}

/* ─── Main page ─── */
export default function InstructoresPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('popular')

  const fetchInstructors = useCallback(async (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ sort, page: String(p), limit: '20' })
    if (q) params.set('q', q)
    try {
      const res = await fetch(`/api/v1/instructors?${params}`)
      const data = await res.json()
      if (data.success) {
        setInstructors(prev => p === 1 ? data.data : [...prev, ...data.data])
        setMeta(data.meta)
        setPage(p)
      }
    } finally {
      setLoading(false)
    }
  }, [q, sort])

  useEffect(() => { fetchInstructors(1) }, [sort])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-linear-to-br from-brand-purple via-[#5c3aa5] to-primary text-white py-16">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-16 h-48 w-48 rounded-full bg-brand-green/10 blur-3xl" />
        <div className="relative container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-5">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <FaChevronRight className="h-3 w-3" />
            <span className="text-white">Instructores</span>
          </nav>
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
              <FaUserTie className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading">Nuestros instructores</h1>
              <p className="text-white/75 mt-1.5">Aprende de profesionales con experiencia real en la industria</p>
              {meta && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
                    <FaUserTie className="h-3 w-3 text-brand-green" />
                    {meta.total.toLocaleString()} instructores
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar instructor…"
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchInstructors(1)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-52 h-11 rounded-xl">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {q && (
            <Button onClick={() => fetchInstructors(1)} className="shrink-0 h-11 rounded-xl">Buscar</Button>
          )}
        </div>

        {/* Grid */}
        {loading && instructors.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => <InstructorSkeleton key={i} />)}
          </div>
        ) : instructors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FaUserTie className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No se encontraron instructores</h2>
            <p className="text-muted-foreground mb-4">Intenta con otra búsqueda.</p>
            <Button onClick={() => { setQ(''); fetchInstructors(1) }} variant="outline">
              Ver todos los instructores
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {instructors.map(i => <InstructorCard key={i.id} instructor={i} />)}
              {loading && Array.from({ length: 4 }, (_, i) => <InstructorSkeleton key={`sk-${i}`} />)}
            </div>

            {meta && page < meta.total_pages && !loading && (
              <div className="flex justify-center mt-10">
                <Button onClick={() => fetchInstructors(page + 1)} variant="outline" size="lg">
                  Cargar más instructores
                </Button>
              </div>
            )}

            {meta && (
              <p className="text-center text-sm text-muted-foreground mt-6">
                Mostrando {instructors.length} de {meta.total.toLocaleString()} instructores
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
