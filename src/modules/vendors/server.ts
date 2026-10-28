import { createServerFn } from '@tanstack/react-start'
import { count, desc, eq, sum } from 'drizzle-orm'
import { db } from '@/db'
import { purchaseOrders, vendors } from '@/db/schema'
import { requireText, withUniqueCheck } from '@/lib/validation'

export const listVendors = createServerFn({ method: 'GET' }).handler(async () => {
  return db
    .select({
      id: vendors.id,
      name: vendors.name,
      email: vendors.email,
      phone: vendors.phone,
      city: vendors.city,
      category: vendors.category,
      paymentTerms: vendors.paymentTerms,
      orderCount: count(purchaseOrders.id),
      spend: sum(purchaseOrders.total),
    })
    .from(vendors)
    .leftJoin(purchaseOrders, eq(purchaseOrders.vendorId, vendors.id))
    .groupBy(vendors.id)
    .orderBy(desc(count(purchaseOrders.id)), vendors.name)
    .all()
    .map((row) => ({ ...row, spend: Number(row.spend ?? 0) }))
})

export const createVendor = createServerFn({ method: 'POST' })
  .validator(
    (data: { name: string; email: string; phone: string; city: string; category: string; paymentTerms: string }) => data,
  )
  .handler(async ({ data }) => {
    return withUniqueCheck(() =>
      db
        .insert(vendors)
        .values({
          name: requireText(data.name, 'Name'),
          email: requireText(data.email, 'Email').toLowerCase(),
          phone: data.phone?.trim() || null,
          city: requireText(data.city, 'City'),
          category: requireText(data.category, 'Category'),
          paymentTerms: requireText(data.paymentTerms, 'Payment terms'),
        })
        .returning()
        .get(),
    )
  })
