import { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'
import {
  addCustomer,
  addEmployee,
  addProduct,
  addVendor,
  buyStock,
  findRecords,
  movePurchaseOrder,
  moveSalesOrder,
  openPurchaseOrder,
  openSalesOrder,
  seeBusiness,
  takeOrder,
} from './services'
import {
  addCustomerInput,
  addEmployeeInput,
  addProductInput,
  addVendorInput,
  buyStockInput,
  findInput,
  idInput,
  movePurchaseOrderInput,
  moveSalesOrderInput,
  takeOrderInput,
} from './types'

// A tool answers with text. We send JSON because the AI reads it well.
function reply(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
}

// One registerTool call per tool: a name, a description the AI reads, the inputs it
// accepts (types.ts), and the work (services.ts).
// If the work throws, the AI sees the error message.
export function createMcpServer() {
  const server = new McpServer({ name: 'erp-mock', version: '1.0.0' }, { capabilities: { tools: {} } })

  // ---------- Read ----------

  server.registerTool(
    'see_business',
    {
      description: 'Dashboard numbers: revenue, stock, order counts, best sellers. Money is in rupiah.',
      inputSchema: z.object({}),
    },
    async () => reply(await seeBusiness()),
  )

  server.registerTool(
    'find',
    {
      description:
        'List customers, products, vendors, employees, sales_orders or purchase_orders. Every row has an id: use it in the other tools. Give text to keep only rows that mention it.',
      inputSchema: findInput,
    },
    async (input) => reply(await findRecords(input)),
  )

  server.registerTool(
    'open_sales_order',
    { description: 'Show one sales order with its items.', inputSchema: idInput },
    async ({ id }) => reply(await openSalesOrder(id)),
  )

  server.registerTool(
    'open_purchase_order',
    { description: 'Show one purchase order with its items.', inputSchema: idInput },
    async ({ id }) => reply(await openPurchaseOrder(id)),
  )

  // ---------- Sales ----------

  server.registerTool(
    'take_order',
    {
      description: 'Create a sales order for a customer. The items leave stock. Fails if stock is too low.',
      inputSchema: takeOrderInput,
    },
    async (input) => reply(await takeOrder(input)),
  )

  server.registerTool(
    'move_sales_order',
    {
      description:
        'Change a sales order status. Cancelling an order that has not shipped puts its items back in stock. A cancelled order cannot change.',
      inputSchema: moveSalesOrderInput,
    },
    async (input) => reply(await moveSalesOrder(input)),
  )

  // ---------- Purchasing ----------

  server.registerTool(
    'buy_stock',
    {
      description: 'Create a purchase order for a vendor. Stock goes up only when the order is moved to received.',
      inputSchema: buyStockInput,
    },
    async (input) => reply(await buyStock(input)),
  )

  server.registerTool(
    'move_purchase_order',
    {
      description:
        'Change a purchase order status. Moving to received adds the items to stock. Received and cancelled orders cannot change.',
      inputSchema: movePurchaseOrderInput,
    },
    async (input) => reply(await movePurchaseOrder(input)),
  )

  // ---------- Add records ----------

  server.registerTool(
    'add_customer',
    { description: 'Add a customer. The email must be new.', inputSchema: addCustomerInput },
    async (input) => reply(await addCustomer(input)),
  )

  server.registerTool(
    'add_vendor',
    { description: 'Add a vendor. The email must be new.', inputSchema: addVendorInput },
    async (input) => reply(await addVendor(input)),
  )

  server.registerTool(
    'add_product',
    { description: 'Add a product. The SKU must be new. Price is whole rupiah.', inputSchema: addProductInput },
    async (input) => reply(await addProduct(input)),
  )

  server.registerTool(
    'add_employee',
    { description: 'Add an employee. The email must be new.', inputSchema: addEmployeeInput },
    async (input) => reply(await addEmployee(input)),
  )

  return server
}
