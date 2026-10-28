import { createServerFn } from '@tanstack/react-start'
import { count, desc, eq, sum } from 'drizzle-orm'
import { db } from '@/db'
import { customers, salesOrders } from '@/db/schema'
import { requireText, withUniqueCheck } from '@/lib/validation'

export const listCustomers = createServerFn({ method: 'GET' }).handler(async () => {
  return db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      city: customers.city,
      orderCount: count(salesOrders.id),
      lifetimeValue: sum(salesOrders.total),
    })
    .from(customers)
    .leftJoin(salesOrders, eq(salesOrders.customerId, customers.id))
    .groupBy(customers.id)
    .orderBy(customers.name)
    .all()
    .map((row) => ({ ...row, lifetimeValue: Number(row.lifetimeValue ?? 0) }))
})

export const getCustomer = createServerFn({ method: 'GET' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const customer = db.select().from(customers).where(eq(customers.id, data.id)).get()
    if (!customer) throw new Error('Customer not found')
    const orders = db
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.customerId, data.id))
      .orderBy(desc(salesOrders.id))
      .all()
    return { customer, orders }
  })

export const createCustomer = createServerFn({ method: 'POST' })
  .validator(
    (data: { name: string; email: string; phone: string; city: string }) => data,
  )
  .handler(async ({ data }) => {
    return withUniqueCheck(() =>
      db
        .insert(customers)
        .values({
          name: requireText(data.name, 'Name'),
          email: requireText(data.email, 'Email').toLowerCase(),
          phone: data.phone?.trim() || null,
          city: requireText(data.city, 'City'),
        })
        .returning()
        .get(),
    )
  })

// ---------- Products ----------
