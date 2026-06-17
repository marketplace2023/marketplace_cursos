import {
  pgTable, serial, varchar, text, timestamp, boolean, integer, pgEnum, numeric
} from 'drizzle-orm/pg-core'
import { res_users } from './res-users'
import { marketplace_store } from './marketplace-store'
import { product_template } from './product-template'

/* ─── FUR-GBP ─── */
export const marketplace_fur_gbp = pgTable('marketplace_fur_gbp', {
  id: serial('id').primaryKey(),
  fur_code: varchar('fur_code', { length: 50 }).unique(),
  store_id: integer('store_id').references(() => marketplace_store.id).notNull(),
  commercial_name: varchar('commercial_name', { length: 200 }),
  legal_name: varchar('legal_name', { length: 200 }),
  entity_type: varchar('entity_type', { length: 80 }),
  description: text('description'),
  phone: varchar('phone', { length: 30 }),
  email: varchar('email', { length: 255 }),
  website: text('website'),
  gbp_url: text('gbp_url'),
  address: text('address'),
  country: varchar('country', { length: 2 }),
  state_province: varchar('state_province', { length: 100 }),
  city: varchar('city', { length: 100 }),
  zip: varchar('zip', { length: 20 }),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  service_area: text('service_area'), /* JSON */
  business_hours: text('business_hours'), /* JSON */
  modality: varchar('modality', { length: 50 }),
  languages: text('languages'), /* JSON */
  logo_url: text('logo_url'),
  cover_url: text('cover_url'),
  gallery: text('gallery'), /* JSON array of urls */
  rating: numeric('rating', { precision: 3, scale: 2 }),
  review_count: integer('review_count').default(0),
  verification_state: varchar('verification_state', { length: 30 }).default('unverified'),
  publish_state: varchar('publish_state', { length: 30 }).default('draft'),
  source: varchar('source', { length: 50 }),
  sync_ref: text('sync_ref'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

/* ─── FUR-T (extended store data) ─── */
export const marketplace_fur_t = pgTable('marketplace_fur_t', {
  id: serial('id').primaryKey(),
  fur_code: varchar('fur_code', { length: 50 }).unique(),
  store_id: integer('store_id').references(() => marketplace_store.id).notNull().unique(),
  verification_state: varchar('verification_state', { length: 30 }).default('unverified'),
  verification_notes: text('verification_notes'),
  documents: text('documents'), /* JSON */
  fiscal_data: text('fiscal_data'), /* JSON */
  bank_data: text('bank_data'), /* JSON encrypted */
  verified_at: timestamp('verified_at'),
  verified_by: integer('verified_by').references(() => res_users.id),
  published_at: timestamp('published_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

/* ─── FUR-P (extended course data) ─── */
export const marketplace_fur_p = pgTable('marketplace_fur_p', {
  id: serial('id').primaryKey(),
  fur_code: varchar('fur_code', { length: 50 }).unique(),
  course_id: integer('course_id').references(() => product_template.id).notNull().unique(),
  accreditation_type: varchar('accreditation_type', { length: 100 }),
  accreditation_body: varchar('accreditation_body', { length: 200 }),
  syllabus_url: text('syllabus_url'),
  learning_methodology: text('learning_methodology'),
  evaluation_criteria: text('evaluation_criteria'),
  recognition: text('recognition'),
  moderation_checklist: text('moderation_checklist'), /* JSON */
  published_at: timestamp('published_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

/* ─── ir.audit_log ─── */
export const ir_audit_log = pgTable('ir_audit_log', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => res_users.id),
  action: varchar('action', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  record_id: integer('record_id'),
  old_values: text('old_values'), /* JSON */
  new_values: text('new_values'), /* JSON */
  ip: varchar('ip', { length: 45 }),
  user_agent: text('user_agent'),
  result: varchar('result', { length: 20 }).default('success'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

/* ─── Home sections ─── */
export const marketplace_home_section = pgTable('marketplace_home_section', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 80 }).notNull().unique(),
  title: varchar('title', { length: 200 }),
  subtitle: text('subtitle'),
  active: boolean('active').default(true).notNull(),
  sort_order: integer('sort_order').default(0).notNull(),
  config: text('config'), /* JSON: items, filters, limits */
  updated_by: integer('updated_by').references(() => res_users.id),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

/* ─── SEO metadata ─── */
export const marketplace_seo_meta = pgTable('marketplace_seo_meta', {
  id: serial('id').primaryKey(),
  entity_type: varchar('entity_type', { length: 50 }).notNull(), /* course, store, category, page */
  entity_id: integer('entity_id').notNull(),
  slug: varchar('slug', { length: 320 }),
  canonical_url: text('canonical_url'),
  meta_title: varchar('meta_title', { length: 255 }),
  meta_description: text('meta_description'),
  og_title: varchar('og_title', { length: 255 }),
  og_description: text('og_description'),
  og_image: text('og_image'),
  jsonld: text('jsonld'), /* structured data JSON-LD */
  robots: varchar('robots', { length: 50 }).default('index,follow'),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

/* ─── Instructor profile ─── */
export const marketplace_instructor = pgTable('marketplace_instructor', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => res_users.id).notNull().unique(),
  store_id: integer('store_id').references(() => marketplace_store.id),
  headline: varchar('headline', { length: 300 }),
  expertise: text('expertise'), /* JSON array */
  credentials: text('credentials'), /* JSON */
  linkedin_url: text('linkedin_url'),
  portfolio_url: text('portfolio_url'),
  rating_avg: numeric('rating_avg', { precision: 3, scale: 2 }).default('0.00'),
  rating_count: integer('rating_count').default(0),
  total_courses: integer('total_courses').default(0),
  total_students: integer('total_students').default(0),
  active: boolean('active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})
