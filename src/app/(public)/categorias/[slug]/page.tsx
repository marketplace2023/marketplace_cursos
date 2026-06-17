'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  FaGraduationCap, FaStar, FaCertificate, FaClock, FaUsers,
  FaChevronRight, FaFilter, FaTimes, FaSearch,
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, durationLabel } from '@/lib/utils'

/* ─── Types ─── */
type Category = {
  id: number; name: string; slug: string; description: string | null
  icon: string | null; image_url: string | null; featured: boolean
  meta_title: string | null; meta_description: string | null
}

type Course = {
  id: number; name: string; slug: string; cover_url: string | null
  level: string; modality: string; duration_hours: string | null
  total_lessons: number; list_price: string; sale_price: string | null
  is_free: boolean; currency: string; rating_avg: string
  rating_count: number; total_students: number; has_certificate: boolean
  is_bestseller: boolean; is_new: boolean
  store_name: string | null; store_slug: string | null; instructor_name: string | null
}

type Meta = { total: number; page: number; limit: number; total_pages: number }

/* ─── Helpers ─── */
const LEVELS = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
  { value: 'all_levels', label: 'Todos los niveles' },
]
const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'popular', label: 'Más populares' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
]

function levelLabel(v: string) { return LEVELS.find(l => l.value === v)?.label ?? v }

function CourseCard({ course }: { course: Course }) {
  const price = Number(course.sale_price ?? course.list_price)
  const originalPrice = course.sale_price ? Number(course.list_price) : null
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0
  return (
    <Link href={`/cursos/${course.slug}`} className="group">
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5">
        <div className="relative aspect-video bg-muted overflow-hidden">
          {course.cover_url ? (
            <img src={course.cover_url} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-accent/20">
              <FaGraduationCap className="h-12 w-12 text-primary/30" />
            </div>
          )}
          {course.is_bestseller && (
            <Badge className="absolute top-2 left-2 bg-brand-orange text-white border-0 text-xs">Bestseller</Badge>
          )}
          {course.is_new && !course.is_bestseller && (
            <Badge className="absolute top-2 left-2 bg-brand-green text-white border-0 text-xs">Nuevo</Badge>
          )}
          {discount > 0 && (
            <Badge className="absolute top-2 right-2 bg-destructive text-white border-0 text-xs">-{discount}%</Badge>
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
          <div className="flex items-center gap-1 text-xs">
            <span className="font-bold text-brand-orange">{Number(course.rating_avg).toFixed(1)}</span>
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <FaStar key={i} className={`h-3 w-3 ${i < Math.round(Number(course.rating_avg)) ? 'text-brand-orange' : 'text-muted-foreground/30'}`} />
              ))}
            </div>
            <span className="text-muted-foreground">({course.rating_count.toLocaleString()})</span>
          </div>
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
                <FaCertificate className="h-3 w-3" />Certificado
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">{levelLabel(course.level)}</Badge>
          </div>
          <div className="mt-auto flex items-center gap-2 pt-2 border-t">
            {course.is_free ? (
              <span className="text-lg font-bold text-brand-green">Gratis</span>
            ) : (
              <>
                <span className="text-lg font-bold text-primary">{formatCurrency(price, course.currency)}</span>
                {originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">{formatCurrency(originalPrice, course.currency)}</span>
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
  filters, onChange,
}: { filters: Record<string, string>; onChange: (k: string, v: string) => void }) {
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
                onCheckedChange={c => onChange('level', c ? l.value : '')}
              />
              <Label htmlFor={`level-${l.value}`} className="text-sm cursor-pointer">{l.label}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <h4 className="font-semibold mb-3 text-sm">Precio</h4>
        <div className="flex flex-col gap-2">
          {[
            { value: 'free', label: 'Gratis' },
            { value: 'paid', label: 'De pago' },
          ].map(o => (
            <div key={o.value} className="flex items-center gap-2">
              <Checkbox
                id={`price-${o.value}`}
                checked={filters.price === o.value}
                onCheckedChange={c => onChange('price', c ? o.value : '')}
              />
              <Label htmlFor={`price-${o.value}`} className="text-sm cursor-pointer">{o.label}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <h4 className="font-semibold mb-3 text-sm">Características</h4>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="cert"
              checked={filters.has_certificate === 'true'}
              onCheckedChange={c => onChange('has_certificate', c ? 'true' : '')}
            />
            <Label htmlFor="cert" className="text-sm cursor-pointer">Con certificado</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="best"
              checked={filters.is_bestseller === 'true'}
              onCheckedChange={c => onChange('is_bestseller', c ? 'true' : '')}
            />
            <Label htmlFor="best" className="text-sm cursor-pointer">Bestsellers</Label>
          </div>
        </div>
      </div>
      {Object.values(filters).some(v => !!v) && (
        <>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            onClick={() => ['level', 'price', 'has_certificate', 'is_bestseller'].forEach(k => onChange(k, ''))}
          >
            <FaTimes className="h-3 w-3 mr-2" />Limpiar filtros
          </Button>
        </>
      )}
    </div>
  )
}

/* ─── Main page ─── */
export default function CategoriaPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [category, setCategory] = useState<Category | null>(null)
  const [catLoading, setCatLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('newest')
  const [filters, setFilters] = useState<Record<string, string>>({
    level: '', price: '', has_certificate: '', is_bestseller: '',
  })

  /* Load category */
  useEffect(() => {
    fetch(`/api/v1/categories/slug/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.success) setCategory(d.data) })
      .finally(() => setCatLoading(false))
  }, [slug])

  /* Load courses */
  const fetchCourses = useCallback(async (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ category: slug, page: String(p), limit: '12', sort })
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
  }, [slug, q, sort, filters])

  useEffect(() => {
    if (category) fetchCourses(1)
  }, [category, fetchCourses])

  function handleFilterChange(key: string, val: string) {
    setFilters(prev => ({ ...prev, [key]: val }))
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  if (catLoading) return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-8 w-64 mb-4" />
      <Skeleton className="h-4 w-full max-w-2xl mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }, (_, i) => <CourseSkeleton key={i} />)}
      </div>
    </div>
  )

  if (!category) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-lg font-semibold text-muted-foreground">Categoría no encontrada.</p>
      <Button asChild className="mt-4"><Link href="/cursos">Ver todos los cursos</Link></Button>
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div
        className="relative bg-linear-to-br from-primary/90 to-primary text-white py-14"
        style={category.image_url ? { backgroundImage: `url(${category.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {category.image_url && <div className="absolute inset-0 bg-primary/80" />}
        <div className="relative container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <Link href="/" className="hover:text-white">Inicio</Link>
            <FaChevronRight className="h-3 w-3" />
            <Link href="/cursos" className="hover:text-white">Cursos</Link>
            <FaChevronRight className="h-3 w-3" />
            <span className="text-white">{category.name}</span>
          </nav>
          <div className="flex items-center gap-4">
            {category.icon && <span className="text-4xl">{category.icon}</span>}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
              {category.description && (
                <p className="text-white/80 mt-2 max-w-2xl">{category.description}</p>
              )}
              {meta && (
                <p className="text-white/60 text-sm mt-2">{meta.total.toLocaleString()} cursos disponibles</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Buscar en ${category.name}…`}
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchCourses(1)}
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={v => setSort(v)}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 shrink-0 sm:w-auto">
                <FaFilter className="h-3.5 w-3.5" />
                Filtros
                {activeFilterCount > 0 && (
                  <Badge className="h-4 w-4 p-0 text-[10px] flex items-center justify-center bg-primary text-primary-foreground">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtrar cursos</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterPanel filters={filters} onChange={handleFilterChange} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Grid */}
        {loading && courses.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => <CourseSkeleton key={i} />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FaGraduationCap className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No hay cursos en esta categoría</h2>
            <p className="text-muted-foreground mb-4">Prueba cambiando los filtros o busca algo diferente.</p>
            <Button asChild><Link href="/cursos">Ver todos los cursos</Link></Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {courses.map(c => <CourseCard key={c.id} course={c} />)}
              {loading && Array.from({ length: 4 }, (_, i) => <CourseSkeleton key={`sk-${i}`} />)}
            </div>

            {meta && page < meta.total_pages && !loading && (
              <div className="flex justify-center mt-10">
                <Button onClick={() => fetchCourses(page + 1)} variant="outline" size="lg">
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
