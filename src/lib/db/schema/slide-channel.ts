import {
  pgTable, serial, varchar, text, timestamp, boolean, integer
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { product_template } from './product-template'

/* slide.channel → modules */
export const slide_channel = pgTable('slide_channel', {
  id: serial('id').primaryKey(),
  course_id: integer('course_id').references(() => product_template.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 300 }).notNull(),
  description: text('description'),
  sort_order: integer('sort_order').default(0).notNull(),
  is_preview: boolean('is_preview').default(false).notNull(),
  active: boolean('active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

/* slide.slide → lessons */
export const slide_slide = pgTable('slide_slide', {
  id: serial('id').primaryKey(),
  channel_id: integer('channel_id').references(() => slide_channel.id, { onDelete: 'cascade' }).notNull(),
  course_id: integer('course_id').references(() => product_template.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 300 }).notNull(),
  description: text('description'),
  slide_type: varchar('slide_type', { length: 30 }).default('video'), /* video, text, quiz, file, live */
  content_url: text('content_url'),
  content_text: text('content_text'),
  duration: integer('duration').default(0), /* seconds */
  sort_order: integer('sort_order').default(0).notNull(),
  is_preview: boolean('is_preview').default(false).notNull(),
  is_mandatory: boolean('is_mandatory').default(true).notNull(),
  active: boolean('active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const slideChannelRelations = relations(slide_channel, ({ one, many }) => ({
  course: one(product_template, { fields: [slide_channel.course_id], references: [product_template.id] }),
  slides: many(slide_slide),
}))

export const slideSlideRelations = relations(slide_slide, ({ one }) => ({
  channel: one(slide_channel, { fields: [slide_slide.channel_id], references: [slide_channel.id] }),
  course: one(product_template, { fields: [slide_slide.course_id], references: [product_template.id] }),
}))

export type SlideChannel = typeof slide_channel.$inferSelect
export type SlideSlide = typeof slide_slide.$inferSelect
