import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { products, purchaseOrderItems, purchaseOrders, vendors } from '@/db/schema'
import { PURCHASE_STATUSES, type PurchaseStatus } from '@/lib/purchase-status'
import { requireInt, requireText } from '@/lib/validation'

export const listPurchaseOrders = createServerFn({ method: 'GET' }).handler(async () => {
  return db
    .select({
      id: purchaseOrders.id,
      number: purchaseOrders.number,
      status: purchaseOrders.status,
      orderDate: purchaseOrders.orderDate,
      expectedDate: purchaseOrders.expectedDate,
      total: purchaseOrders.total,
      vendorName: vendors.name,
    })
    .from(purchaseOrders)
    .innerJoin(vendors, eq(vendors.id, purchaseOrders.vendorId))
    .orderBy(desc(purchaseOrders.id))
    .all()
})

export const getPurchaseOrder = createServerFn({ method: 'GET' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const order = db
      .select({
        id: purchaseOrders.id,
        number: purchaseOrders.number,
        status: purchaseOrders.status,
        orderDate: purchaseOrders.orderDate,
        expectedDate: purchaseOrders.expectedDate,
        total: purchaseOrders.total,
        vendorId: vendors.id,
        vendorName: vendors.name,
        vendorEmail: vendors.email,
        paymentTerms: vendors.paymentTerms,
      })
      .from(purchaseOrders)
      .innerJoin(vendors, eq(vendors.id, purchaseOrders.vendorId))
      .where(eq(purchaseOrders.id, data.id))
      .get()
    if (!order) throw new Error('Purchase order not found')

    const items = db
      .select({
        id: purchaseOrderItems.id,
        quantity: purchaseOrderItems.quantity,
        unitCost: purchaseOrderItems.unitCost,
        productName: products.name,
        sku: products.sku,
      })
      .from(purchaseOrderItems)
      .innerJoin(products, eq(products.id, purchaseOrderItems.productId))
      .where(eq(purchaseOrderItems.purchaseOrderId, data.id))
      .all()

    return { order, items }
  })

export const createPurchaseOrder = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      vendorId: number
      orderDate: string
      expectedDate: string
      items: { productId: number; quantity: number; unitCost: number }[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const vendorId = requireInt(data.vendorId, 'Vendor', 1)
    if (!Array.isArray(data.items) || data.items.length === 0) throw new Error('Add at least one item')

    return db.transaction((tx) => {
      const vendor = tx.select().from(vendors).where(eq(vendors.id, vendorId)).get()
      if (!vendor) throw new Error('Vendor not found')

      // Merge duplicate product lines; the last unit cost entered for a product wins.
      const lines = new Map<number, { quantity: number; unitCost: number }>()
      for (const item of data.items) {
        const productId = requireInt(item.productId, 'Product', 1)
        const quantity = requireInt(item.quantity, 'Quantity', 1)
        const unitCost = requireInt(item.unitCost, 'Unit cost', 1)
        const current = lines.get(productId)
        lines.set(productId, { quantity: (current?.quantity ?? 0) + quantity, unitCost })
      }

      const total = [...lines.values()].reduce((acc, l) => acc + l.quantity * l.unitCost, 0)
      const order = tx
        .insert(purchaseOrders)
        .values({
          number: 'TEMP',
          vendorId,
          status: 'ordered',
          orderDate: requireText(data.orderDate, 'Order date'),
          expectedDate: requireText(data.expectedDate, 'Expected date'),
          total,
        })
        .returning()
        .get()

      tx.update(purchaseOrders)
        .set({ number: `PO-${String(order.id).padStart(4, '0')}` })
        .where(eq(purchaseOrders.id, order.id))
        .run()

      for (const [productId, line] of lines) {
        tx.insert(purchaseOrderItems)
          .values({ purchaseOrderId: order.id, productId, quantity: line.quantity, unitCost: line.unitCost })
          .run()
      }

      return { id: order.id }
    })
  })

export const setPurchaseOrderStatus = createServerFn({ method: 'POST' })
  .validator((data: { id: number; status: PurchaseStatus }) => data)
  .handler(async ({ data }) => {
    if (!PURCHASE_STATUSES.includes(data.status)) throw new Error('Invalid status')

    db.transaction((tx) => {
      const order = tx.select().from(purchaseOrders).where(eq(purchaseOrders.id, data.id)).get()
      if (!order) throw new Error('Purchase order not found')
      if (order.status === 'cancelled') throw new Error('Cancelled orders cannot change')
      if (order.status === 'received') throw new Error('Received orders cannot change')

      // Receiving adds the ordered quantities to stock, once.
      if (data.status === 'received') {
        const items = tx.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, order.id)).all()
        for (const item of items) {
          const product = tx.select().from(products).where(eq(products.id, item.productId)).get()
          if (!product) throw new Error(`Product ${item.productId} not found`)
          tx.update(products)
            .set({ stock: product.stock + item.quantity })
            .where(eq(products.id, product.id))
            .run()
        }
      }

      tx.update(purchaseOrders).set({ status: data.status }).where(eq(purchaseOrders.id, order.id)).run()
    })

    return { ok: true }
  })
