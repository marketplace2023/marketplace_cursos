'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  FaSearch, FaStar, FaTimes, FaCheckCircle,
  FaUsers, FaBookOpen, FaGlobe, FaChevronRight,
  FaUserTie, FaChevronDown, FaSlidersH,
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

/* ─── Types ─── */
type Instructor = {
  id: number; display_name: string; username: string | null
  avatar_url: string | null; bio: string | null; country: string | null
  language: string | null; headline: string | null; expertise: string[]
  rating_avg: string | null; rating_count: number | null
  total_courses: number | null; total_students: number | null
  email_verified: boolean | null
}
type Meta = { total: number; page: number; limit: number; total_pages: number }
type Filters = { rating_min: string; country: string; language: string; verified: string }

/* ─── Options ─── */
const SORT_OPTS = [
  { value: 'popular',  label: 'Más populares' },
  { value: 'rating',   label: 'Mejor valorados' },
  { value: 'courses',  label: 'Más cursos' },
  { value: 'students', label: 'Más estudiantes' },
  { value: 'name_asc', label: 'A–Z' },
]
const RATING_OPTS = [
  { value: '',    label: 'Valoración' },
  { value: '4.5', label: '4.5★ y más' },
  { value: '4.0', label: '4.0★ y más' },
  { value: '3.5', label: '3.5★ y más' },
  { value: '3.0', label: '3.0★ y más' },
]
const COUNTRY_OPTS = [
  { value: '',   label: 'País' },
  { value: 'CO', label: 'Colombia' },
  { value: 'MX', label: 'México' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CL', label: 'Chile' },
  { value: 'PE', label: 'Perú' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'BR', label: 'Brasil' },
  { value: 'ES', label: 'España' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'GB', label: 'Reino Unido' },
  { value: 'DE', label: 'Alemania' },
  { value: 'FR', label: 'Francia' },
  { value: 'PT', label: 'Portugal' },
  { value: 'CA', label: 'Canadá' },
  { value: 'AU', label: 'Australia' },
]
const LANG_OPTS = [
  { value: '',   label: 'Idioma' },
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'Inglés' },
  { value: 'pt', label: 'Portugués' },
  { value: 'fr', label: 'Francés' },
  { value: 'de', label: 'Alemán' },
]

/* ─── FilterDropdown ─── */
function FilterDropdown({
  label, value, options, onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isActive = !!value
  const displayLabel = isActive ? (options.find(o => o.value === value)?.label ?? label) : label

  useEffect(() => {
    function out(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', out)
    return () => document.removeEventListener('mousedown', out)
  }, [open])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium
          border transition-all duration-150 whitespace-nowrap
          ${isActive
            ? 'bg-primary text-white border-primary shadow-sm'
            : 'bg-white text-foreground border-border hover:border-primary/40 hover:bg-muted/30'
          }`}
      >
        {displayLabel}
        {isActive
          ? (
            <FaTimes
              className="h-3 w-3 ml-0.5 opacity-70"
              onClick={e => { e.stopPropagation(); onChange(''); setOpen(false) }}
            />
          )
          : <FaChevronDown className={`h-2.5 w-2.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        }
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-50 bg-white border border-border rounded-2xl shadow-xl overflow-hidden min-w-48">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                ${value === opt.value
                  ? 'font-semibold text-primary bg-primary/5'
                  : opt.value === ''
                    ? 'text-muted-foreground hover:bg-muted/50'
                    : 'text-foreground hover:bg-muted/50'
                }`}
            >
              {opt.value === '' && value !== '' ? 'Todos (limpiar)' : opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Instructor row ─── */
function InstructorRow({ instructor: i }: { instructor: Instructor }) {
  const initials = i.display_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const rating = Number(i.rating_avg ?? 0)
  const countryLabel = COUNTRY_OPTS.find(o => o.value === i.country)?.label ?? i.country
  const langLabel = LANG_OPTS.find(o => o.value === i.language)?.label ?? null

  return (
    <Link
      href={`/instructores/${i.username ?? i.id}`}
      className="group flex items-start gap-5 py-5 border-b border-border/15 last:border-0
        hover:bg-muted/25 transition-colors duration-150 px-1 -mx-1 rounded-lg"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="h-14 w-14 ring-2 ring-white shadow-sm">
          <AvatarImage src={i.avatar_url ?? undefined} alt={i.display_name} />
          <AvatarFallback className="text-base font-bold bg-linear-to-br from-[#1E5AA8]/15 to-[#0B2E59]/20 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        {i.email_verified && (
          <FaCheckCircle className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-brand-green bg-white rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-[16px] leading-snug text-foreground group-hover:text-primary transition-colors truncate">
              {i.display_name}
            </h3>
            {i.headline && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{i.headline}</p>
            )}
          </div>

          {/* Rating badge — floated right */}
          {rating >= 3 && (
            <div className="shrink-0 flex items-center gap-1 bg-brand-orange/10 text-brand-orange rounded-lg px-2.5 py-1 mt-0.5">
              <FaStar className="h-3 w-3" />
              <span className="text-sm font-bold">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <FaBookOpen className="h-3 w-3 text-primary/50" />
            <span className="font-medium text-foreground">{i.total_courses ?? 0}</span> cursos
          </span>
          <span className="flex items-center gap-1.5">
            <FaUsers className="h-3 w-3 text-primary/50" />
            <span className="font-medium text-foreground">{(i.total_students ?? 0).toLocaleString()}</span> estudiantes
          </span>
          {i.rating_count && i.rating_count > 0 ? (
            <span className="flex items-center gap-1.5 opacity-70">
              {i.rating_count.toLocaleString()} reseñas
            </span>
          ) : null}
          {(countryLabel || langLabel) && (
            <span className="flex items-center gap-1.5 opacity-70">
              <FaGlobe className="h-3 w-3" />
              {[countryLabel, langLabel].filter(Boolean).join(' · ')}
            </span>
          )}
        </div>

        {/* Expertise tags */}
        {i.expertise.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {i.expertise.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-muted/70 text-muted-foreground px-2.5 py-0.5 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
            {i.expertise.length > 4 && (
              <span className="text-[11px] border border-border/60 text-muted-foreground px-2.5 py-0.5 rounded-full">
                +{i.expertise.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Arrow */}
      <FaChevronRight className="shrink-0 h-3.5 w-3.5 text-muted-foreground/25 group-hover:text-primary/40 transition-colors mt-5" />
    </Link>
  )
}

/* ─── Skeleton ─── */
function SkeletonRow() {
  return (
    <div className="flex items-start gap-5 py-5 border-b border-border/15">
      <Skeleton className="h-14 w-14 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-2.5 pt-1">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-7 w-14 rounded-lg" />
        </div>
        <Skeleton className="h-3 w-60" />
        <div className="flex gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/* ─── Page ─── */
export default function InstructoresPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('popular')
  const [filters, setFilters] = useState<Filters>({
    rating_min: '', country: '', language: '', verified: '',
  })

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const fetchInstructors = useCallback(async (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ sort, page: String(p), limit: '20' })
    if (q) params.set('q', q)
    if (filters.rating_min) params.set('rating_min', filters.rating_min)
    if (filters.country) params.set('country', filters.country)
    if (filters.language) params.set('language', filters.language)
    if (filters.verified) params.set('verified', filters.verified)
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
  }, [q, sort, filters])

  useEffect(() => { fetchInstructors(1) }, [sort, filters])

  function setFilter(k: keyof Filters, v: string) {
    setFilters(f => ({ ...f, [k]: v }))
  }
  function clearAll() {
    setFilters({ rating_min: '', country: '', language: '', verified: '' })
    setQ('')
  }

  const activeChips: { label: string; clear: () => void }[] = []
  if (filters.rating_min) activeChips.push({ label: `${filters.rating_min}★ y más`, clear: () => setFilter('rating_min', '') })
  if (filters.country) activeChips.push({ label: COUNTRY_OPTS.find(o => o.value === filters.country)?.label ?? filters.country, clear: () => setFilter('country', '') })
  if (filters.language) activeChips.push({ label: LANG_OPTS.find(o => o.value === filters.language)?.label ?? filters.language, clear: () => setFilter('language', '') })
  if (filters.verified) activeChips.push({ label: 'Verificados', clear: () => setFilter('verified', '') })

  return (
    <div className="min-h-screen bg-background">

      {/* ══ HERO HEADER ══ */}
      <div className="bg-[#0B2E59] text-white">
        <div className="container mx-auto px-4 pt-8 pb-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/40 mb-6">
            <Link href="/" className="hover:text-white/70 transition-colors">Inicio</Link>
            <FaChevronRight className="h-2.5 w-2.5" />
            <span className="text-white/70">Instructores</span>
          </nav>

          {/* Title */}
          <div className="flex items-end gap-4 mb-2">
            <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight">
              Instructores
            </h1>
            {meta && !loading && (
              <span className="mb-1.5 text-sm font-medium text-white/50 tabular-nums">
                {meta.total.toLocaleString()} disponibles
              </span>
            )}
          </div>
          <p className="text-white/55 text-base mb-7">
            Aprende de profesionales con experiencia real en la industria
          </p>

          {/* Embedded search */}
          <form
            onSubmit={e => { e.preventDefault(); fetchInstructors(1) }}
            className="relative max-w-xl"
          >
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
            <Input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar instructor por nombre…"
              className="pl-11 h-12 text-sm rounded-2xl bg-white border-0 text-foreground shadow-md focus-visible:ring-2 focus-visible:ring-brand-green/60"
            />
            {q && (
              <button
                type="button"
                onClick={() => { setQ(''); fetchInstructors(1) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
              >
                <FaTimes className="h-3.5 w-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* ══ STICKY FILTER BAR ══ */}
      <div className="sticky top-0 z-40 bg-white border-b border-border/30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none">
            <FilterDropdown
              label="Ordenar"
              value={sort !== 'popular' ? sort : ''}
              options={[
                { value: '', label: 'Ordenar' },
                ...SORT_OPTS,
              ]}
              onChange={v => setSort(v || 'popular')}
            />
            <div className="w-px h-5 bg-border/50 shrink-0" />
            <FilterDropdown
              label="Valoración"
              value={filters.rating_min}
              options={RATING_OPTS}
              onChange={v => setFilter('rating_min', v)}
            />
            <FilterDropdown
              label="País"
              value={filters.country}
              options={COUNTRY_OPTS}
              onChange={v => setFilter('country', v)}
            />
            <FilterDropdown
              label="Idioma"
              value={filters.language}
              options={LANG_OPTS}
              onChange={v => setFilter('language', v)}
            />

            {/* Verified toggle */}
            <button
              onClick={() => setFilter('verified', filters.verified ? '' : '1')}
              className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium
                border transition-all duration-150 whitespace-nowrap shrink-0
                ${filters.verified
                  ? 'bg-brand-green text-white border-brand-green shadow-sm'
                  : 'bg-white text-foreground border-border hover:border-brand-green/40 hover:bg-muted/30'
                }`}
            >
              <FaCheckCircle className="h-3 w-3" />
              Verificados
              {filters.verified && (
                <FaTimes
                  className="h-3 w-3 ml-0.5 opacity-70"
                  onClick={e => { e.stopPropagation(); setFilter('verified', '') }}
                />
              )}
            </button>

            {/* Clear all */}
            {activeFilterCount > 0 && (
              <>
                <div className="w-px h-5 bg-border/50 shrink-0 ml-auto" />
                <button
                  onClick={clearAll}
                  className="shrink-0 text-xs text-muted-foreground hover:text-destructive transition-colors whitespace-nowrap"
                >
                  Limpiar todo
                </button>
              </>
            )}
          </div>

          {/* Active chips + count */}
          {(activeChips.length > 0 || (meta && !loading)) && (
            <div className="flex items-center gap-2 pb-2.5 flex-wrap">
              {meta && !loading && (
                <span className="text-[12px] text-muted-foreground shrink-0">
                  <span className="font-semibold text-foreground">{meta.total.toLocaleString()}</span>{' '}
                  instructor{meta.total !== 1 ? 'es' : ''}
                  {q && <span className="italic"> para &quot;{q}&quot;</span>}
                </span>
              )}
              {activeChips.length > 0 && meta && (
                <div className="w-px h-3.5 bg-border/50 shrink-0" />
              )}
              {activeChips.map(chip => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-primary/8 text-primary border border-primary/20 rounded-full px-2.5 py-0.5"
                >
                  {chip.label}
                  <button onClick={chip.clear} className="hover:opacity-60 ml-0.5 transition-opacity">
                    <FaTimes className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ LIST ══ */}
      <div className="container mx-auto px-4 max-w-4xl py-2">
        {loading && instructors.length === 0 ? (
          <div>{Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : instructors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
              <FaSlidersH className="h-6 w-6 text-muted-foreground/30" />
            </div>
            <h3 className="font-semibold text-lg mb-1.5">Sin resultados</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs">
              No encontramos instructores que coincidan con tu búsqueda o filtros.
            </p>
            <Button variant="outline" className="rounded-full" onClick={clearAll}>
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <>
            {instructors.map(inst => (
              <InstructorRow key={inst.id} instructor={inst} />
            ))}
            {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={`sk-${i}`} />)}

            {meta && page < meta.total_pages && !loading && (
              <div className="flex justify-center py-10">
                <Button
                  onClick={() => fetchInstructors(page + 1)}
                  variant="outline"
                  className="rounded-full px-10 h-11"
                >
                  Cargar más instructores
                </Button>
              </div>
            )}

            {meta && (page >= meta.total_pages) && instructors.length > 0 && (
              <p className="text-center text-xs text-muted-foreground py-10">
                {instructors.length.toLocaleString()} de {meta.total.toLocaleString()} instructores
              </p>
            )}
          </>
        )}
      </div>

      {/* ══ FOOTER STRIP ══ */}
      {!loading && instructors.length === 0 && <div className="h-24" />}
    </div>
  )
}
