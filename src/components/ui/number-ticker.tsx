'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface NumberTickerProps {
  value: number
  className?: string
  duration?: number
}

export function NumberTicker({ value, className, duration = 900 }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || value === 0) return
    let start: number | null = null

    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 4)
      el.textContent = Math.floor(eased * value).toString()
      if (p < 1) requestAnimationFrame(step)
      else el.textContent = value.toString()
    }

    requestAnimationFrame(step)
  }, [value, duration])

  return (
    <span ref={ref} className={cn(className)}>
      {value}
    </span>
  )
}
