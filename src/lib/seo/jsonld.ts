const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: process.env.NEXT_PUBLIC_APP_NAME ?? 'EduMarket',
    url: BASE,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/buscar?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: process.env.NEXT_PUBLIC_APP_NAME ?? 'EduMarket',
    url: BASE,
    logo: `${BASE}/logo.png`,
    sameAs: [],
  }
}

interface CourseJsonLdOptions {
  name: string
  description?: string | null
  slug: string
  cover_url?: string | null
  list_price: string | number
  sale_price?: string | number | null
  currency?: string | null
  rating_avg?: string | number | null
  rating_count?: number | null
  duration_hours?: string | number | null
  level?: string | null
  language?: string | null
  instructor_name?: string | null
  store_name?: string | null
  store_slug?: string | null
  published_at?: Date | string | null
  updated_at?: Date | string | null
}

export function courseJsonLd(c: CourseJsonLdOptions) {
  const url = `${BASE}/cursos/${c.slug}`
  const price = Number(c.sale_price ?? c.list_price)
  const currency = c.currency ?? 'USD'

  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: c.name,
    url,
    description: c.description ?? undefined,
    image: c.cover_url ?? undefined,
    inLanguage: c.language ?? 'es',
    coursePrerequisites: [],
    offers: {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      url,
      ...(c.sale_price ? {
        priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      } : {}),
    },
    provider: c.store_name ? {
      '@type': 'Organization',
      name: c.store_name,
      sameAs: c.store_slug ? `${BASE}/tiendas/${c.store_slug}` : undefined,
    } : undefined,
    instructor: c.instructor_name ? {
      '@type': 'Person',
      name: c.instructor_name,
    } : undefined,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      ...(c.duration_hours ? {
        courseWorkload: `PT${Number(c.duration_hours)}H`,
      } : {}),
    },
  }

  if (c.rating_avg && c.rating_count && Number(c.rating_count) > 0) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(c.rating_avg).toFixed(1),
      reviewCount: c.rating_count,
      bestRating: '5',
      worstRating: '1',
    }
  }

  if (c.level) {
    const LEVEL_MAP: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      all_levels: 'All Levels',
    }
    ld.educationalLevel = LEVEL_MAP[c.level] ?? c.level
  }

  return ld
}

interface StoreJsonLdOptions {
  name: string
  description?: string | null
  slug: string
  logo_url?: string | null
  cover_url?: string | null
  email?: string | null
  phone?: string | null
  city?: string | null
  country?: string | null
  rating_avg?: string | number | null
  rating_count?: number | null
  store_type?: string | null
}

export function storeJsonLd(s: StoreJsonLdOptions) {
  const url = `${BASE}/tiendas/${s.slug}`

  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['EducationalOrganization', 'LocalBusiness'],
    name: s.name,
    url,
    description: s.description ?? undefined,
    image: s.logo_url ?? s.cover_url ?? undefined,
    email: s.email ?? undefined,
    telephone: s.phone ?? undefined,
    address: (s.city || s.country) ? {
      '@type': 'PostalAddress',
      addressLocality: s.city ?? undefined,
      addressCountry: s.country ?? undefined,
    } : undefined,
  }

  if (s.rating_avg && s.rating_count && Number(s.rating_count) > 0) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(s.rating_avg).toFixed(1),
      reviewCount: s.rating_count,
      bestRating: '5',
      worstRating: '1',
    }
  }

  return ld
}

interface InstructorJsonLdOptions {
  name: string
  headline?: string | null
  avatar_url?: string | null
  bio?: string | null
  username?: string | null
  linkedin_url?: string | null
  rating_avg?: string | number | null
  rating_count?: number | null
}

export function instructorJsonLd(i: InstructorJsonLdOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: i.name,
    url: i.username ? `${BASE}/instructores/${i.username}` : undefined,
    image: i.avatar_url ?? undefined,
    description: i.headline ?? i.bio ?? undefined,
    jobTitle: 'Instructor',
    sameAs: i.linkedin_url ? [i.linkedin_url] : [],
    ...(i.rating_avg && i.rating_count && Number(i.rating_count) > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(i.rating_avg).toFixed(1),
        reviewCount: i.rating_count,
        bestRating: '5',
        worstRating: '1',
      },
    } : {}),
  }
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

import React from 'react'

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return React.createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  })
}
