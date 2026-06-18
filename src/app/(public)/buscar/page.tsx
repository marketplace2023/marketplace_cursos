'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FaSearch, FaFilter, FaTimes, FaStar, FaGraduationCap } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { CourseCard, CourseSkeleton, type CourseCardData } from '@/components/courses/course-card'

type Meta = { total: number; page: number; limit: number; total_pages: number }

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Más recientes' },
  { value: 'rating',     label: 'Mejor valorados' },
  { value: 'popular',    label: 'Más populares' },
  { value: 'price_asc',  label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
]

const LEVELS = [
  { value: 'beginner',    label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced',    label: 'Avanzado' },
  { value: 'all_levels',  label: 'Todos los niveles' },
]

function FilterPanel({
  filters, onChange,
}: { filters: Record<string, string>; onChange: (k: string, v: string) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="font-semibold mb-3 text-sm">Nivel</h4>
        <div className="flex flex-col gap-2">
          {LEVELS.map(l => (
            <div key={l.value} className="flex items-center gap-2">
              <Checkbox id={`l-${l.value}`} checked={filters.level === l.value} onCheckedChange={c => onChange('level', c ? l.value : '')} />
              <Label htmlFor={`l-${l.value}`} className="text-sm cursor-pointer">{l.label}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <h4 className="font-semibold mb-3 text-sm">Precio</h4>
        <div className="flex flex-col gap-2">
          {[{ value: 'free', label: 'Gratis' }, { value: 'paid', label: 'De pago' }].map(o => (
            <div key={o.value} className="flex items-center gap-2">
              <Checkbox id={`p-${o.value}`} checked={filters.price === o.value} onCheckedChange={c => onChange('price', c ? o.value : '')} />
              <Label htmlFor={`p-${o.value}`} className="text-sm cursor-pointer">{o.label}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <h4 className="font-semibold mb-3 text-sm">Características</h4>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Checkbox id="cert" checked={filters.has_certificate === 'true'} onCheckedChange={c => onChange('has_certificate', c ? 'true' : '')} />
            <Label htmlFor="cert" className="text-sm cursor-pointer">Con certificado</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="best" checked={filters.is_bestseller === 'true'} onCheckedChange={c => onChange('is_bestseller', c ? 'true' : '')} />
            <Label htmlFor="best" className="text-sm cursor-pointer">Bestsellers</Label>
          </div>
        </div>
      </div>
      {Object.values(filters).some(v => !!v) && (
        <>
          <Separator />
          <Button variant="outline" size="sm" onClick={() => ['level', 'price', 'has_certificate', 'is_bestseller'].forEach(k => onChange(k, ''))}>
            <FaTimes className="h-3 w-3 mr-2" /> Limpiar filtros
          </Button>
        </>
      )}
    </div>
  )
}

export default function BuscarPage() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  const [q, setQ] = useState(initialQ)
  const [inputVal, setInputVal] = useState(initialQ)
  const [sort, setSort] = useState('newest')
  const [filters, setFilters] = useState<Record<string, string>>({
    level: '', price: '', has_certificate: '', is_bestseller: '',
  })
  const [courses, setCourses] = useState<CourseCardData[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const fetchCourses = useCallback(async (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: '12', sort })
    if (q) params.set('q', q)
    if (filters.level) params.set('level', filters.level)
    if (filters.price === 'free') params.set('is_free', 'true')
    if (filters.price === 'paid') params.set('is_free', 'false')
    if (filters.has_certificate) params.set('has_certificate', filters.has_certificate)
    if (filters.is_bestseller) params.set('is_bestseller', filters.is_bestseller)
    try {
      const res = await fetch(`/api/v1/courses?${params}`)
      const data = await res.json()
      if (data.success) {
        setCourses(p === 1 ? data.data : prev => [...prev, ...data.data])
        setMeta(data.meta)
        setPage(p)
      }
    } finally {
      setLoading(false)
    }
  }, [q, sort, filters])

  useEffect(() => { fetchCourses(1) }, [q, sort, filters])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setQ(inputVal)
    setPage(1)
  }

  function handleFilterChange(key: string, val: string) {
    setFilters(prev => ({ ...prev, [key]: val }))
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="min-h-screen">
      {/* Search hero */}
      <div className="bg-linear-to-br from-primary via-[#0d3a6e] to-brand-secondary py-14">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white font-heading mb-2">
            {q ? `Resultados para "${q}"` : 'Explorar cursos'}
          </h1>
          {meta && (
            <p className="text-white/60 text-sm mb-5">
              {meta.total.toLocaleString()} {meta.total === 1 ? 'curso encontrado' : 'cursos encontrados'}
            </p>
          )}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="¿Qué quieres aprender?"
                className="pl-10 h-12 rounded-2xl bg-white border-0 shadow-lg text-foreground placeholder:text-muted-foreground focus-visible:ring-brand-green"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 rounded-2xl bg-brand-green hover:bg-brand-green-dark text-white px-6 font-semibold shadow-lg">
              Buscar
            </Button>
          </form>
        </div>
      </div>

      {/* Filters + results */}
      <div className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 h-10 rounded-xl">
                <FaFilter className="h-3.5 w-3.5" />
                Filtros
                {activeFilterCount > 0 && (
                  <Badge className="h-5 w-5 p-0 text-xs flex items-center justify-center bg-primary text-white">{activeFilterCount}</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader><SheetTitle>Filtrar cursos</SheetTitle></SheetHeader>
              <div className="mt-6"><FilterPanel filters={filters} onChange={handleFilterChange} /></div>
            </SheetContent>
          </Sheet>

          <Select value={sort} onValueChange={v => { setSort(v); setPage(1) }}>
            <SelectTrigger className="w-52 h-10 rounded-xl">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Active chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {filters.level && (
                <Badge variant="secondary" className="gap-1 h-7 pr-1 rounded-lg">
                  {LEVELS.find(l => l.value === filters.level)?.label}
                  <button onClick={() => handleFilterChange('level', '')} className="ml-1 hover:text-destructive"><FaTimes className="h-3 w-3" /></button>
                </Badge>
              )}
              {filters.price && (
                <Badge variant="secondary" className="gap-1 h-7 pr-1 rounded-lg">
                  {filters.price === 'free' ? 'Gratis' : 'De pago'}
                  <button onClick={() => handleFilterChange('price', '')} className="ml-1 hover:text-destructive"><FaTimes className="h-3 w-3" /></button>
                </Badge>
              )}
              {filters.has_certificate && (
                <Badge variant="secondary" className="gap-1 h-7 pr-1 rounded-lg">
                  Con certificado
                  <button onClick={() => handleFilterChange('has_certificate', '')} className="ml-1 hover:text-destructive"><FaTimes className="h-3 w-3" /></button>
                </Badge>
              )}
              {filters.is_bestseller && (
                <Badge variant="secondary" className="gap-1 h-7 pr-1 rounded-lg">
                  Bestseller
                  <button onClick={() => handleFilterChange('is_bestseller', '')} className="ml-1 hover:text-destructive"><FaTimes className="h-3 w-3" /></button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading && courses.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }, (_, i) => <CourseSkeleton key={i} />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mb-5">
              <FaGraduationCap className="h-9 w-9 text-muted-foreground/30" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No se encontraron cursos</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {q ? `No hay resultados para "${q}". Prueba con otros términos o elimina los filtros.` : 'No hay cursos con estos filtros.'}
            </p>
            <Button variant="outline" onClick={() => { setQ(''); setInputVal(''); setFilters({ level: '', price: '', has_certificate: '', is_bestseller: '' }) }}>
              Limpiar búsqueda
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {courses.map(c => <CourseCard key={c.id} course={c} />)}
              {loading && Array.from({ length: 4 }, (_, i) => <CourseSkeleton key={`sk-${i}`} />)}
            </div>

            {meta && page < meta.total_pages && !loading && (
              <div className="flex justify-center mt-10">
                <Button onClick={() => fetchCourses(page + 1)} variant="outline" size="lg" className="rounded-xl">
                  Cargar más cursos
                </Button>
              </div>
            )}

            {meta && (
              <p className="text-center text-sm text-muted-foreground mt-6">
                Mostrando {courses.length} de {meta.total.toLocaleString()} cursos
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
