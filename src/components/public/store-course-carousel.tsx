'use client'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/free-mode'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, FreeMode } from 'swiper/modules'
import Link from 'next/link'
import { FaStar, FaClock, FaCertificate, FaUsers, FaFire, FaBookOpen, FaPlay } from 'react-icons/fa'
import { formatCurrency, durationLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'

export type CourseSlide = {
  id: number; name: string; slug: string; cover_url?: string | null; level: string
  duration_hours?: string | null; list_price: string; sale_price?: string | null
  is_free: boolean; currency: string; rating_avg: string; rating_count: number
  total_students: number; has_certificate: boolean; is_bestseller: boolean; is_new?: boolean
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Principiante', intermediate: 'Intermedio',
  advanced: 'Avanzado', all_levels: 'Todos',
}

function CourseCard({ course }: { course: CourseSlide }) {
  const price = Number(course.sale_price ?? course.list_price)
  const originalPrice = course.sale_price ? Number(course.list_price) : null
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0
  const ratingNum = Number(course.rating_avg)

  return (
    <Link href={`/cursos/${course.slug}`} className="group block h-full">
      <div className="relative flex flex-col h-full rounded-2xl overflow-hidden border border-border/40 bg-card shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5">

        {/* Thumbnail */}
        <div className="relative h-44 overflow-hidden bg-muted shrink-0">
          {course.cover_url
            ? <img src={course.cover_url} alt={course.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
            : <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-primary/10 to-brand-purple/10">
                <FaBookOpen className="h-10 w-10 text-muted-foreground/25" />
              </div>
          }
          {/* gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <FaPlay className="h-4 w-4 text-primary translate-x-0.5" />
            </div>
          </div>

          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {course.is_bestseller && (
              <span className="flex items-center gap-1 bg-brand-orange text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                <FaFire className="h-2.5 w-2.5" /> Bestseller
              </span>
            )}
            {course.is_new && (
              <span className="bg-brand-green text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">Nuevo</span>
            )}
          </div>

          {/* Price top-right */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
            {course.is_free
              ? <span className="bg-brand-green text-white font-bold text-sm px-3 py-1 rounded-xl shadow-md">Gratis</span>
              : <>
                  <span className="bg-white text-primary font-bold text-sm px-3 py-1 rounded-xl shadow-md leading-tight">
                    {formatCurrency(price, course.currency)}
                  </span>
                  {discount >= 10 && (
                    <span className="bg-destructive text-white text-xs font-bold px-2 py-0.5 rounded-lg shadow">-{discount}%</span>
                  )}
                </>
            }
          </div>

          {/* Certificate badge bottom */}
          {course.has_certificate && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-brand-purple/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
              <FaCertificate className="h-3 w-3" /> Certificado
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 gap-2.5">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {course.name}
          </h3>

          {/* Stars + count */}
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <FaStar key={i} className={cn('h-3 w-3', i <= Math.round(ratingNum) ? 'text-brand-orange' : 'text-muted-foreground/20')} />
              ))}
            </div>
            <span className="text-xs font-bold text-brand-orange">{ratingNum.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({course.rating_count.toLocaleString()})</span>
          </div>

          {/* Footer meta */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-2.5 border-t border-border/50">
            {course.duration_hours && (
              <span className="flex items-center gap-1">
                <FaClock className="h-3 w-3" />
                {durationLabel(Number(course.duration_hours))}
              </span>
            )}
            <span className="flex items-center gap-1">
              <FaUsers className="h-3 w-3" />
              {course.total_students.toLocaleString()}
            </span>
            <span className="ml-auto bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 font-medium text-xs">
              {LEVEL_LABELS[course.level] ?? course.level}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function StoreCourseCarousel({ courses }: { courses: CourseSlide[] }) {
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center gap-3">
        <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center">
          <FaBookOpen className="h-9 w-9 text-muted-foreground/25" />
        </div>
        <p className="text-muted-foreground font-medium">Esta tienda aún no tiene cursos publicados</p>
      </div>
    )
  }

  return (
    <Swiper
      modules={[Navigation, Pagination, FreeMode]}
      spaceBetween={20}
      slidesPerView={1.15}
      breakpoints={{
        480: { slidesPerView: 1.5, spaceBetween: 16 },
        640: { slidesPerView: 2, spaceBetween: 20 },
        900: { slidesPerView: 2.5, spaceBetween: 20 },
        1200: { slidesPerView: 3, spaceBetween: 24 },
      }}
      navigation
      pagination={{ clickable: true }}
      freeMode
      className="!pb-12 store-swiper"
    >
      {courses.map(c => (
        <SwiperSlide key={c.id} className="!h-auto">
          <CourseCard course={c} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
