import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { ORDER_STATUSES } from '../lib/order-status'
import { PURCHASE_STATUSES } from '../lib/purchase-status'

const createdAt = text('created_at')
  .notNull()
  .default(sql`(CURRENT_TIMESTAMP)`)

export const healthChecks = sqliteTable('health_checks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  checkedAt: text('checked_at')
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
})

export const customers = sqliteTable(
  'customers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    city: text('city').notNull(),
    createdAt,
  },
  (t) => [uniqueIndex('customers_email_idx').on(t.email)],
)

export const products = sqliteTable(
  'products',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sku: text('sku').notNull(),
    name: text('name').notNull(),
    category: text('category').notNull(),
    // Money is stored as whole rupiah (IDR has no minor unit), so integers avoid float drift.
    unitPrice: integer('unit_price').notNull(),
    stock: integer('stock').notNull().default(0),
    vendorId: integer('vendor_id').references(() => vendors.id),
    createdAt,
  },
  (t) => [uniqueIndex('products_sku_idx').on(t.sku)],
)

export const salesOrders = sqliteTable(
  'sales_orders',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    number: text('number').notNull(),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customers.id),
    status: text('status', { enum: ORDER_STATUSES }).notNull().default('confirmed'),
    orderDate: text('order_date').notNull(),
    total: integer('total').notNull().default(0),
    createdAt,
  },
  (t) => [
    uniqueIndex('sales_orders_number_idx').on(t.number),
    index('sales_orders_customer_idx').on(t.customerId),
  ],
)

export const salesOrderItems = sqliteTable(
  'sales_order_items',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: integer('order_id')
      .notNull()
      .references(() => salesOrders.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    quantity: integer('quantity').notNull(),
    unitPrice: integer('unit_price').notNull(),
  },
  (t) => [index('sales_order_items_order_idx').on(t.orderId)],
)

export const employees = sqliteTable(
  'employees',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    department: text('department').notNull(),
    role: text('role').notNull(),
    hiredAt: text('hired_at').notNull(),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
  },
  (t) => [uniqueIndex('employees_email_idx').on(t.email)],
)

export const vendors = sqliteTable(
  'vendors',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    city: text('city').notNull(),
    category: text('category').notNull(),
    paymentTerms: text('payment_terms').notNull(),
    createdAt,
  },
  (t) => [uniqueIndex('vendors_email_idx').on(t.email)],
)

export const purchaseOrders = sqliteTable(
  'purchase_orders',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    number: text('number').notNull(),
    vendorId: integer('vendor_id')
      .notNull()
      .references(() => vendors.id),
    status: text('status', { enum: PURCHASE_STATUSES }).notNull().default('ordered'),
    orderDate: text('order_date').notNull(),
    expectedDate: text('expected_date').notNull(),
    total: integer('total').notNull().default(0),
    createdAt,
  },
  (t) => [
    uniqueIndex('purchase_orders_number_idx').on(t.number),
    index('purchase_orders_vendor_idx').on(t.vendorId),
  ],
)

export const purchaseOrderItems = sqliteTable(
  'purchase_order_items',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    purchaseOrderId: integer('purchase_order_id')
      .notNull()
      .references(() => purchaseOrders.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    quantity: integer('quantity').notNull(),
    unitCost: integer('unit_cost').notNull(),
  },
  (t) => [index('purchase_order_items_po_idx').on(t.purchaseOrderId)],
)
