import { createServerFn } from '@tanstack/react-start'
import { count, desc, eq, ne, sql, sum } from 'drizzle-orm'
import { db } from '@/db'
import { customers, employees, products, salesOrderItems, salesOrders } from '@/db/schema'

export const getDashboard = createServerFn({ method: 'GET' }).handler(async () => {
  const [customerCount] = db.select({ n: count() }).from(customers).all()
  const [productCount] = db.select({ n: count() }).from(products).all()
  const [employeeCount] = db.select({ n: count() }).from(employees).all()
  const [revenue] = db
    .select({ total: sum(salesOrders.total) })
    .from(salesOrders)
    .where(eq(salesOrders.status, 'paid'))
    .all()

  // Last six months of non-cancelled order value, oldest first for charting.
  const revenueByMonth = db
    .select({
      month: sql<string>`substr(${salesOrders.orderDate}, 1, 7)`,
      total: sum(salesOrders.total),
      orders: count(),
    })
    .from(salesOrders)
    .where(ne(salesOrders.status, 'cancelled'))
    .groupBy(sql`substr(${salesOrders.orderDate}, 1, 7)`)
    .orderBy(desc(sql`substr(${salesOrders.orderDate}, 1, 7)`))
    .limit(6)
    .all()
    .map((row) => ({ month: row.month, total: Number(row.total ?? 0), orders: row.orders }))
    .reverse()

  const stockByCategory = db
    .select({
      category: products.category,
      stock: sum(products.stock),
      skus: count(),
    })
    .from(products)
    .groupBy(products.category)
    .orderBy(products.category)
    .all()
    .map((row) => ({ category: row.category, stock: Number(row.stock ?? 0), skus: row.skus }))

  const statusCounts = db
    .select({ status: salesOrders.status, n: count() })
    .from(salesOrders)
    .groupBy(salesOrders.status)
    .all()

  // Units sold per product, ignoring cancelled orders. Feeds the dashboard product table.
  // The CASE skips quantities on cancelled orders; a filter in the JOIN condition
  // cannot do this because the raw item quantity would still be summed.
  // Products with no sales sum to NULL, converted to 0 below.
  const nonCancelledUnits = sql<number | null>`case when ${salesOrders.status} <> 'cancelled' then ${salesOrderItems.quantity} end`
  const topProducts = db
    .select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      category: products.category,
      unitPrice: products.unitPrice,
      stock: products.stock,
      sold: sum(nonCancelledUnits),
    })
    .from(products)
    .leftJoin(salesOrderItems, eq(salesOrderItems.productId, products.id))
    .leftJoin(salesOrders, eq(salesOrders.id, salesOrderItems.orderId))
    .groupBy(products.id)
    .orderBy(desc(sum(nonCancelledUnits)), products.name)
    .limit(8)
    .all()
    .map((row) => ({ ...row, sold: Number(row.sold ?? 0) }))

  const outOfStock = db.select().from(products).where(eq(products.stock, 0)).limit(5).all()

  const recentOrders = db
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
    .orderBy(desc(salesOrders.orderDate), desc(salesOrders.id))
    .limit(6)
    .all()

  return {
    counts: {
      customers: customerCount.n,
      products: productCount.n,
      employees: employeeCount.n,
    },
    paidRevenue: Number(revenue.total ?? 0),
    revenueByMonth,
    stockByCategory,
    statusCounts,
    outOfStock,
    topProducts,
    recentOrders,
  }
})

// ---------- Customers ----------
