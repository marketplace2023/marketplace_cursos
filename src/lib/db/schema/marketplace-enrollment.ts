import {
  pgTable, serial, varchar, text, timestamp, boolean,
  integer, numeric, pgEnum
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { res_users } from './res-users'
import { product_template } from './product-template'
import { sale_order_line } from './sale-order'
import { slide_slide } from './slide-channel'

export const enrollment_state_enum = pgEnum('enrollment_state', [
  'active', 'completed', 'suspended', 'refunded', 'expired'
])

/* ─── marketplace.enrollment ─── */
export const marketplace_enrollment = pgTable('marketplace_enrollment', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => res_users.id).notNull(),
  course_id: integer('course_id').references(() => product_template.id).notNull(),
  order_line_id: integer('order_line_id').references(() => sale_order_line.id),
  state: enrollment_state_enum('state').default('active').notNull(),
  progress_pct: numeric('progress_pct', { precision: 5, scale: 2 }).default('0.00'),
  completed_at: timestamp('completed_at'),
  expires_at: timestamp('expires_at'),
  access_type: varchar('access_type', { length: 30 }).default('lifetime'),
  enrolled_at: timestamp('enrolled_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

/* ─── marketplace.lesson_progress ─── */
export const marketplace_lesson_progress = pgTable('marketplace_lesson_progress', {
  id: serial('id').primaryKey(),
  enrollment_id: integer('enrollment_id').references(() => marketplace_enrollment.id, { onDelete: 'cascade' }).notNull(),
  lesson_id: integer('lesson_id').references(() => slide_slide.id).notNull(),
  user_id: integer('user_id').references(() => res_users.id).notNull(),
  completed: boolean('completed').default(false).notNull(),
  time_spent: integer('time_spent').default(0), /* seconds */
  last_position: integer('last_position').default(0), /* seconds */
  completed_at: timestamp('completed_at'),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

/* ─── marketplace.certificate ─── */
export const marketplace_certificate = pgTable('marketplace_certificate', {
  id: serial('id').primaryKey(),
  enrollment_id: integer('enrollment_id').references(() => marketplace_enrollment.id).notNull(),
  user_id: integer('user_id').references(() => res_users.id).notNull(),
  course_id: integer('course_id').references(() => product_template.id).notNull(),
  verify_code: varchar('verify_code', { length: 60 }).notNull().unique(),
  verify_url: text('verify_url'),
  pdf_url: text('pdf_url'),
  issued_at: timestamp('issued_at').defaultNow().notNull(),
  revoked: boolean('revoked').default(false).notNull(),
  revoked_at: timestamp('revoked_at'),
  revoke_reason: text('revoke_reason'),
})

/* ─── marketplace.note (student notes per course) ─── */
export const marketplace_note = pgTable('marketplace_note', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => res_users.id, { onDelete: 'cascade' }).notNull(),
  course_id: integer('course_id').references(() => product_template.id, { onDelete: 'cascade' }).notNull(),
  lesson_id: integer('lesson_id').references(() => slide_slide.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

/* ─── marketplace.quiz ─── */
export const marketplace_quiz = pgTable('marketplace_quiz', {
  id: serial('id').primaryKey(),
  course_id: integer('course_id').references(() => product_template.id, { onDelete: 'cascade' }).notNull(),
  lesson_id: integer('lesson_id').references(() => slide_slide.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 300 }).notNull(),
  description: text('description'),
  pass_score: integer('pass_score').default(70).notNull(), /* percentage */
  time_limit: integer('time_limit'),                        /* minutes, null = no limit */
  max_attempts: integer('max_attempts').default(3).notNull(),
  shuffle_questions: boolean('shuffle_questions').default(true).notNull(),
  show_results: boolean('show_results').default(true).notNull(),
  active: boolean('active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const marketplace_quiz_question = pgTable('marketplace_quiz_question', {
  id: serial('id').primaryKey(),
  quiz_id: integer('quiz_id').references(() => marketplace_quiz.id, { onDelete: 'cascade' }).notNull(),
  question: text('question').notNull(),
  question_type: varchar('question_type', { length: 30 }).default('single').notNull(), /* single, multiple, true_false, short */
  options: text('options'), /* JSON array of {text, is_correct} */
  explanation: text('explanation'),
  points: integer('points').default(1).notNull(),
  sort_order: integer('sort_order').default(0).notNull(),
})

export const marketplace_quiz_attempt = pgTable('marketplace_quiz_attempt', {
  id: serial('id').primaryKey(),
  quiz_id: integer('quiz_id').references(() => marketplace_quiz.id, { onDelete: 'cascade' }).notNull(),
  user_id: integer('user_id').references(() => res_users.id, { onDelete: 'cascade' }).notNull(),
  enrollment_id: integer('enrollment_id').references(() => marketplace_enrollment.id, { onDelete: 'cascade' }),
  score: integer('score').default(0).notNull(),    /* percentage 0-100 */
  passed: boolean('passed').default(false).notNull(),
  answers: text('answers'),                          /* JSON: {question_id, answer} */
  started_at: timestamp('started_at').defaultNow().notNull(),
  submitted_at: timestamp('submitted_at'),
  time_spent: integer('time_spent'),                 /* seconds */
})

/* ─── marketplace.question (student Q&A per course) ─── */
export const marketplace_question = pgTable('marketplace_question', {
  id: serial('id').primaryKey(),
  course_id: integer('course_id').references(() => product_template.id, { onDelete: 'cascade' }).notNull(),
  lesson_id: integer('lesson_id').references(() => slide_slide.id, { onDelete: 'set null' }),
  user_id: integer('user_id').references(() => res_users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 300 }).notNull(),
  body: text('body'),
  is_answered: boolean('is_answered').default(false).notNull(),
  upvotes: integer('upvotes').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const marketplace_question_reply = pgTable('marketplace_question_reply', {
  id: serial('id').primaryKey(),
  question_id: integer('question_id').references(() => marketplace_question.id, { onDelete: 'cascade' }).notNull(),
  user_id: integer('user_id').references(() => res_users.id, { onDelete: 'cascade' }).notNull(),
  body: text('body').notNull(),
  is_instructor_reply: boolean('is_instructor_reply').default(false).notNull(),
  is_accepted: boolean('is_accepted').default(false).notNull(),
  upvotes: integer('upvotes').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export type MarketplaceEnrollment = typeof marketplace_enrollment.$inferSelect
export type MarketplaceCertificate = typeof marketplace_certificate.$inferSelect
export type MarketplaceNote = typeof marketplace_note.$inferSelect
export type MarketplaceQuiz = typeof marketplace_quiz.$inferSelect
export type MarketplaceQuizAttempt = typeof marketplace_quiz_attempt.$inferSelect
export type MarketplaceQuestion = typeof marketplace_question.$inferSelect
export type MarketplaceQuestionReply = typeof marketplace_question_reply.$inferSelect
