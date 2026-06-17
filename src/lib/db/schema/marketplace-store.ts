import {
  pgTable, serial, varchar, text, timestamp, boolean,
  integer, numeric, pgEnum
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { res_users } from './res-users'

export const store_state_enum = pgEnum('store_state', [
  'draft', 'pending_review', 'active', 'suspended', 'rejected', 'archived'
])

export const store_type_enum = pgEnum('store_type', [
  'academy', 'individual', 'corporate', 'government'
])

export const marketplace_store = pgTable('marketplace_store', {
  id: serial('id').primaryKey(),
  fur_code: varchar('fur_code', { length: 50 }).unique(),

  /* identity */
  name: varchar('name', { length: 200 }).notNull(),
  legal_name: varchar('legal_name', { length: 200 }),
  slug: varchar('slug', { length: 220 }).notNull().unique(),
  store_type: store_type_enum('store_type').default('academy').notNull(),
  state: store_state_enum('state').default('draft').notNull(),

  /* ownership */
  owner_id: integer('owner_id').references(() => res_users.id).notNull(),

  /* branding */
  description: text('description'),
  logo_url: text('logo_url'),
  cover_url: text('cover_url'),

  /* contact */
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 30 }),
  website: text('website'),

  /* location */
  country: varchar('country', { length: 2 }),
  state_province: varchar('state_province', { length: 100 }),
  city: varchar('city', { length: 100 }),
  address: text('address'),
  zip: varchar('zip', { length: 20 }),

  /* modality */
  modality: varchar('modality', { length: 50 }), /* online, presential, hybrid */
  languages: text('languages'), /* JSON array */

  /* social */
  social_links: text('social_links'), /* JSON */

  /* commercial */
  plan: varchar('plan', { length: 30 }).default('free'),
  commission_rate: numeric('commission_rate', { precision: 5, scale: 2 }).default('15.00'),
  tax_id: varchar('tax_id', { length: 50 }),

  /* metrics (denormalized) */
  total_courses: integer('total_courses').default(0),
  total_students: integer('total_students').default(0),
  total_sales: integer('total_sales').default(0),
  rating_avg: numeric('rating_avg', { precision: 3, scale: 2 }).default('0.00'),
  rating_count: integer('rating_count').default(0),

  /* verification */
  is_verified: boolean('is_verified').default(false).notNull(),
  verified_at: timestamp('verified_at'),
  verified_by: integer('verified_by'),

  /* policies */
  refund_policy: text('refund_policy'),
  support_policy: text('support_policy'),

  /* SEO */
  meta_title: varchar('meta_title', { length: 255 }),
  meta_description: text('meta_description'),

  /* audit */
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
})

/* store staff relation */
export const marketplace_store_users_rel = pgTable('marketplace_store_users_rel', {
  store_id: integer('store_id').references(() => marketplace_store.id, { onDelete: 'cascade' }).notNull(),
  user_id: integer('user_id').references(() => res_users.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 50 }).default('member').notNull(), /* owner, admin, instructor, member */
  active: boolean('active').default(true).notNull(),
  joined_at: timestamp('joined_at').defaultNow().notNull(),
})

export const marketplaceStoreRelations = relations(marketplace_store, ({ one, many }) => ({
  owner: one(res_users, { fields: [marketplace_store.owner_id], references: [res_users.id] }),
  staff: many(marketplace_store_users_rel),
}))

export type MarketplaceStore = typeof marketplace_store.$inferSelect
export type NewMarketplaceStore = typeof marketplace_store.$inferInsert
