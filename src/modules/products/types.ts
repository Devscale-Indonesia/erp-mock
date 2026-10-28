import { z } from 'zod'

export const productSchema = z.object({
  sku: z.string().trim().min(2, 'Enter a SKU'),
  name: z.string().trim().min(2, 'Enter a product name'),
  category: z.string().trim().min(2, 'Enter a category'),
  unitPrice: z.string().regex(/^\d+$/, 'Enter a whole rupiah amount').refine((v) => Number(v) > 0, 'Price must be above zero'),
  stock: z.string().regex(/^\d+$/, 'Enter a whole number'),
})
export type ProductForm = z.infer<typeof productSchema>
