import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().trim().min(2, 'Enter the customer name'),
  email: z.email('Enter a valid email address'),
  phone: z.string().trim(),
  city: z.string().trim().min(2, 'Enter a city'),
})
export type CustomerForm = z.infer<typeof customerSchema>
