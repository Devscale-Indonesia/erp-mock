import { z } from 'zod'

export const purchaseOrderSchema = z.object({
  vendorId: z.string().min(1, 'Choose a vendor'),
  orderDate: z.string().min(1, 'Choose an order date'),
  expectedDate: z.string().min(1, 'Choose an expected date'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Choose a product'),
        quantity: z.string().regex(/^\d+$/, 'Enter a quantity').refine((v) => Number(v) >= 1, 'Minimum 1'),
        unitCost: z.string().regex(/^\d+$/, 'Enter a whole rupiah amount').refine((v) => Number(v) >= 1, 'Cost must be above zero'),
      }),
    )
    .min(1, 'Add at least one item'),
})
export type PurchaseOrderForm = z.infer<typeof purchaseOrderSchema>
