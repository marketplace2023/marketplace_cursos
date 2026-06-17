import {
  pgTable, serial, varchar, text, timestamp, boolean,
  integer, pgEnum
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { res_groups } from './res-groups'

export const user_state_enum = pgEnum('user_state', [
  'draft', 'active', 'suspended', 'blocked', 'deleted'
])

export const user_type_enum = pgEnum('user_type', [
  'buyer', 'store_owner', 'instructor', 'admin', 'superadmin',
  'support', 'marketing', 'finance', 'compliance', 'analyst', 'b2b_user'
])

export const res_users = pgTable('res_users', {
  id: serial('id').primaryKey(),
  fur_code: varchar('fur_code', { length: 50 }).unique(),

  /* identity */
  name: varchar('name', { length: 150 }).notNull(),
  last_name: varchar('last_name', { length: 150 }),
  public_name: varchar('public_name', { length: 150 }),
  username: varchar('username', { length: 80 }).unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 30 }),
  password_hash: text('password_hash').notNull(),

  /* profile */
  avatar_url: text('avatar_url'),
  bio: text('bio'),
  website: text('website'),
  timezone: varchar('timezone', { length: 60 }).default('America/New_York'),
  language: varchar('language', { length: 10 }).default('es'),
  country: varchar('country', { length: 2 }).default('US'),

  /* classification */
  user_type: user_type_enum('user_type').default('buyer').notNull(),
  state: user_state_enum('state').default('draft').notNull(),

  /* verification */
  email_verified: boolean('email_verified').default(false).notNull(),
  phone_verified: boolean('phone_verified').default(false).notNull(),
  kyc_state: varchar('kyc_state', { length: 30 }).default('none'),
  email_verify_token: text('email_verify_token'),
  password_reset_token: text('password_reset_token'),
  password_reset_expires: timestamp('password_reset_expires'),

  /* consent */
  terms_accepted: boolean('terms_accepted').default(false).notNull(),
  privacy_accepted: boolean('privacy_accepted').default(false).notNull(),
  marketing_consent: boolean('marketing_consent').default(false).notNull(),
  terms_accepted_at: timestamp('terms_accepted_at'),

  /* 2FA */
  two_fa_enabled: boolean('two_fa_enabled').default(false).notNull(),
  two_fa_secret: text('two_fa_secret'),

  /* failed login tracking */
  failed_login_count: integer('failed_login_count').default(0).notNull(),
  last_failed_login: timestamp('last_failed_login'),
  locked_until: timestamp('locked_until'),

  /* metrics */
  login_count: integer('login_count').default(0).notNull(),
  last_login: timestamp('last_login'),

  /* audit */
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
})

/* many-to-many: users ↔ groups */
export const res_users_groups_rel = pgTable('res_users_groups_rel', {
  user_id: integer('user_id').references(() => res_users.id, { onDelete: 'cascade' }).notNull(),
  group_id: integer('group_id').references(() => res_groups.id, { onDelete: 'cascade' }).notNull(),
})

export const resUsersRelations = relations(res_users, ({ many }) => ({
  user_groups: many(res_users_groups_rel),
}))

export const resUsersGroupsRelRelations = relations(res_users_groups_rel, ({ one }) => ({
  user: one(res_users, { fields: [res_users_groups_rel.user_id], references: [res_users.id] }),
  group: one(res_groups, { fields: [res_users_groups_rel.group_id], references: [res_groups.id] }),
}))

export type ResUser = typeof res_users.$inferSelect
export type NewResUser = typeof res_users.$inferInsert
