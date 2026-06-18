'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  FaSearch, FaStar, FaFilter, FaTimes, FaCheckCircle,
  FaStore, FaUsers, FaBookOpen, FaGlobe,
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const STORE_TYPES = [
  { value: 'academy', label: 'Academia' },
  { value: 'individual', label: 'Instructor independiente' },
  { value: 'corporate', label: 'Corporativa' },
  { value: 'government', label: 'Gobierno / institución' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'rating', label: 'Mejor valoradas' },
  { value: 'students', label: 'Más estudiantes' },
  { value: 'courses', label: 'Más cursos' },
  { value: 'name_asc', label: 'Nombre A-Z' },
]

type Store = {
  id: number
  name: string
  slug: string
  store_type: string
  description?: string
  logo_url?: string
  country?: string
  city?: string
  modality?: string
  total_courses: number
  total_students: number
  rating_avg: string
  rating_count: number
  is_verified: boolean
  owner_name?: string
}

type Meta = { total: number; page: number; limit: number; total_pages: number }

function StoreCard({ store }: { store: Store }) {
  const rating = Number(store.rating_avg ?? 0)
  const typeLabel = STORE_TYPES.find(t => t.value === store.store_type)?.label ?? store.store_type

  return (
    <Link href={`/tiendas/${store.slug}`} className="group block h-full">
      <div className="h-full rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col">
        <div className="h-1.5 w-full bg-linear-to-r from-brand-green to-brand-secondary" />
        <div className="p-5 flex flex-col gap-3 flex-1">
          {/* Logo + verified */}
          <div className="flex items-start gap-3">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-border/30 shadow-sm">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-14 w-14 object-cover" />
              ) : (
                <FaStore className="h-6 w-6 text-muted-foreground/50" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold truncate group-hover:text-primary transition-colors">
                  {store.name}
                </h3>
                {store.is_verified && (
                  <FaCheckCircle className="h-3.5 w-3.5 shrink-0 text-brand-green" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{typeLabel}</p>
              {(store.city || store.country) && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <FaGlobe className="h-3 w-3" />
                  {[store.city, store.country].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {store.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{store.description}</p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs">
            <span className="font-bold text-brand-orange">{rating.toFixed(1)}</span>
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <FaStar key={i} className={`h-3 w-3 ${i < Math.round(rating) ? 'text-brand-orange' : 'text-muted-foreground/30'}`} />
              ))}
            </div>
            <span className="text-muted-foreground">({store.rating_count.toLocaleString()})</span>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-xs text-muted-foreground border-t border-border/50 pt-3 mt-auto">
            <span className="flex items-center gap-1">
              <FaBookOpen className="h-3 w-3 text-primary" />
              {store.total_courses} cursos
            </span>
            <span className="flex items-center gap-1">
              <FaUsers className="h-3 w-3 text-brand-green" />
              {store.total_students.toLocaleString()} estudiantes
            </span>
            {store.is_verified && (
              <span className="ml-auto text-brand-green font-semibold flex items-center gap-1">
                <FaCheckCircle className="h-3 w-3" /> Verificada
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function StoreSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex gap-3">
          <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  )
}

function FilterPanel({ filters, onChange }: { filters: Record<string, string>; onChange: (k: string, v: string) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="font-semibold mb-3 text-sm">Tipo de academia</h4>
        <div className="flex flex-col gap-2">
          {STORE_TYPES.map(t => (
            <div key={t.value} className="flex items-center gap-2">
              <Checkbox
                id={`type-${t.value}`}
                checked={filters.type === t.value}
                onCheckedChange={c => onChange('type', c ? t.value : '')}
              />
              <Label htmlFor={`type-${t.value}`} className="text-sm cursor-pointer">{t.label}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <h4 className="font-semibold mb-3 text-sm">Verificación</h4>
        <div className="flex items-center gap-2">
          <Checkbox
            id="verified"
            checked={filters.verified === '1'}
            onCheckedChange={c => onChange('verified', c ? '1' : '')}
          />
          <Label htmlFor="verified" className="text-sm cursor-pointer">Solo verificadas</Label>
        </div>
      </div>
    </div>
  )
}

export default function TiendasPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, string>>({ type: '', verified: '' })

  const fetchStores = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ sort, page: String(page) })
    if (query) params.set('q', query)
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    try {
      const res = await fetch(`/api/v1/stores?${params}`)
      const data = await res.json()
      if (data.success) { setStores(data.data); setMeta(data.meta as Meta) }
    } finally { setLoading(false) }
  }, [query, sort, filters, page])

  useEffect(() => { fetchStores() }, [fetchStores])

  function handleFilterChange(k: string, v: string) { setFilters(f => ({ ...f, [k]: v })); setPage(1) }

  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-linear-to-br from-brand-green via-[#168a4a] to-primary text-white py-16">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-16 h-48 w-48 rounded-full bg-brand-orange/10 blur-3xl" />
        <div className="relative container mx-auto px-4">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
              <FaStore className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading">Academias y Tiendas</h1>
              <p className="text-white/75 mt-1.5">Descubre academias verificadas con cursos de alta calidad</p>
              {meta && (
                <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium mt-2">
                  <FaStore className="h-3 w-3 text-brand-orange" />
                  {meta.total.toLocaleString()} academias disponibles
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">

      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={e => { e.preventDefault(); fetchStores() }} className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar academia o instructor…" className="pl-9" />
        </form>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 lg:hidden">
                <FaFilter className="h-4 w-4" />
                Filtros
                {activeCount > 0 && <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">{activeCount}</Badge>}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader><SheetTitle>Filtros</SheetTitle></SheetHeader>
              <div className="mt-6"><FilterPanel filters={filters} onChange={handleFilterChange} /></div>
            </SheetContent>
          </Sheet>
          <Select value={sort} onValueChange={v => { setSort(v); setPage(1) }}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.type && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {STORE_TYPES.find(t => t.value === filters.type)?.label}
              <button onClick={() => handleFilterChange('type', '')} className="ml-1 hover:text-destructive"><FaTimes className="h-3 w-3" /></button>
            </Badge>
          )}
          {filters.verified && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Solo verificadas
              <button onClick={() => handleFilterChange('verified', '')} className="ml-1 hover:text-destructive"><FaTimes className="h-3 w-3" /></button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => { setFilters({ type: '', verified: '' }); setPage(1) }}>
            Limpiar todo
          </Button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <h3 className="font-semibold mb-4">Filtros</h3>
            <FilterPanel filters={filters} onChange={handleFilterChange} />
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <StoreSkeleton key={i} />)}
            </div>
          ) : stores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FaStore className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron academias</h3>
              <p className="text-muted-foreground mb-4">Intenta con otros filtros</p>
              <Button variant="outline" onClick={() => { setQuery(''); setFilters({ type: '', verified: '' }); setPage(1) }}>Limpiar búsqueda</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {stores.map(s => <StoreCard key={s.id} store={s} />)}
              </div>
              {meta && meta.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                  <span className="text-sm text-muted-foreground">Página {meta.page} de {meta.total_pages}</span>
                  <Button variant="outline" disabled={page >= meta.total_pages} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}
