import {
  pgTable, serial, varchar, text, timestamp, boolean,
  integer, numeric, pgEnum
} from 'drizzle-orm/pg-core'
import { res_users } from './res-users'
import { product_template } from './product-template'
import { marketplace_store } from './marketplace-store'

/* ─── Cart ─── */
export const marketplace_cart = pgTable('marketplace_cart', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => res_users.id).notNull().unique(),
  coupon_code: varchar('coupon_code', { length: 50 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const marketplace_cart_item = pgTable('marketplace_cart_item', {
  id: serial('id').primaryKey(),
  cart_id: integer('cart_id').references(() => marketplace_cart.id, { onDelete: 'cascade' }).notNull(),
  course_id: integer('course_id').references(() => product_template.id).notNull(),
  added_at: timestamp('added_at').defaultNow().notNull(),
})

/* ─── Coupons ─── */
export const coupon_type_enum = pgEnum('coupon_type', ['percent', 'fixed'])

export const marketplace_coupon = pgTable('marketplace_coupon', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: text('description'),
  coupon_type: coupon_type_enum('coupon_type').default('percent').notNull(),
  discount_value: numeric('discount_value', { precision: 8, scale: 2 }).notNull(),
  min_purchase: numeric('min_purchase', { precision: 10, scale: 2 }).default('0.00'),
  max_discount: numeric('max_discount', { precision: 10, scale: 2 }),
  max_uses: integer('max_uses'),
  used_count: integer('used_count').default(0),
  max_per_user: integer('max_per_user').default(1),
  store_id: integer('store_id').references(() => marketplace_store.id), /* null = platform-wide */
  course_id: integer('course_id').references(() => product_template.id), /* null = all courses */
  active: boolean('active').default(true).notNull(),
  starts_at: timestamp('starts_at'),
  expires_at: timestamp('expires_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const marketplace_coupon_usage = pgTable('marketplace_coupon_usage', {
  id: serial('id').primaryKey(),
  coupon_id: integer('coupon_id').references(() => marketplace_coupon.id).notNull(),
  user_id: integer('user_id').references(() => res_users.id).notNull(),
  order_id: integer('order_id'),
  discount_applied: numeric('discount_applied', { precision: 10, scale: 2 }),
  used_at: timestamp('used_at').defaultNow().notNull(),
})

/* ─── Subscriptions ─── */
export const sub_period_enum = pgEnum('sub_period', ['monthly', 'quarterly', 'yearly'])

export const marketplace_subscription_plan = pgTable('marketplace_subscription_plan', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  description: text('description'),
  target: varchar('target', { length: 20 }).default('store').notNull(), /* store | buyer */
  period: sub_period_enum('period').default('monthly').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  features: text('features'), /* JSON array */
  max_courses: integer('max_courses'),
  max_users: integer('max_users'),
  commission_rate: numeric('commission_rate', { precision: 5, scale: 2 }),
  active: boolean('active').default(true).notNull(),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const sub_state_enum = pgEnum('sub_state', ['trial', 'active', 'past_due', 'cancelled', 'expired'])

export const marketplace_subscription = pgTable('marketplace_subscription', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => res_users.id).notNull(),
  store_id: integer('store_id').references(() => marketplace_store.id),
  plan_id: integer('plan_id').references(() => marketplace_subscription_plan.id).notNull(),
  state: sub_state_enum('state').default('active').notNull(),
  gateway_subscription_id: text('gateway_subscription_id'),
  current_period_start: timestamp('current_period_start'),
  current_period_end: timestamp('current_period_end'),
  trial_end: timestamp('trial_end'),
  cancelled_at: timestamp('cancelled_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

/* ─── Advertising ─── */
export const ad_state_enum = pgEnum('ad_state', ['draft', 'pending', 'active', 'paused', 'ended', 'rejected'])

export const marketplace_ad_campaign = pgTable('marketplace_ad_campaign', {
  id: serial('id').primaryKey(),
  store_id: integer('store_id').references(() => marketplace_store.id).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  position: varchar('position', { length: 60 }).notNull(), /* home_banner, catalog_top, sidebar */
  state: ad_state_enum('state').default('draft').notNull(),
  image_url: text('image_url'),
  link_url: text('link_url'),
  budget: numeric('budget', { precision: 10, scale: 2 }),
  starts_at: timestamp('starts_at'),
  ends_at: timestamp('ends_at'),
  impressions: integer('impressions').default(0),
  clicks: integer('clicks').default(0),
  conversions: integer('conversions').default(0),
  reviewed_by: integer('reviewed_by'),
  reviewed_at: timestamp('reviewed_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

/* ─── Favorites ─── */
export const marketplace_favorite = pgTable('marketplace_favorite', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => res_users.id, { onDelete: 'cascade' }).notNull(),
  course_id: integer('course_id').references(() => product_template.id),
  store_id: integer('store_id').references(() => marketplace_store.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

/* ─── Payouts ─── */
export const payout_state_enum = pgEnum('payout_state', ['pending', 'processing', 'paid', 'failed', 'cancelled'])

export const marketplace_payout = pgTable('marketplace_payout', {
  id: serial('id').primaryKey(),
  store_id: integer('store_id').references(() => marketplace_store.id).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  state: payout_state_enum('state').default('pending').notNull(),
  period_start: timestamp('period_start'),
  period_end: timestamp('period_end'),
  payment_method: varchar('payment_method', { length: 50 }),
  payment_reference: text('payment_reference'),
  processed_at: timestamp('processed_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

/* ─── B2B Quotes ─── */
export const quote_state_enum = pgEnum('quote_state', ['draft', 'sent', 'accepted', 'rejected', 'expired'])

export const marketplace_quote = pgTable('marketplace_quote', {
  id: serial('id').primaryKey(),
  company_name: varchar('company_name', { length: 200 }).notNull(),
  contact_name: varchar('contact_name', { length: 150 }),
  contact_email: varchar('contact_email', { length: 255 }).notNull(),
  contact_phone: varchar('contact_phone', { length: 30 }),
  participants: integer('participants'),
  notes: text('notes'),
  budget_range: varchar('budget_range', { length: 80 }),
  state: quote_state_enum('state').default('draft').notNull(),
  user_id: integer('user_id').references(() => res_users.id),
  expires_at: timestamp('expires_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const marketplace_quote_line = pgTable('marketplace_quote_line', {
  id: serial('id').primaryKey(),
  quote_id: integer('quote_id').references(() => marketplace_quote.id, { onDelete: 'cascade' }).notNull(),
  course_id: integer('course_id').references(() => product_template.id),
  name: varchar('name', { length: 300 }).notNull(),
  quantity: integer('quantity').default(1),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }),
})
