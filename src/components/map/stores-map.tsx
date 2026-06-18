'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useMemo, useRef } from 'react'

export type StoreCoord = {
  id: number
  name: string
  slug: string
  store_type: string
  city?: string | null
  country?: string | null
  rating_avg: string
  rating_count: number
  total_courses: number
  is_verified: boolean
  lat: number
  lng: number
}

type Props = {
  stores: StoreCoord[]
  activeId: number | null
  hoveredId: number | null
  fitKey: string
  onMarkerClick: (id: number) => void
}

const TYPE_LABELS: Record<string, string> = {
  academy: 'Academia',
  individual: 'Instructor independiente',
  corporate: 'Corporativa',
  government: 'Institución',
}

function makeIcon(num: number, active: boolean, hovered: boolean) {
  const size = active ? 40 : hovered ? 34 : 30
  const bg = active ? '#F39C12' : hovered ? '#1E5AA8' : '#0B2E59'
  const fs = active ? 14 : 11
  const shadow = active
    ? '0 4px 16px rgba(243,156,18,.55), 0 2px 4px rgba(0,0,0,.2)'
    : hovered
      ? '0 4px 12px rgba(30,90,168,.45), 0 2px 4px rgba(0,0,0,.15)'
      : '0 2px 8px rgba(0,0,0,.25)'
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};
      border:2.5px solid rgba(255,255,255,0.95);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-weight:700;font-size:${fs}px;
      font-family:system-ui,sans-serif;
      box-shadow:${shadow};
      cursor:pointer;
      transition:all .18s cubic-bezier(.34,1.56,.64,1);
      letter-spacing:-0.3px;
    ">${num}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 8)],
  })
}

function StoreMarker({
  store, number, isActive, isHovered, onMarkerClick,
}: {
  store: StoreCoord
  number: number
  isActive: boolean
  isHovered: boolean
  onMarkerClick: (id: number) => void
}) {
  const markerRef = useRef<L.Marker>(null)
  const icon = useMemo(
    () => makeIcon(number, isActive, isHovered),
    [number, isActive, isHovered],
  )

  /* Open / close popup based on active state */
  useEffect(() => {
    const m = markerRef.current
    if (!m) return
    if (isActive) m.openPopup()
    else m.closePopup()
  }, [isActive])

  const rating = Number(store.rating_avg ?? 0).toFixed(1)
  const location = [store.city, store.country].filter(Boolean).join(', ')

  return (
    <Marker
      ref={markerRef}
      position={[store.lat, store.lng]}
      icon={icon}
      eventHandlers={{ click: () => onMarkerClick(store.id) }}
    >
      <Popup autoPan={false} closeButton>
        <div style={{ minWidth: 190, fontFamily: 'inherit' }}>
          <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 3px 0', color: '#0B2E59' }}>
            {store.name}
          </p>
          <p style={{ fontSize: 12, color: '#666', margin: '0 0 5px 0' }}>
            {TYPE_LABELS[store.store_type] ?? store.store_type}
            {location && <> · {location}</>}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 12 }}>
            <span style={{ color: '#F39C12', fontWeight: 700 }}>{rating} ★</span>
            <span style={{ color: '#999' }}>({store.rating_count})</span>
            <span style={{ color: '#555' }}>· {store.total_courses} cursos</span>
          </div>
          <a
            href={`/tiendas/${store.slug}`}
            style={{
              display: 'inline-block', padding: '5px 12px',
              background: '#0B2E59', color: '#fff',
              borderRadius: 6, fontSize: 12, textDecoration: 'none', fontWeight: 600,
            }}
          >
            Ver academia →
          </a>
        </div>
      </Popup>
    </Marker>
  )
}

/* Controls map view: pans to active store or fits all markers */
function PanController({
  stores, activeId, fitKey,
}: {
  stores: StoreCoord[]
  activeId: number | null
  fitKey: string
}) {
  const map = useMap()

  useEffect(() => {
    if (!activeId) return
    const s = stores.find(x => x.id === activeId)
    if (s) {
      map.panTo([s.lat, s.lng], { animate: true })
      if (map.getZoom() < 13) map.setZoom(13)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  useEffect(() => {
    if (activeId || !stores.length) return
    if (stores.length === 1) {
      map.setView([stores[0].lat, stores[0].lng], 13, { animate: true })
      return
    }
    const bounds = L.latLngBounds(stores.map(s => [s.lat, s.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [55, 55], animate: true, maxZoom: 14 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey])

  return null
}

export default function StoresMap({ stores, activeId, hoveredId, fitKey, onMarkerClick }: Props) {
  return (
    <MapContainer
      center={[4.711, -74.072]}
      zoom={5}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <PanController stores={stores} activeId={activeId} fitKey={fitKey} />
      {stores.map((store, i) => (
        <StoreMarker
          key={store.id}
          store={store}
          number={i + 1}
          isActive={activeId === store.id}
          isHovered={hoveredId === store.id}
          onMarkerClick={onMarkerClick}
        />
      ))}
    </MapContainer>
  )
}
