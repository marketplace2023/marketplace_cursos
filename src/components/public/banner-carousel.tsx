'use client'

import { useState, useEffect, useCallback } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const BANNERS = [
  { src: '/logo_banner.jpg',   alt: 'Banner 1' },
  { src: '/logo_banner_2.png', alt: 'Banner 2' },
]

export function HeroBanner({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent(c => (c + 1) % BANNERS.length), [])
  const prev = useCallback(() => setCurrent(c => (c - 1 + BANNERS.length) % BANNERS.length), [])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [paused, next])

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background slides */}
      <div className="absolute inset-0">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {BANNERS.map((b, i) => (
            <img
              key={i}
              src={b.src}
              alt={b.alt}
              className="h-full w-full shrink-0 object-cover object-center"
              draggable={false}
            />
          ))}
        </div>
        {/* Dark overlay so text stays readable */}
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* Content on top */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
        aria-label="Anterior"
      >
        <FaChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
        aria-label="Siguiente"
      >
        <FaChevronRight className="h-4 w-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 flex gap-2">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
