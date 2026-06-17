import {
  pgTable, serial, varchar, text, timestamp, boolean, integer, pgEnum
} from 'drizzle-orm/pg-core'
import { res_users } from './res-users'
import { product_template } from './product-template'
import { marketplace_store } from './marketplace-store'

/* ─── mail.notification ─── */
export const notif_type_enum = pgEnum('notif_type', [
  'sale', 'enrollment', 'review', 'certificate', 'message',
  'ticket', 'moderation', 'payment', 'system', 'marketing'
])

export const mail_notification = pgTable('mail_notification', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => res_users.id, { onDelete: 'cascade' }).notNull(),
  type: notif_type_enum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body'),
  link: text('link'),
  read: boolean('read').default(false).notNull(),
  read_at: timestamp('read_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

/* ─── mail.thread (conversations) ─── */
export const mail_thread = pgTable('mail_thread', {
  id: serial('id').primaryKey(),
  subject: varchar('subject', { length: 300 }),
  context_type: varchar('context_type', { length: 30 }), /* course, order, support, general */
  course_id: integer('course_id').references(() => product_template.id),
  store_id: integer('store_id').references(() => marketplace_store.id),
  is_blocked: boolean('is_blocked').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const mail_thread_participant = pgTable('mail_thread_participant', {
  id: serial('id').primaryKey(),
  thread_id: integer('thread_id').references(() => mail_thread.id, { onDelete: 'cascade' }).notNull(),
  user_id: integer('user_id').references(() => res_users.id, { onDelete: 'cascade' }).notNull(),
  joined_at: timestamp('joined_at').defaultNow().notNull(),
  last_read_at: timestamp('last_read_at'),
})

/* ─── mail.message ─── */
export const mail_message = pgTable('mail_message', {
  id: serial('id').primaryKey(),
  thread_id: integer('thread_id').references(() => mail_thread.id, { onDelete: 'cascade' }).notNull(),
  sender_id: integer('sender_id').references(() => res_users.id).notNull(),
  body: text('body').notNull(),
  attachment_url: text('attachment_url'),
  deleted: boolean('deleted').default(false).notNull(),
  deleted_at: timestamp('deleted_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

/* ─── Support tickets ─── */
export const ticket_state_enum = pgEnum('ticket_state', [
  'open', 'in_progress', 'waiting_user', 'waiting_store', 'resolved', 'closed', 'escalated'
])

export const ticket_priority_enum = pgEnum('ticket_priority', ['low', 'normal', 'high', 'urgent'])

export const ticket_category_enum = pgEnum('ticket_category', [
  'payment', 'refund', 'course_access', 'technical', 'account', 'moderation', 'other'
])

export const marketplace_support_ticket = pgTable('marketplace_support_ticket', {
  id: serial('id').primaryKey(),
  ticket_number: varchar('ticket_number', { length: 20 }).notNull().unique(),
  user_id: integer('user_id').references(() => res_users.id).notNull(),
  assigned_to: integer('assigned_to').references(() => res_users.id),
  state: ticket_state_enum('state').default('open').notNull(),
  priority: ticket_priority_enum('priority').default('normal').notNull(),
  category: ticket_category_enum('category').default('other').notNull(),
  subject: varchar('subject', { length: 300 }).notNull(),
  description: text('description'),
  course_id: integer('course_id').references(() => product_template.id),
  order_id: integer('order_id'),
  /* SLA */
  due_at: timestamp('due_at'),
  resolved_at: timestamp('resolved_at'),
  closed_at: timestamp('closed_at'),
  /* satisfaction */
  satisfaction_score: integer('satisfaction_score'), /* 1-5 */
  satisfaction_comment: text('satisfaction_comment'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const marketplace_ticket_message = pgTable('marketplace_ticket_message', {
  id: serial('id').primaryKey(),
  ticket_id: integer('ticket_id').references(() => marketplace_support_ticket.id, { onDelete: 'cascade' }).notNull(),
  sender_id: integer('sender_id').references(() => res_users.id).notNull(),
  body: text('body').notNull(),
  is_internal: boolean('is_internal').default(false).notNull(),
  attachment_url: text('attachment_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})
