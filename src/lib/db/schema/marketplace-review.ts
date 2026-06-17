import {
  pgTable, serial, text, timestamp, boolean, integer, pgEnum
} from 'drizzle-orm/pg-core'
import { res_users } from './res-users'
import { product_template } from './product-template'
import { marketplace_store } from './marketplace-store'
import { marketplace_enrollment } from './marketplace-enrollment'

export const review_state_enum = pgEnum('review_state', [
  'published', 'pending', 'hidden', 'rejected'
])

export const marketplace_review = pgTable('marketplace_review', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => res_users.id).notNull(),
  course_id: integer('course_id').references(() => product_template.id),
  store_id: integer('store_id').references(() => marketplace_store.id),
  enrollment_id: integer('enrollment_id').references(() => marketplace_enrollment.id),
  rating: integer('rating').notNull(), /* 1-5 */
  comment: text('comment'),
  state: review_state_enum('state').default('pending').notNull(),
  verified_purchase: boolean('verified_purchase').default(false).notNull(),
  flagged: boolean('flagged').default(false),
  flag_reason: text('flag_reason'),
  moderated_by: integer('moderated_by'),
  moderated_at: timestamp('moderated_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const marketplace_review_reply = pgTable('marketplace_review_reply', {
  id: serial('id').primaryKey(),
  review_id: integer('review_id').references(() => marketplace_review.id, { onDelete: 'cascade' }).notNull(),
  store_id: integer('store_id').references(() => marketplace_store.id).notNull(),
  replied_by: integer('replied_by').references(() => res_users.id).notNull(),
  comment: text('comment').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export type MarketplaceReview = typeof marketplace_review.$inferSelect
export type MarketplaceReviewReply = typeof marketplace_review_reply.$inferSelect
