import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { customers, products, salesOrderItems, salesOrders } from '@/db/schema'
import { ORDER_STATUSES, type OrderStatus } from '@/lib/order-status'
import { requireText, requireInt } from '@/lib/validation'

export const listOrders = createServerFn({ method: 'GET' }).handler(async () => {
  return db
    .select({
      id: salesOrders.id,
      number: salesOrders.number,
      status: salesOrders.status,
      orderDate: salesOrders.orderDate,
      total: salesOrders.total,
      customerName: customers.name,
    })
    .from(salesOrders)
    .innerJoin(customers, eq(customers.id, salesOrders.customerId))
    .orderBy(desc(salesOrders.id))
    .all()
})

export const getOrder = createServerFn({ method: 'GET' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const order = db
      .select({
        id: salesOrders.id,
        number: salesOrders.number,
        status: salesOrders.status,
        orderDate: salesOrders.orderDate,
        total: salesOrders.total,
        customerId: customers.id,
        customerName: customers.name,
        customerEmail: customers.email,
      })
      .from(salesOrders)
      .innerJoin(customers, eq(customers.id, salesOrders.customerId))
      .where(eq(salesOrders.id, data.id))
      .get()
    if (!order) throw new Error('Order not found')

    const items = db
      .select({
        id: salesOrderItems.id,
        quantity: salesOrderItems.quantity,
        unitPrice: salesOrderItems.unitPrice,
        productName: products.name,
        sku: products.sku,
      })
      .from(salesOrderItems)
      .innerJoin(products, eq(products.id, salesOrderItems.productId))
      .where(eq(salesOrderItems.orderId, data.id))
      .all()

    return { order, items }
  })

export const createOrder = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      customerId: number
      orderDate: string
      items: { productId: number; quantity: number }[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const customerId = requireInt(data.customerId, 'Customer', 1)
    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Add at least one item')
    }

    return db.transaction((tx) => {
      const customer = tx.select().from(customers).where(eq(customers.id, customerId)).get()
      if (!customer) throw new Error('Customer not found')

      // Merge duplicate product lines and validate stock before writing anything.
      const quantities = new Map<number, number>()
      for (const item of data.items) {
        const productId = requireInt(item.productId, 'Product', 1)
        const quantity = requireInt(item.quantity, 'Quantity', 1)
        quantities.set(productId, (quantities.get(productId) ?? 0) + quantity)
      }

      const lines = [...quantities].map(([productId, quantity]) => {
        const product = tx.select().from(products).where(eq(products.id, productId)).get()
        if (!product) throw new Error(`Product ${productId} not found`)
        if (product.stock < quantity) {
          throw new Error(`Not enough stock for ${product.name} (have ${product.stock})`)
        }
        return { product, quantity }
      })

      const total = lines.reduce((acc, l) => acc + l.product.unitPrice * l.quantity, 0)

      const order = tx
        .insert(salesOrders)
        .values({
          number: 'TEMP',
          customerId,
          status: 'confirmed',
          orderDate: requireText(data.orderDate, 'Order date'),
          total,
        })
        .returning()
        .get()

      tx.update(salesOrders)
        .set({ number: `SO-${String(order.id).padStart(4, '0')}` })
        .where(eq(salesOrders.id, order.id))
        .run()

      for (const { product, quantity } of lines) {
        tx.insert(salesOrderItems)
          .values({
            orderId: order.id,
            productId: product.id,
            quantity,
            unitPrice: product.unitPrice,
          })
          .run()
        tx.update(products)
          .set({ stock: product.stock - quantity })
          .where(eq(products.id, product.id))
          .run()
      }

      return { id: order.id }
    })
  })

export const setOrderStatus = createServerFn({ method: 'POST' })
  .validator((data: { id: number; status: OrderStatus }) => data)
  .handler(async ({ data }) => {
    if (!ORDER_STATUSES.includes(data.status)) throw new Error('Invalid status')

    db.transaction((tx) => {
      const order = tx.select().from(salesOrders).where(eq(salesOrders.id, data.id)).get()
      if (!order) throw new Error('Order not found')
      if (order.status === 'cancelled') throw new Error('Cancelled orders cannot change')

      // Cancelling a not-yet-shipped order returns its stock.
      const restocks = order.status === 'confirmed' || order.status === 'draft'
      if (data.status === 'cancelled' && restocks) {
        const items = tx
          .select()
          .from(salesOrderItems)
          .where(eq(salesOrderItems.orderId, order.id))
          .all()
        for (const item of items) {
          const product = tx.select().from(products).where(eq(products.id, item.productId)).get()
          if (!product) throw new Error(`Product ${item.productId} not found`)
          tx.update(products)
            .set({ stock: product.stock + item.quantity })
            .where(eq(products.id, product.id))
            .run()
        }
      }

      tx.update(salesOrders).set({ status: data.status }).where(eq(salesOrders.id, order.id)).run()
    })

    return { ok: true }
  })

// ---------- Employees ----------
