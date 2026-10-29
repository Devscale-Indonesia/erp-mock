import { z } from 'zod'
import { ORDER_STATUSES } from '@/lib/order-status'
import { PURCHASE_STATUSES } from '@/lib/purchase-status'

// What the AI must send to each tool. The tools in tools.ts use these as inputSchema,
// and services.ts uses the inferred types below.

export const findInput = z.object({
  kind: z.enum(['customers', 'products', 'vendors', 'employees', 'sales_orders', 'purchase_orders']),
  text: z.string().optional(),
})
export type FindInput = z.infer<typeof findInput>

export const idInput = z.object({ id: z.number() })
export type IdInput = z.infer<typeof idInput>

export const takeOrderInput = z.object({
  customerId: z.number(),
  items: z.array(z.object({ productId: z.number(), quantity: z.number() })),
  date: z.string().optional().describe('YYYY-MM-DD. Defaults to today.'),
})
export type TakeOrderInput = z.infer<typeof takeOrderInput>

export const moveSalesOrderInput = z.object({ id: z.number(), status: z.enum(ORDER_STATUSES) })
export type MoveSalesOrderInput = z.infer<typeof moveSalesOrderInput>

export const buyStockInput = z.object({
  vendorId: z.number(),
  items: z.array(z.object({ productId: z.number(), quantity: z.number(), unitCost: z.number() })),
  expectedDate: z.string().describe('YYYY-MM-DD'),
  date: z.string().optional().describe('YYYY-MM-DD. Defaults to today.'),
})
export type BuyStockInput = z.infer<typeof buyStockInput>

export const movePurchaseOrderInput = z.object({ id: z.number(), status: z.enum(PURCHASE_STATUSES) })
export type MovePurchaseOrderInput = z.infer<typeof movePurchaseOrderInput>

export const addCustomerInput = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  city: z.string(),
})
export type AddCustomerInput = z.infer<typeof addCustomerInput>

export const addVendorInput = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  city: z.string(),
  category: z.string(),
  paymentTerms: z.string().describe('For example "Net 30"'),
})
export type AddVendorInput = z.infer<typeof addVendorInput>

export const addProductInput = z.object({
  sku: z.string(),
  name: z.string(),
  category: z.string(),
  unitPrice: z.number(),
  stock: z.number(),
})
export type AddProductInput = z.infer<typeof addProductInput>

export const addEmployeeInput = z.object({
  name: z.string(),
  email: z.string(),
  department: z.string(),
  role: z.string(),
  hiredAt: z.string().describe('YYYY-MM-DD'),
})
export type AddEmployeeInput = z.infer<typeof addEmployeeInput>
