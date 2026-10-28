import { z } from 'zod'

export const orderSchema = z.object({
  customerId: z.string().min(1, 'Choose a customer'),
  orderDate: z.string().min(1, 'Choose an order date'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Choose a product'),
        quantity: z.string().regex(/^\d+$/, 'Enter a quantity').refine((v) => Number(v) >= 1, 'Minimum 1'),
      }),
    )
    .min(1, 'Add at least one item'),
})
export type OrderForm = z.infer<typeof orderSchema>
