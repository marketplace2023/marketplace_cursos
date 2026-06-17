import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function formatCurrency(amount: number | string, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount))
}

export function formatDate(date: Date | string | null | undefined, locale = 'es-US'): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date))
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}…` : str
}

export function generateCode(prefix = '', length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const rand = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return prefix ? `${prefix}-${rand}` : rand
}

export function ratingStars(rating: number): string {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))
}

export function durationLabel(hours: number | string): string {
  const h = Number(hours)
  if (h < 1) return `${Math.round(h * 60)} min`
  if (Number.isInteger(h)) return `${h}h`
  const hh = Math.floor(h)
  const m = Math.round((h - hh) * 60)
  return m > 0 ? `${hh}h ${m}min` : `${hh}h`
}
