import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { products } from '@/db/schema'
import { requireText, requireInt, withUniqueCheck } from '@/lib/validation'

export const listProducts = createServerFn({ method: 'GET' }).handler(async () => {
  return db.select().from(products).orderBy(products.name).all()
})

export const createProduct = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      sku: string
      name: string
      category: string
      unitPrice: number
      stock: number
    }) => data,
  )
  .handler(async ({ data }) => {
    return withUniqueCheck(() =>
      db
        .insert(products)
        .values({
          sku: requireText(data.sku, 'SKU').toUpperCase(),
          name: requireText(data.name, 'Name'),
          category: requireText(data.category, 'Category'),
          unitPrice: requireInt(data.unitPrice, 'Price', 1),
          stock: requireInt(data.stock, 'Stock'),
        })
        .returning()
        .get(),
    )
  })

// ---------- Sales orders ----------
