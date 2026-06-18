'use client'

import Link from 'next/link'
import {
  FaGraduationCap, FaStar, FaCertificate, FaClock, FaUsers,
} from 'react-icons/fa'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, durationLabel } from '@/lib/utils'

export type CourseCardData = {
  id: number
  name: string
  slug: string
  cover_url?: string | null
  level: string
  modality?: string | null
  duration_hours?: string | null
  list_price: string
  sale_price?: string | null
  is_free: boolean
  currency: string
  rating_avg: string
  rating_count: number
  total_students: number
  has_certificate: boolean
  is_bestseller: boolean
  is_new: boolean
  store_name?: string | null
  store_slug?: string | null
  instructor_name?: string | null
}

const LEVELS = [
  { value: 'beginner',      label: 'Principiante' },
  { value: 'intermediate',  label: 'Intermedio' },
  { value: 'advanced',      label: 'Avanzado' },
  { value: 'all_levels',    label: 'Todos los niveles' },
]

function levelLabel(v: string) {
  return LEVELS.find(l => l.value === v)?.label ?? v
}

interface CourseCardProps {
  course: CourseCardData
  showModality?: boolean
}

export function CourseCard({ course, showModality = false }: CourseCardProps) {
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

          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">{levelLabel(course.level)}</Badge>
            {showModality && course.modality && (
              <Badge variant="secondary" className="text-xs capitalize">
                {course.modality.replace('_', ' ')}
              </Badge>
            )}
          </div>

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

export function CourseSkeleton() {
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
