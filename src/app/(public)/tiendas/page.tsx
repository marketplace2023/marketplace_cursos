'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  FaSearch, FaStar, FaTimes, FaCheckCircle,
  FaStore, FaUsers, FaBookOpen, FaGlobe,
  FaMapMarkerAlt, FaMap, FaList, FaChevronDown, FaSlidersH,
} from 'react-icons/fa'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { StoreCoord } from '@/components/map/stores-map'

const StoresMap = dynamic(() => import('@/components/map/stores-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-[#f4f4f0]">
      <div className="flex flex-col items-center gap-3 text-muted-foreground/40">
        <FaMapMarkerAlt className="h-8 w-8 animate-pulse" />
        <span className="text-xs tracking-widest uppercase">Cargando mapa…</span>
      </div>
    </div>
  ),
})

/* ── Types ── */
type StoreRow = StoreCoord & {
  logo_url?: string; total_students: number
  lat: number | null; lng: number | null
}
type Meta = { total: number; page: number; limit: number; total_pages: number }
type Filters = {
  type: string; verified: string; modality: string; rating_min: string
}

/* ── Filter options (Yelp-style named categories) ── */
const TYPE_OPTS = [
  { value: '', label: 'Tipo' },
  { value: 'academy',    label: 'Academia' },
  { value: 'individual', label: 'Instructor independiente' },
  { value: 'corporate',  label: 'Corporativa' },
  { value: 'government', label: 'Institución' },
]

const RATING_OPTS = [
  { value: '',    label: 'Valoración' },
  { value: '4.5', label: '4.5★ y más' },
  { value: '4.0', label: '4.0★ y más' },
  { value: '3.5', label: '3.5★ y más' },
  { value: '3.0', label: '3.0★ y más' },
]

const MODALITY_OPTS = [
  { value: '',           label: 'Modalidad' },
  { value: 'online',     label: 'En línea' },
  { value: 'presential', label: 'Presencial' },
  { value: 'hybrid',     label: 'Híbrida' },
]

const SORT_OPTS = [
  { value: 'newest',   label: 'Más recientes' },
  { value: 'rating',   label: 'Mejor valoradas' },
  { value: 'students', label: 'Más estudiantes' },
  { value: 'courses',  label: 'Más cursos' },
  { value: 'name_asc', label: 'A–Z' },
]

/* ── Yelp-style dropdown filter button ── */
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
  const displayLabel = isActive ? options.find(o => o.value === value)?.label ?? label : label

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(v => !v)}
        className={`
          inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium
          border transition-all duration-150 whitespace-nowrap
          ${isActive
            ? 'bg-primary text-white border-primary shadow-sm'
            : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted/40'
          }
        `}
      >
        {displayLabel}
        {isActive
          ? <FaTimes className="h-3 w-3 ml-0.5 opacity-80" onClick={e => { e.stopPropagation(); onChange(''); setOpen(false) }} />
          : <FaChevronDown className={`h-2.5 w-2.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        }
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-50 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden min-w-50">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`
                w-full text-left px-4 py-2.5 text-sm transition-colors
                ${value === opt.value
                  ? 'font-semibold text-primary bg-primary/5'
                  : opt.value === ''
                    ? 'text-muted-foreground hover:bg-muted/50'
                    : 'text-foreground hover:bg-muted/50'
                }
              `}
            >
              {opt.value === '' && value !== '' ? `Todos (limpiar)` : opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Store row — open editorial layout ── */
function StoreRow({
  store, index, isActive, isHovered, hasCoords,
  onHover, onClick, rowRef,
}: {
  store: StoreRow; index: number
  isActive: boolean; isHovered: boolean; hasCoords: boolean
  onHover: (id: number | null) => void
  onClick: (id: number) => void
  rowRef: (el: HTMLDivElement | null) => void
}) {
  const rating = Number(store.rating_avg ?? 0)
  const typeLabel = TYPE_OPTS.find(t => t.value === store.store_type)?.label ?? store.store_type
  const location = [store.city, store.country].filter(Boolean).join(', ')
  const num = String(index).padStart(2, '0')

  return (
    <div
      ref={rowRef}
      onClick={() => hasCoords && onClick(store.id)}
      onMouseEnter={() => hasCoords && onHover(store.id)}
      onMouseLeave={() => onHover(null)}
      className={`
        group relative flex items-start gap-4 px-4 py-4
        border-b border-border/20 last:border-0
        transition-all duration-150 ease-out
        ${hasCoords ? 'cursor-pointer' : ''}
        ${isActive
          ? 'bg-primary/[.038] border-l-[3px] border-l-primary pl-3.25'
          : 'bg-transparent hover:bg-muted/35'
        }
      `}
    >
      {/* Index */}
      <div className={`
        shrink-0 w-7 h-7 rounded-full flex items-center justify-center
        text-[11px] font-bold transition-all duration-150
        ${isActive ? 'bg-brand-orange text-white shadow-sm scale-110'
          : isHovered ? 'bg-primary text-white'
          : 'bg-muted/70 text-muted-foreground'}
      `}>{num}</div>

      {/* Main content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Link
            href={`/tiendas/${store.slug}`}
            onClick={e => e.stopPropagation()}
            className={`font-semibold text-[15px] leading-snug truncate transition-colors
              ${isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}
          >
            {store.name}
          </Link>
          {store.is_verified && <FaCheckCircle className="h-3.5 w-3.5 text-brand-green shrink-0" />}
        </div>

        <p className="text-[11px] tracking-wide uppercase text-muted-foreground/60 font-medium mb-2">
          {typeLabel}{location && <> &middot; {location}</>}
        </p>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <span className="text-brand-orange font-semibold text-xs">{rating.toFixed(1)}</span>
            <FaStar className="h-2.5 w-2.5 text-brand-orange/80" />
            <span className="opacity-60">({store.rating_count})</span>
          </span>
          <span className="flex items-center gap-1 opacity-70">
            <FaBookOpen className="h-2.5 w-2.5" />{store.total_courses} cursos
          </span>
          <span className="flex items-center gap-1 opacity-70">
            <FaUsers className="h-2.5 w-2.5" />{store.total_students.toLocaleString()} est.
          </span>
        </div>
      </div>

      {/* Logo */}
      <div className={`
        shrink-0 h-11 w-11 rounded-xl overflow-hidden border bg-muted
        flex items-center justify-center transition-all duration-150
        ${isActive ? 'border-primary/30 shadow-sm' : 'border-border/40 group-hover:border-border/70'}
      `}>
        {store.logo_url
          ? <img src={store.logo_url} alt={store.name} className="h-11 w-11 object-cover" />
          : <FaStore className="h-4 w-4 text-muted-foreground/25" />}
      </div>
    </div>
  )
}

/* ── Skeleton ── */
function SkeletonRow() {
  return (
    <div className="flex items-start gap-4 px-4 py-4 border-b border-border/20">
      <Skeleton className="w-7 h-7 rounded-full shrink-0 mt-0.5" />
      <div className="flex-1 flex flex-col gap-2 pt-0.5">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-2.5 w-28" />
        <Skeleton className="h-2.5 w-36" />
      </div>
      <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
    </div>
  )
}

/* ── Page ── */
export default function TiendasPage() {
  const [stores, setStores] = useState<StoreRow[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Filters>({ type: '', verified: '', modality: '', rating_min: '' })
  const [activeId, setActiveId] = useState<number | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')

  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const storesOnMap = stores.filter(s => s.lat != null && s.lng != null) as (StoreRow & { lat: number; lng: number })[]
  const fitKey = storesOnMap.map(s => s.id).join(',')

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (query ? 1 : 0)

  const fetchStores = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ sort, page: String(page) })
    if (query) p.set('q', query)
    if (filters.type) p.set('type', filters.type)
    if (filters.verified) p.set('verified', filters.verified)
    if (filters.modality) p.set('modality', filters.modality)
    if (filters.rating_min) p.set('rating_min', filters.rating_min)
    try {
      const res = await fetch(`/api/v1/stores?${p}`)
      const d = await res.json()
      if (d.success) { setStores(d.data); setMeta(d.meta as Meta) }
    } finally { setLoading(false) }
  }, [query, sort, filters, page])

  useEffect(() => { fetchStores() }, [fetchStores])

  function setFilter(k: keyof Filters, v: string) {
    setFilters(f => ({ ...f, [k]: v })); setPage(1); setActiveId(null)
  }
  function clearAll() {
    setFilters({ type: '', verified: '', modality: '', rating_min: '' }); setQuery(''); setPage(1); setActiveId(null)
  }

  function onMarkerClick(id: number) {
    setActiveId(prev => prev === id ? null : id)
    cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    if (mobileView === 'map') setMobileView('list')
  }

  /* Active filter pills (shown below filter bar) */
  const activeChips: { label: string; clear: () => void }[] = []
  if (filters.type) activeChips.push({ label: TYPE_OPTS.find(o => o.value === filters.type)?.label ?? '', clear: () => setFilter('type', '') })
  if (filters.rating_min) activeChips.push({ label: `${filters.rating_min}★ y más`, clear: () => setFilter('rating_min', '') })
  if (filters.modality) activeChips.push({ label: MODALITY_OPTS.find(o => o.value === filters.modality)?.label ?? '', clear: () => setFilter('modality', '') })
  if (filters.verified) activeChips.push({ label: 'Verificadas', clear: () => setFilter('verified', '') })

  return (
    <div className="flex flex-col bg-background" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="h-0.5 w-full bg-linear-to-r from-brand-green via-primary to-brand-secondary shrink-0" />

      <div className="flex flex-1 overflow-hidden">

        {/* ══════ LEFT PANEL ══════ */}
        <div className={`
          flex flex-col overflow-hidden border-r border-border/30
          w-full lg:w-[42%] lg:flex-none
          ${mobileView === 'map' ? 'hidden lg:flex' : 'flex'}
        `}>

          {/* ── Search bar ── */}
          <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border/20 bg-background">
            <div className="flex items-center gap-2 mb-1">
              <form
                onSubmit={e => { e.preventDefault(); setPage(1); fetchStores() }}
                className="relative flex-1"
              >
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Busca academias, instructores…"
                  className="pl-9 h-10 text-[13px] rounded-full bg-muted/50 border-transparent focus:border-primary/30 focus:bg-background transition-all"
                />
                {query && (
                  <button type="button" onClick={() => { setQuery(''); setPage(1) }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground">
                    <FaTimes className="h-3 w-3" />
                  </button>
                )}
              </form>
              {/* Mobile map toggle */}
              <button
                className="lg:hidden shrink-0 flex items-center gap-1.5 h-10 px-3.5 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                onClick={() => setMobileView(v => v === 'list' ? 'map' : 'list')}
              >
                {mobileView === 'list' ? <FaMap className="h-3.5 w-3.5" /> : <FaList className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* ── Yelp-style filter bar ── */}
          <div className="shrink-0 border-b border-border/25 bg-background">
            {/* Filter pill row — horizontally scrollable */}
            <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto scrollbar-none">
              {/* Sort (always first, like Yelp's "Best Match") */}
              <FilterDropdown
                label="Ordenar"
                value={sort !== 'newest' ? sort : ''}
                options={[
                  { value: '', label: 'Ordenar' },
                  ...SORT_OPTS.map(o => ({ value: o.value, label: o.label })),
                ]}
                onChange={v => { setSort(v || 'newest'); setPage(1) }}
              />

              <div className="w-px h-5 bg-border/50 shrink-0" />

              <FilterDropdown
                label="Tipo"
                value={filters.type}
                options={TYPE_OPTS}
                onChange={v => setFilter('type', v)}
              />
              <FilterDropdown
                label="Valoración"
                value={filters.rating_min}
                options={RATING_OPTS}
                onChange={v => setFilter('rating_min', v)}
              />
              <FilterDropdown
                label="Modalidad"
                value={filters.modality}
                options={MODALITY_OPTS}
                onChange={v => setFilter('modality', v)}
              />

              {/* Verified — simple toggle pill */}
              <button
                onClick={() => setFilter('verified', filters.verified ? '' : '1')}
                className={`
                  inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium
                  border transition-all duration-150 whitespace-nowrap shrink-0
                  ${filters.verified
                    ? 'bg-brand-green text-white border-brand-green shadow-sm'
                    : 'bg-background text-foreground border-border hover:border-brand-green/50 hover:bg-muted/40'
                  }
                `}
              >
                <FaCheckCircle className="h-3 w-3" />
                Verificadas
                {filters.verified && <FaTimes className="h-3 w-3 ml-0.5 opacity-80" onClick={e => { e.stopPropagation(); setFilter('verified', '') }} />}
              </button>
            </div>

            {/* Active filter chips + result count */}
            {(activeChips.length > 0 || meta) && (
              <div className="flex items-center gap-2 px-4 pb-2.5 flex-wrap">
                {/* Result count */}
                {meta && !loading && (
                  <span className="text-[12px] text-muted-foreground shrink-0">
                    <span className="font-semibold text-foreground">{meta.total.toLocaleString()}</span>{' '}
                    academia{meta.total !== 1 ? 's' : ''}
                  </span>
                )}

                {activeChips.length > 0 && meta && (
                  <div className="w-px h-3.5 bg-border/50 shrink-0" />
                )}

                {/* Active filter chips */}
                {activeChips.map(chip => (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1 text-[11px] font-medium bg-primary/8 text-primary border border-primary/20 rounded-full px-2.5 py-0.5"
                  >
                    {chip.label}
                    <button onClick={chip.clear} className="hover:text-primary/60 transition-colors ml-0.5">
                      <FaTimes className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}

                {activeFilterCount > 1 && (
                  <button
                    onClick={clearAll}
                    className="text-[11px] text-muted-foreground hover:text-destructive transition-colors ml-auto"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Store list ── */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div>{Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)}</div>
            ) : stores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <FaSlidersH className="h-6 w-6 text-muted-foreground/30" />
                </div>
                <h3 className="font-semibold mb-1">Sin resultados</h3>
                <p className="text-sm text-muted-foreground mb-4">No hay academias con esos filtros</p>
                <Button size="sm" variant="outline" className="rounded-full" onClick={clearAll}>
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <>
                {activeId && (
                  <div className="px-4 py-2 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                    <span className="text-[11px] text-primary font-medium">Tienda marcada en el mapa</span>
                    <button onClick={() => setActiveId(null)} className="text-[11px] text-primary/60 hover:text-primary flex items-center gap-1">
                      <FaTimes className="h-2.5 w-2.5" /> Deseleccionar
                    </button>
                  </div>
                )}
                {stores.map((store, i) => (
                  <StoreRow
                    key={store.id}
                    store={store}
                    index={i + 1 + (page - 1) * 12}
                    isActive={activeId === store.id}
                    isHovered={hoveredId === store.id}
                    hasCoords={store.lat != null && store.lng != null}
                    onHover={setHoveredId}
                    onClick={id => setActiveId(prev => prev === id ? null : id)}
                    rowRef={el => { cardRefs.current[store.id] = el }}
                  />
                ))}
                {storesOnMap.length > 0 && storesOnMap.length < stores.length && (
                  <div className="px-4 py-3 text-[11px] text-muted-foreground/50 border-t border-border/15 flex items-center gap-2">
                    <FaGlobe className="h-2.5 w-2.5 shrink-0" />
                    {storesOnMap.length} de {stores.length} con ubicación en mapa
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Pagination ── */}
          {meta && meta.total_pages > 1 && (
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-t border-border/25 bg-background/95">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="text-[12px] text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                ← Anterior
              </button>
              <span className="text-[11px] text-muted-foreground tabular-nums">{meta.page} / {meta.total_pages}</span>
              <button disabled={page >= meta.total_pages} onClick={() => setPage(p => p + 1)}
                className="text-[12px] text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                Siguiente →
              </button>
            </div>
          )}
        </div>

        {/* ══════ RIGHT PANEL — map ══════ */}
        <div className={`
          flex-1 bg-muted/20 p-3
          ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}
          items-stretch
        `}>
          <div className="relative flex-1 overflow-hidden rounded-2xl border border-border/35 shadow-md">
            <StoresMap
              stores={storesOnMap}
              activeId={activeId}
              hoveredId={hoveredId}
              fitKey={fitKey}
              onMarkerClick={onMarkerClick}
            />
            {!loading && storesOnMap.length === 0 && stores.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-background/90 backdrop-blur-sm rounded-2xl px-6 py-5 shadow-xl text-center max-w-xs border border-border/30">
                  <FaMapMarkerAlt className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-medium mb-1">Sin ubicaciones</p>
                  <p className="text-xs text-muted-foreground">Las academias encontradas no tienen coordenadas</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
