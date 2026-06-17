'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  FaSearch, FaStar, FaFilter, FaTimes, FaCertificate,
  FaChevronDown, FaChevronUp, FaClock, FaUsers, FaGraduationCap,
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, durationLabel } from '@/lib/utils'

const LEVELS = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
  { value: 'all_levels', label: 'Todos los niveles' },
]

const MODALITIES = [
  { value: 'online_async', label: 'Online asíncrono' },
  { value: 'online_sync', label: 'Online en vivo' },
  { value: 'presential', label: 'Presencial' },
  { value: 'hybrid', label: 'Híbrido' },
  { value: 'recorded', label: 'Grabado' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'popular', label: 'Más populares' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
]

type Course = {
  id: number
  name: string
  subtitle?: string
  slug: string
  short_description?: string
  cover_url?: string
  level: string
  modality: string
  duration_hours?: string
  total_lessons?: number
  list_price: string
  sale_price?: string
  is_free: boolean
  currency: string
  rating_avg: string
  rating_count: number
  total_students: number
  has_certificate: boolean
  is_bestseller: boolean
  is_new: boolean
  store_name?: string
  store_slug?: string
  instructor_name?: string
  category_name?: string
}

type Meta = { total: number; page: number; limit: number; total_pages: number }

function levelLabel(v: string) {
  return LEVELS.find(l => l.value === v)?.label ?? v
}

function CourseCard({ course }: { course: Course }) {
  const price = Number(course.sale_price ?? course.list_price)
  const originalPrice = course.sale_price ? Number(course.list_price) : null
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0

  return (
    <Link href={`/cursos/${course.slug}`} className="group">
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5">
        <div className="relative aspect-video bg-muted overflow-hidden">
          {course.cover_url ? (
            <img
              src={course.cover_url}
              alt={course.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-accent/20">
              <FaGraduationCap className="h-12 w-12 text-primary/30" />
            </div>
          )}
          {course.is_bestseller && (
            <Badge className="absolute top-2 left-2 bg-brand-orange text-white border-0 text-xs">
              Bestseller
            </Badge>
          )}
          {course.is_new && !course.is_bestseller && (
            <Badge className="absolute top-2 left-2 bg-brand-green text-white border-0 text-xs">
              Nuevo
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="absolute top-2 right-2 bg-destructive text-white border-0 text-xs">
              -{discount}%
            </Badge>
          )}
        </div>

        <CardContent className="flex flex-col flex-1 gap-2 p-4">
          {course.store_name && (
            <p className="text-xs text-brand-secondary font-medium truncate">{course.store_name}</p>
          )}
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {course.name}
          </h3>
          {course.instructor_name && (
            <p className="text-xs text-muted-foreground truncate">{course.instructor_name}</p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs">
            <span className="font-bold text-brand-orange">{Number(course.rating_avg).toFixed(1)}</span>
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <FaStar
                  key={i}
                  className={`h-3 w-3 ${i < Math.round(Number(course.rating_avg)) ? 'text-brand-orange' : 'text-muted-foreground/30'}`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">({course.rating_count.toLocaleString()})</span>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FaClock className="h-3 w-3" />
              {course.duration_hours ? durationLabel(Number(course.duration_hours)) : 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <FaUsers className="h-3 w-3" />
              {course.total_students.toLocaleString()}
            </span>
            {course.has_certificate && (
              <span className="flex items-center gap-1 text-brand-purple">
                <FaCertificate className="h-3 w-3" />
                Certificado
              </span>
            )}
          </div>

          {/* Badge row */}
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">{levelLabel(course.level)}</Badge>
            <Badge variant="secondary" className="text-xs capitalize">{course.modality.replace('_', ' ')}</Badge>
          </div>

          {/* Price */}
          <div className="mt-auto flex items-center gap-2 pt-2 border-t">
            {course.is_free ? (
              <span className="text-lg font-bold text-brand-green">Gratis</span>
            ) : (
              <>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(price, course.currency)}
                </span>
                {originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatCurrency(originalPrice, course.currency)}
                  </span>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function CourseSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4 flex flex-col gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-6 w-20 mt-2" />
      </CardContent>
    </Card>
  )
}

function FilterPanel({
  filters,
  onChange,
}: {
  filters: Record<string, string>
  onChange: (key: string, val: string) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="font-semibold mb-3 text-sm">Nivel</h4>
        <div className="flex flex-col gap-2">
          {LEVELS.map(l => (
            <div key={l.value} className="flex items-center gap-2">
              <Checkbox
                id={`level-${l.value}`}
                checked={filters.level === l.value}
                onCheckedChange={checked => onChange('level', checked ? l.value : '')}
              />
              <Label htmlFor={`level-${l.value}`} className="text-sm cursor-pointer">{l.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-3 text-sm">Modalidad</h4>
        <div className="flex flex-col gap-2">
          {MODALITIES.map(m => (
            <div key={m.value} className="flex items-center gap-2">
              <Checkbox
                id={`modality-${m.value}`}
                checked={filters.modality === m.value}
                onCheckedChange={checked => onChange('modality', checked ? m.value : '')}
              />
              <Label htmlFor={`modality-${m.value}`} className="text-sm cursor-pointer">{m.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-3 text-sm">Precio</h4>
        <div className="flex items-center gap-2">
          <Checkbox
            id="free"
            checked={filters.is_free === '1'}
            onCheckedChange={checked => onChange('is_free', checked ? '1' : '')}
          />
          <Label htmlFor="free" className="text-sm cursor-pointer">Solo gratuitos</Label>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-3 text-sm">Certificación</h4>
        <div className="flex items-center gap-2">
          <Checkbox
            id="cert"
            checked={filters.has_certificate === '1'}
            onCheckedChange={checked => onChange('has_certificate', checked ? '1' : '')}
          />
          <Label htmlFor="cert" className="text-sm cursor-pointer">Con certificado</Label>
        </div>
      </div>
    </div>
  )
}

export default function CursosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [courses, setCourses] = useState<Course[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'newest')
  const [filters, setFilters] = useState<Record<string, string>>({
    level: searchParams.get('level') ?? '',
    modality: searchParams.get('modality') ?? '',
    is_free: searchParams.get('is_free') ?? '',
    has_certificate: searchParams.get('has_certificate') ?? '',
  })
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'))

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ sort, page: String(page) })
    if (query) params.set('q', query)
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })

    try {
      const res = await fetch(`/api/v1/courses?${params}`)
      const data = await res.json()
      if (data.success) {
        setCourses(data.data)
        setMeta(data.meta as Meta)
      }
    } finally {
      setLoading(false)
    }
  }, [query, sort, filters, page])

  useEffect(() => { fetchCourses() }, [fetchCourses])

  function handleFilterChange(key: string, val: string) {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(1)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchCourses()
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-primary mb-1">Catálogo de Cursos</h1>
        <p className="text-muted-foreground">
          {meta ? `${meta.total.toLocaleString()} cursos disponibles` : 'Cargando…'}
        </p>
      </div>

      {/* Search + sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar cursos por nombre, tema o instructor…"
            className="pl-9"
          />
        </form>

        <div className="flex items-center gap-2">
          {/* Mobile filter trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 lg:hidden">
                <FaFilter className="h-4 w-4" />
                Filtros
                {activeFilterCount > 0 && (
                  <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterPanel filters={filters} onChange={handleFilterChange} />
              </div>
            </SheetContent>
          </Sheet>

          <Select value={sort} onValueChange={v => { setSort(v); setPage(1) }}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(filters).map(([k, v]) => {
            if (!v) return null
            const labels: Record<string, string> = {
              level: LEVELS.find(l => l.value === v)?.label ?? v,
              modality: MODALITIES.find(m => m.value === v)?.label ?? v,
              is_free: 'Solo gratuitos',
              has_certificate: 'Con certificado',
            }
            return (
              <Badge key={k} variant="secondary" className="gap-1 pr-1">
                {labels[k]}
                <button
                  onClick={() => handleFilterChange(k, '')}
                  className="ml-1 hover:text-destructive"
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => { setFilters({ level: '', modality: '', is_free: '', has_certificate: '' }); setPage(1) }}
          >
            Limpiar todo
          </Button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <h3 className="font-semibold mb-4">Filtros</h3>
            <FilterPanel filters={filters} onChange={handleFilterChange} />
          </div>
        </aside>

        {/* Course grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <CourseSkeleton key={i} />)}
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FaGraduationCap className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron cursos</h3>
              <p className="text-muted-foreground mb-4">Intenta con otros filtros o términos de búsqueda</p>
              <Button variant="outline" onClick={() => {
                setQuery('')
                setFilters({ level: '', modality: '', is_free: '', has_certificate: '' })
                setPage(1)
              }}>
                Limpiar búsqueda
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {courses.map(c => <CourseCard key={c.id} course={c} />)}
              </div>

              {/* Pagination */}
              {meta && meta.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {meta.page} de {meta.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= meta.total_pages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
