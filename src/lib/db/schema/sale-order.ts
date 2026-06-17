import {
  pgTable, serial, varchar, text, timestamp, boolean,
  integer, numeric, pgEnum
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { res_users } from './res-users'
import { product_template } from './product-template'
import { marketplace_store } from './marketplace-store'

export const order_state_enum = pgEnum('order_state', [
  'draft', 'confirmed', 'paid', 'cancelled', 'refunded', 'partially_refunded'
])

export const payment_state_enum = pgEnum('payment_state', [
  'pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled'
])

/* ─── sale.order ─── */
export const sale_order = pgTable('sale_order', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 30 }).notNull().unique(), /* e.g. SO-00001 */

  buyer_id: integer('buyer_id').references(() => res_users.id).notNull(),

  state: order_state_enum('state').default('draft').notNull(),
  payment_state: payment_state_enum('payment_state').default('pending').notNull(),

  /* pricing */
  amount_untaxed: numeric('amount_untaxed', { precision: 12, scale: 2 }).default('0.00'),
  amount_tax: numeric('amount_tax', { precision: 12, scale: 2 }).default('0.00'),
  amount_discount: numeric('amount_discount', { precision: 12, scale: 2 }).default('0.00'),
  amount_total: numeric('amount_total', { precision: 12, scale: 2 }).default('0.00'),
  currency: varchar('currency', { length: 3 }).default('USD'),

  /* coupon */
  coupon_code: varchar('coupon_code', { length: 50 }),
  coupon_id: integer('coupon_id'),

  /* billing */
  billing_name: varchar('billing_name', { length: 200 }),
  billing_email: varchar('billing_email', { length: 255 }),
  billing_address: text('billing_address'),
  billing_tax_id: varchar('billing_tax_id', { length: 50 }),
  billing_country: varchar('billing_country', { length: 2 }),

  /* payment gateway */
  payment_gateway: varchar('payment_gateway', { length: 50 }),
  payment_intent_id: text('payment_intent_id'),
  payment_method: varchar('payment_method', { length: 50 }),

  /* dates */
  confirmed_at: timestamp('confirmed_at'),
  paid_at: timestamp('paid_at'),
  cancelled_at: timestamp('cancelled_at'),

  /* notes */
  note: text('note'),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

/* ─── sale.order.line ─── */
export const sale_order_line = pgTable('sale_order_line', {
  id: serial('id').primaryKey(),
  order_id: integer('order_id').references(() => sale_order.id, { onDelete: 'cascade' }).notNull(),
  course_id: integer('course_id').references(() => product_template.id).notNull(),
  store_id: integer('store_id').references(() => marketplace_store.id),

  name: varchar('name', { length: 300 }).notNull(), /* course name snapshot */
  quantity: integer('quantity').default(1).notNull(),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  discount_amount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0.00'),
  tax_amount: numeric('tax_amount', { precision: 10, scale: 2 }).default('0.00'),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),

  /* commission */
  commission_rate: numeric('commission_rate', { precision: 5, scale: 2 }),
  commission_amount: numeric('commission_amount', { precision: 10, scale: 2 }),
  store_amount: numeric('store_amount', { precision: 10, scale: 2 }), /* after commission */

  refunded: boolean('refunded').default(false).notNull(),
  refund_amount: numeric('refund_amount', { precision: 10, scale: 2 }),
  refunded_at: timestamp('refunded_at'),

  created_at: timestamp('created_at').defaultNow().notNull(),
})

/* ─── account.payment ─── */
export const account_payment = pgTable('account_payment', {
  id: serial('id').primaryKey(),
  order_id: integer('order_id').references(() => sale_order.id).notNull(),
  gateway: varchar('gateway', { length: 50 }).notNull(),
  gateway_transaction_id: text('gateway_transaction_id'),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  state: payment_state_enum('state').default('pending').notNull(),
  payment_method: varchar('payment_method', { length: 50 }),
  gateway_response: text('gateway_response'), /* JSON */
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const saleOrderRelations = relations(sale_order, ({ one, many }) => ({
  buyer: one(res_users, { fields: [sale_order.buyer_id], references: [res_users.id] }),
  lines: many(sale_order_line),
  payments: many(account_payment),
}))

export const saleOrderLineRelations = relations(sale_order_line, ({ one }) => ({
  order: one(sale_order, { fields: [sale_order_line.order_id], references: [sale_order.id] }),
  course: one(product_template, { fields: [sale_order_line.course_id], references: [product_template.id] }),
  store: one(marketplace_store, { fields: [sale_order_line.store_id], references: [marketplace_store.id] }),
}))

export type SaleOrder = typeof sale_order.$inferSelect
export type NewSaleOrder = typeof sale_order.$inferInsert
export type SaleOrderLine = typeof sale_order_line.$inferSelect
