import { format } from 'date-fns'
import { createCustomer, listCustomers } from '@/modules/customers/server'
import { getDashboard } from '@/modules/dashboard/server'
import { createEmployee, listEmployees } from '@/modules/employees/server'
import { createProduct, listProducts } from '@/modules/products/server'
import {
  createPurchaseOrder,
  getPurchaseOrder,
  listPurchaseOrders,
  setPurchaseOrderStatus,
} from '@/modules/purchase-orders/server'
import { createOrder, getOrder, listOrders, setOrderStatus } from '@/modules/sales-orders/server'
import { createVendor, listVendors } from '@/modules/vendors/server'
import type {
  AddCustomerInput,
  AddEmployeeInput,
  AddProductInput,
  AddVendorInput,
  BuyStockInput,
  FindInput,
  MovePurchaseOrderInput,
  MoveSalesOrderInput,
  TakeOrderInput,
} from './types'

// What each tool does. These are plain functions: they know nothing about MCP.
// They call the same server functions the pages use, so the business rules
// (stock checks, transactions, status rules) live in one place.

function today() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function seeBusiness() {
  return getDashboard()
}

export async function findRecords({ kind, text }: FindInput) {
  let rows: object[] = []
  if (kind === 'customers') rows = await listCustomers()
  if (kind === 'products') rows = await listProducts()
  if (kind === 'vendors') rows = await listVendors()
  if (kind === 'employees') rows = await listEmployees()
  if (kind === 'sales_orders') rows = await listOrders()
  if (kind === 'purchase_orders') rows = await listPurchaseOrders()

  if (!text) return rows
  return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(text.toLowerCase()))
}

export function openSalesOrder(id: number) {
  return getOrder({ data: { id } })
}

export function openPurchaseOrder(id: number) {
  return getPurchaseOrder({ data: { id } })
}

export async function takeOrder({ customerId, items, date }: TakeOrderInput) {
  const { id } = await createOrder({ data: { customerId, orderDate: date ?? today(), items } })
  return getOrder({ data: { id } })
}

export async function moveSalesOrder({ id, status }: MoveSalesOrderInput) {
  await setOrderStatus({ data: { id, status } })
  return getOrder({ data: { id } })
}

export async function buyStock({ vendorId, items, expectedDate, date }: BuyStockInput) {
  const { id } = await createPurchaseOrder({
    data: { vendorId, orderDate: date ?? today(), expectedDate, items },
  })
  return getPurchaseOrder({ data: { id } })
}

export async function movePurchaseOrder({ id, status }: MovePurchaseOrderInput) {
  await setPurchaseOrderStatus({ data: { id, status } })
  return getPurchaseOrder({ data: { id } })
}

export function addCustomer(input: AddCustomerInput) {
  return createCustomer({ data: input })
}

export function addVendor(input: AddVendorInput) {
  return createVendor({ data: input })
}

export function addProduct(input: AddProductInput) {
  return createProduct({ data: input })
}

export function addEmployee(input: AddEmployeeInput) {
  return createEmployee({ data: input })
}
