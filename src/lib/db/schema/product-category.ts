import { pgTable, serial, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const product_category = pgTable('product_category', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 180 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 100 }),
  image_url: text('image_url'),
  parent_id: integer('parent_id'),
  sort_order: integer('sort_order').default(0),
  active: boolean('active').default(true).notNull(),
  featured: boolean('featured').default(false).notNull(),
  /* SEO */
  meta_title: varchar('meta_title', { length: 255 }),
  meta_description: text('meta_description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const productCategoryRelations = relations(product_category, ({ one, many }) => ({
  parent: one(product_category, {
    fields: [product_category.parent_id],
    references: [product_category.id],
    relationName: 'subcategories',
  }),
  children: many(product_category, { relationName: 'subcategories' }),
}))

export type ProductCategory = typeof product_category.$inferSelect
export type NewProductCategory = typeof product_category.$inferInsert
