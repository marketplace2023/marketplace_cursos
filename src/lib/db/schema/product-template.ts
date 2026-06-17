import {
  pgTable, serial, varchar, text, timestamp, boolean,
  integer, numeric, pgEnum
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { res_users } from './res-users'
import { marketplace_store } from './marketplace-store'
import { product_category } from './product-category'

export const course_state_enum = pgEnum('course_state', [
  'draft', 'pending_review', 'published', 'rejected', 'archived', 'suspended'
])

export const course_level_enum = pgEnum('course_level', [
  'beginner', 'intermediate', 'advanced', 'all_levels'
])

export const course_modality_enum = pgEnum('course_modality', [
  'online_async', 'online_sync', 'presential', 'hybrid', 'recorded'
])

export const course_format_enum = pgEnum('course_format', [
  'video', 'text', 'audio', 'live', 'blended'
])

/* ─── product.template → courses ─── */
export const product_template = pgTable('product_template', {
  id: serial('id').primaryKey(),
  fur_code: varchar('fur_code', { length: 50 }).unique(),
  sku: varchar('sku', { length: 80 }).unique(),

  /* identity */
  name: varchar('name', { length: 300 }).notNull(),
  subtitle: varchar('subtitle', { length: 400 }),
  slug: varchar('slug', { length: 320 }).notNull().unique(),
  description: text('description'),
  short_description: text('short_description'),

  /* learning */
  learning_objectives: text('learning_objectives'), /* JSON array */
  requirements: text('requirements'),               /* JSON array */
  target_audience: text('target_audience'),

  /* classification */
  category_id: integer('category_id').references(() => product_category.id),
  subcategory_id: integer('subcategory_id').references(() => product_category.id),
  level: course_level_enum('level').default('all_levels'),
  language: varchar('language', { length: 10 }).default('es'),
  modality: course_modality_enum('modality').default('online_async'),
  format: course_format_enum('format').default('video'),

  /* duration */
  duration_hours: numeric('duration_hours', { precision: 6, scale: 2 }),
  total_modules: integer('total_modules').default(0),
  total_lessons: integer('total_lessons').default(0),

  /* scheduling */
  start_date: timestamp('start_date'),
  end_date: timestamp('end_date'),
  enrollment_deadline: timestamp('enrollment_deadline'),

  /* ownership */
  store_id: integer('store_id').references(() => marketplace_store.id),
  instructor_id: integer('instructor_id').references(() => res_users.id),

  /* certification */
  has_certificate: boolean('has_certificate').default(false).notNull(),
  certificate_template_id: integer('certificate_template_id'),

  /* pricing */
  list_price: numeric('list_price', { precision: 10, scale: 2 }).default('0.00').notNull(),
  sale_price: numeric('sale_price', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  is_free: boolean('is_free').default(false).notNull(),

  /* access */
  access_type: varchar('access_type', { length: 30 }).default('lifetime'), /* lifetime, period, subscription */
  access_days: integer('access_days'),

  /* refund */
  refund_policy: text('refund_policy'),
  refund_days: integer('refund_days').default(30),

  /* media */
  cover_url: text('cover_url'),
  preview_video_url: text('preview_video_url'),
  preview_video_duration: integer('preview_video_duration'), /* seconds */

  /* metrics (denormalized) */
  rating_avg: numeric('rating_avg', { precision: 3, scale: 2 }).default('0.00'),
  rating_count: integer('rating_count').default(0),
  total_students: integer('total_students').default(0),
  total_sales: integer('total_sales').default(0),

  /* state */
  state: course_state_enum('state').default('draft').notNull(),
  is_featured: boolean('is_featured').default(false),
  is_bestseller: boolean('is_bestseller').default(false),
  is_new: boolean('is_new').default(false),

  /* SEO */
  meta_title: varchar('meta_title', { length: 255 }),
  meta_description: text('meta_description'),
  jsonld_snapshot: text('jsonld_snapshot'),

  /* moderation */
  moderation_notes: text('moderation_notes'),
  reviewed_by: integer('reviewed_by'),
  reviewed_at: timestamp('reviewed_at'),
  published_at: timestamp('published_at'),

  /* audit */
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
})

/* tags */
export const product_tag = pgTable('product_tag', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 80 }).notNull().unique(),
  slug: varchar('slug', { length: 90 }).notNull().unique(),
})

export const product_template_tag_rel = pgTable('product_template_tag_rel', {
  template_id: integer('template_id').references(() => product_template.id, { onDelete: 'cascade' }).notNull(),
  tag_id: integer('tag_id').references(() => product_tag.id, { onDelete: 'cascade' }).notNull(),
})

export const productTemplateRelations = relations(product_template, ({ one, many }) => ({
  category: one(product_category, { fields: [product_template.category_id], references: [product_category.id] }),
  store: one(marketplace_store, { fields: [product_template.store_id], references: [marketplace_store.id] }),
  instructor: one(res_users, { fields: [product_template.instructor_id], references: [res_users.id] }),
  tags: many(product_template_tag_rel),
}))

export type ProductTemplate = typeof product_template.$inferSelect
export type NewProductTemplate = typeof product_template.$inferInsert
