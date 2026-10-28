import { z } from 'zod'

export const vendorSchema = z.object({
  name: z.string().trim().min(2, 'Enter the vendor name'),
  email: z.email('Enter a valid email address'),
  phone: z.string().trim(),
  city: z.string().trim().min(2, 'Enter a city'),
  category: z.string().trim().min(2, 'Enter a category'),
  paymentTerms: z.string().trim().min(2, 'Enter payment terms'),
})
export type VendorForm = z.infer<typeof vendorSchema>
