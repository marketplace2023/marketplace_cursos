'use client'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/free-mode'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, FreeMode, Autoplay } from 'swiper/modules'
import Link from 'next/link'
import { FaStar, FaClock, FaUsers, FaFire, FaGraduationCap, FaCheckCircle, FaStore, FaArrowRight } from 'react-icons/fa'

/* ─── Course Carousel ─── */
type HomeCourse = {
  id: number; title: string; instructor: string; store: string; slug: string
  rating: number; reviews: number; price: number; originalPrice: number
  duration: string; level: string; cover: string; badge: string
}

function HomeCourseCard({ course }: { course: HomeCourse }) {
  const discount = Math.round((1 - course.price / course.originalPrice) * 100)
  return (
    <Link href={`/cursos/${course.slug}`} className="group block h-full">
      <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-border/40 bg-card shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5">
        <div className="relative h-44 overflow-hidden bg-muted shrink-0">
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/10 to-brand-purple/15">
            <FaGraduationCap className="h-14 w-14 text-primary/15 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
          {course.badge && (
            <span className={`absolute top-3 left-3 flex items-center gap-1 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md ${
              course.badge === 'Bestseller' ? 'bg-brand-orange' :
              course.badge === 'Nuevo' ? 'bg-brand-green' : 'bg-primary'
            }`}>
              {course.badge === 'Bestseller' && <FaFire className="h-2.5 w-2.5" />}
              {course.badge}
            </span>
          )}
          <div className="absolute top-3 right-3">
            <span className="bg-white text-primary font-bold text-sm px-2.5 py-1 rounded-xl shadow leading-tight">
              ${course.price}
            </span>
          </div>
          {discount >= 10 && (
            <span className="absolute bottom-3 right-3 bg-destructive text-white text-xs font-bold px-2 py-0.5 rounded-lg">-{discount}%</span>
          )}
        </div>
        <div className="flex flex-col flex-1 p-4 gap-2">
          <p className="text-xs text-muted-foreground font-medium">{course.store}</p>
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
          <p className="text-xs text-muted-foreground">{course.instructor}</p>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <FaStar key={i} className={`h-3 w-3 ${i <= Math.round(course.rating) ? 'text-brand-orange' : 'text-muted-foreground/20'}`} />)}
            </div>
            <span className="font-bold text-brand-orange">{course.rating}</span>
            <span className="text-muted-foreground">({course.reviews.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-2.5 border-t border-border/50">
            <span className="flex items-center gap-1"><FaClock className="h-3 w-3" />{course.duration}</span>
            <span className="ml-auto bg-muted rounded-md px-1.5 py-0.5 font-medium">{course.level}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function HomeCourseCarousel({ courses }: { courses: HomeCourse[] }) {
  return (
    <Swiper
      modules={[Navigation, Pagination, FreeMode, Autoplay]}
      spaceBetween={20}
      slidesPerView={1.2}
      breakpoints={{ 480: { slidesPerView: 1.8 }, 640: { slidesPerView: 2.2 }, 900: { slidesPerView: 3 }, 1200: { slidesPerView: 4 } }}
      navigation pagination={{ clickable: true }} freeMode
      autoplay={{ delay: 4000, disableOnInteraction: true, pauseOnMouseEnter: true }}
      className="!pb-12 store-swiper"
    >
      {courses.map(c => (
        <SwiperSlide key={c.id} className="!h-auto"><HomeCourseCard course={c} /></SwiperSlide>
      ))}
    </Swiper>
  )
}

/* ─── Store Carousel ─── */
type HomeStore = {
  id: number; name: string; slug: string; category: string
  rating: number; courses: number; students: number; verified: boolean; logo: string
}

const STORE_COLORS = ['from-primary/15 to-brand-secondary/10', 'from-brand-green/15 to-brand-green/5', 'from-brand-purple/15 to-brand-purple/5', 'from-brand-orange/15 to-brand-orange/5']

function HomeStoreCard({ store, idx }: { store: HomeStore; idx: number }) {
  return (
    <Link href={`/tiendas/${store.slug}`} className="group block h-full">
      <div className={`flex flex-col h-full rounded-2xl border border-border/40 bg-linear-to-br ${STORE_COLORS[idx % 4]} p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-14 w-14 rounded-2xl bg-background shadow-md flex items-center justify-center shrink-0 ring-1 ring-border/30">
            {store.logo
              ? <img src={store.logo} alt={store.name} className="h-full w-full object-cover rounded-2xl" />
              : <FaStore className="h-7 w-7 text-muted-foreground/50" />
            }
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm leading-tight truncate group-hover:text-primary transition-colors">{store.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{store.category}</p>
          </div>
        </div>
        {store.verified && (
          <span className="flex items-center gap-1 text-xs font-semibold text-brand-green mb-3">
            <FaCheckCircle className="h-3 w-3" /> Verificada
          </span>
        )}
        <div className="flex items-center gap-1.5 mb-3">
          {[1,2,3,4,5].map(i => <FaStar key={i} className={`h-3.5 w-3.5 ${i <= Math.round(store.rating) ? 'text-brand-orange' : 'text-muted-foreground/20'}`} />)}
          <span className="text-xs font-bold text-brand-orange ml-0.5">{store.rating}</span>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
          <span className="flex items-center gap-1"><FaGraduationCap className="h-3 w-3" />{store.courses} cursos</span>
          <span className="flex items-center gap-1"><FaUsers className="h-3 w-3" />{store.students.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  )
}

export function HomeStoreCarousel({ stores }: { stores: HomeStore[] }) {
  return (
    <Swiper
      modules={[Navigation, Pagination, FreeMode]}
      spaceBetween={20}
      slidesPerView={1.2}
      breakpoints={{ 480: { slidesPerView: 1.6 }, 640: { slidesPerView: 2 }, 900: { slidesPerView: 3 }, 1200: { slidesPerView: 3 } }}
      navigation pagination={{ clickable: true }} freeMode
      className="!pb-12 store-swiper"
    >
      {stores.map((s, i) => (
        <SwiperSlide key={s.id} className="!h-auto"><HomeStoreCard store={s} idx={i} /></SwiperSlide>
      ))}
    </Swiper>
  )
}
