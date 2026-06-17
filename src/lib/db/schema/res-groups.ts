import { pgTable, serial, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const res_groups = pgTable('res_groups', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  full_name: varchar('full_name', { length: 200 }),
  comment: text('comment'),
  active: boolean('active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export type ResGroup = typeof res_groups.$inferSelect
export type NewResGroup = typeof res_groups.$inferInsert
