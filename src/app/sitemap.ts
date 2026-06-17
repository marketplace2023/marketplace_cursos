import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { product_template, marketplace_store, res_users, product_category } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/cursos`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/tiendas`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/instructores`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/buscar`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/planes`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.6 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/contacto`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/terminos`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacidad`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/reembolsos`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/empresas`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  try {
    const [courses, stores, instructors, categories] = await Promise.all([
      db.select({ slug: product_template.slug, updated_at: product_template.updated_at })
        .from(product_template)
        .where(eq(product_template.state, 'published')),

      db.select({ slug: marketplace_store.slug, updated_at: marketplace_store.updated_at })
        .from(marketplace_store)
        .where(eq(marketplace_store.state, 'active')),

      db.select({ username: res_users.username, updated_at: res_users.updated_at })
        .from(res_users)
        .where(and(eq(res_users.user_type, 'instructor'), eq(res_users.state, 'active'))),

      db.select({ slug: product_category.slug, updated_at: product_category.updated_at })
        .from(product_category)
        .where(eq(product_category.active, true)),
    ])

    const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
      url: `${BASE}/cursos/${c.slug}`,
      lastModified: c.updated_at,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    const storeRoutes: MetadataRoute.Sitemap = stores.map((s) => ({
      url: `${BASE}/tiendas/${s.slug}`,
      lastModified: s.updated_at,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    const instructorRoutes: MetadataRoute.Sitemap = instructors
      .filter((i) => i.username)
      .map((i) => ({
        url: `${BASE}/instructores/${i.username}`,
        lastModified: i.updated_at,
        changeFrequency: 'monthly',
        priority: 0.6,
      }))

    const categoryRoutes: MetadataRoute.Sitemap = categories
      .filter((c) => c.slug)
      .map((c) => ({
        url: `${BASE}/categorias/${c.slug}`,
        lastModified: c.updated_at,
        changeFrequency: 'weekly',
        priority: 0.7,
      }))

    return [...staticRoutes, ...courseRoutes, ...storeRoutes, ...instructorRoutes, ...categoryRoutes]
  } catch {
    return staticRoutes
  }
}
