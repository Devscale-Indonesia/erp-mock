// Fills the database with deterministic mock data.
// Usage: npm run db:seed              (skips when data already exists)
//        npm run db:seed -- --force    (wipes ERP tables and reseeds)
import { eq, sql } from 'drizzle-orm'
import { db } from './index'
import {
  customers,
  employees,
  products,
  purchaseOrderItems,
  purchaseOrders,
  salesOrderItems,
  salesOrders,
  vendors,
} from './schema'
import type { OrderStatus } from '../lib/order-status'
import type { PurchaseStatus } from '../lib/purchase-status'

// Small seeded PRNG so every run produces the same data.
function createRandom(seed: number) {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const random = createRandom(42)
const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)]
const between = (min: number, max: number) => min + Math.floor(random() * (max - min + 1))

const customerSeed = [
  { name: 'Aruna Textiles', city: 'Surabaya' },
  { name: 'Bintang Logistik', city: 'Jakarta' },
  { name: 'Cahaya Foods', city: 'Bandung' },
  { name: 'Dharma Hardware', city: 'Semarang' },
  { name: 'Eka Pharma Distribusi', city: 'Medan' },
  { name: 'Fajar Electronics', city: 'Jakarta' },
  { name: 'Gemilang Printing', city: 'Yogyakarta' },
  { name: 'Harapan Motor', city: 'Malang' },
  { name: 'Indah Interior', city: 'Bali' },
  { name: 'Jaya Konstruksi', city: 'Makassar' },
  { name: 'Kencana Retail', city: 'Surabaya' },
  { name: 'Lentera Edukasi', city: 'Bandung' },
]

const productSeed = [
  { sku: 'ELC-001', name: 'Laptop 14"', category: 'Electronics', price: 14_500_000, stock: 40 },
  { sku: 'ELC-002', name: 'Monitor 27" 4K', category: 'Electronics', price: 4_200_000, stock: 60 },
  { sku: 'ELC-003', name: 'Wireless Mouse', category: 'Electronics', price: 185_000, stock: 300 },
  { sku: 'ELC-004', name: 'Mechanical Keyboard', category: 'Electronics', price: 690_000, stock: 120 },
  { sku: 'ELC-005', name: 'USB-C Dock', category: 'Electronics', price: 1_150_000, stock: 0 },
  { sku: 'OFC-001', name: 'A4 Paper (ream)', category: 'Office', price: 58_000, stock: 800 },
  { sku: 'OFC-002', name: 'Ballpoint Pen (box)', category: 'Office', price: 32_000, stock: 500 },
  { sku: 'OFC-003', name: 'Stapler Heavy Duty', category: 'Office', price: 95_000, stock: 150 },
  { sku: 'OFC-004', name: 'Whiteboard 120x90', category: 'Office', price: 720_000, stock: 25 },
  { sku: 'FRN-001', name: 'Ergonomic Chair', category: 'Furniture', price: 2_350_000, stock: 35 },
  { sku: 'FRN-002', name: 'Standing Desk', category: 'Furniture', price: 3_900_000, stock: 18 },
  { sku: 'FRN-003', name: 'Filing Cabinet 4-drawer', category: 'Furniture', price: 1_480_000, stock: 0 },
  { sku: 'ACC-001', name: 'Laptop Sleeve 14"', category: 'Accessories', price: 215_000, stock: 200 },
  { sku: 'ACC-002', name: 'Webcam 1080p', category: 'Accessories', price: 560_000, stock: 90 },
  { sku: 'ACC-003', name: 'Desk Lamp LED', category: 'Accessories', price: 310_000, stock: 75 },
  { sku: 'ACC-004', name: 'Noise-cancelling Headset', category: 'Accessories', price: 1_250_000, stock: 55 },
  { sku: 'NET-001', name: 'Wi-Fi 6 Router', category: 'Networking', price: 1_100_000, stock: 45 },
  { sku: 'NET-002', name: 'Managed Switch 24p', category: 'Networking', price: 3_600_000, stock: 12 },
  { sku: 'NET-003', name: 'Cat6 Cable 305m', category: 'Networking', price: 1_750_000, stock: 20 },
  { sku: 'PRN-001', name: 'Laser Printer Mono', category: 'Printing', price: 2_750_000, stock: 16 },
]

const vendorSeed = [
  { name: 'Tekno Nusantara', email: 'sales@tekno-nusantara.example', phone: '+62 21-555-0101', city: 'Jakarta', category: 'Electronics', paymentTerms: 'Net 30' },
  { name: 'Global Gadget Import', email: 'orders@global-gadget.example', phone: '+62 778-555-0102', city: 'Batam', category: 'Electronics', paymentTerms: 'Net 60' },
  { name: 'Kantor Maju', email: 'order@kantor-maju.example', phone: '+62 22-555-0103', city: 'Bandung', category: 'Office', paymentTerms: 'Net 14' },
  { name: 'Sumber Alat Kantor', email: 'po@sumber-kantor.example', phone: '+62 61-555-0104', city: 'Medan', category: 'Office', paymentTerms: 'Net 30' },
  { name: 'Mebel Prima', email: 'trade@mebel-prima.example', phone: '+62 24-555-0105', city: 'Semarang', category: 'Furniture', paymentTerms: 'Net 45' },
  { name: 'Aksesoris Jaya', email: 'supply@aksesoris-jaya.example', phone: '+62 31-555-0106', city: 'Surabaya', category: 'Accessories', paymentTerms: 'Net 30' },
  { name: 'Jaringan Cepat', email: 'sales@jaringan-cepat.example', phone: '+62 21-555-0107', city: 'Jakarta', category: 'Networking', paymentTerms: 'Net 30' },
  { name: 'Cetak Sempurna', email: 'hello@cetak-sempurna.example', phone: '+62 274-555-0108', city: 'Yogyakarta', category: 'Printing', paymentTerms: 'Net 14' },
]

const employeeSeed = [
  { name: 'Rina Hartono', department: 'Sales', role: 'Sales Manager' },
  { name: 'Budi Santoso', department: 'Sales', role: 'Account Executive' },
  { name: 'Sari Wulandari', department: 'Sales', role: 'Account Executive' },
  { name: 'Agus Pratama', department: 'Operations', role: 'Warehouse Lead' },
  { name: 'Dewi Lestari', department: 'Operations', role: 'Inventory Analyst' },
  { name: 'Hendra Wijaya', department: 'Operations', role: 'Logistics Coordinator' },
  { name: 'Maya Putri', department: 'Finance', role: 'Accountant' },
  { name: 'Yoga Saputra', department: 'Finance', role: 'Finance Manager' },
  { name: 'Lina Marlina', department: 'People', role: 'HR Specialist' },
  { name: 'Fikri Ramadhan', department: 'Engineering', role: 'Software Engineer' },
]

function isoDate(daysAgo: number) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function emailOf(name: string, domain: string) {
  return `${name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '')}@${domain}`
}

function seed() {
  // Skip when data already exists so container restarts keep the volume as-is.
  const force = process.argv.includes("--force")
  if (!force && db.select().from(customers).limit(1).all().length > 0) {
    console.log("Database already has data; skipping seed. Use --force to reset.")
    return
  }

  let createdOrders = 0
  let insertedVendorCount = 0
  let createdPurchases = 0

  db.transaction((tx) => {
    // Child tables first so foreign keys stay valid.
    tx.delete(salesOrderItems).run()
    tx.delete(salesOrders).run()
    tx.delete(purchaseOrderItems).run()
    tx.delete(purchaseOrders).run()
    tx.delete(products).run()
    tx.delete(vendors).run()
    tx.delete(customers).run()
    tx.delete(employees).run()
    // Restart ID counters so reseeding yields the same IDs every time.
    tx.run(sql`DELETE FROM sqlite_sequence WHERE name IN ('customers', 'products', 'employees', 'sales_orders', 'sales_order_items', 'vendors', 'purchase_orders', 'purchase_order_items')`)

    const insertedCustomers = tx
      .insert(customers)
      .values(
        customerSeed.map((c) => ({
          name: c.name,
          city: c.city,
          email: emailOf(c.name, 'example.com'),
          phone: `+62 8${between(10, 99)}-${between(1000, 9999)}-${between(1000, 9999)}`,
        })),
      )
      .returning()
      .all()

    const insertedVendors = tx.insert(vendors).values(vendorSeed).returning().all()
    insertedVendorCount = insertedVendors.length

    const insertedProducts = tx
      .insert(products)
      .values(
        productSeed.map((p) => ({
          sku: p.sku,
          name: p.name,
          category: p.category,
          unitPrice: p.price,
          stock: p.stock,
          // Each product gets the first vendor that supplies its category.
          vendorId: (insertedVendors.find((v) => v.category === p.category) ?? insertedVendors[0]!).id,
        })),
      )
      .returning()
      .all()

    tx.insert(employees)
      .values(
        employeeSeed.map((e, i) => ({
          name: e.name,
          email: emailOf(e.name, 'anvia.dev'),
          department: e.department,
          role: e.role,
          hiredAt: isoDate(200 + i * 97),
          active: i !== 9,
        })),
      )
      .run()

    // Orders: spread over the last 90 days. Stock is decremented for every order
    // except cancelled ones, mirroring what createOrder does.
    const stock = new Map(insertedProducts.map((p) => [p.id, p.stock]))
    const statusWeights: OrderStatus[] = [
      'paid', 'paid', 'paid', 'shipped', 'shipped', 'confirmed', 'confirmed', 'draft', 'cancelled',
    ]
    const orderCount = 40

    for (let i = 1; i <= orderCount; i++) {
      const status = pick(statusWeights)
      const customer = pick(insertedCustomers)
      const lineCount = between(1, 4)
      const lines = new Map<number, number>()

      for (let l = 0; l < lineCount; l++) {
        const product = pick(insertedProducts)
        const qty = between(1, 6)
        const available = stock.get(product.id) ?? 0
        if (status !== 'cancelled' && available < qty) continue
        lines.set(product.id, (lines.get(product.id) ?? 0) + qty)
      }
      if (lines.size === 0) continue

      let total = 0
      for (const [productId, qty] of lines) {
        const product = insertedProducts.find((p) => p.id === productId)!
        total += product.unitPrice * qty
        if (status !== 'cancelled') stock.set(productId, (stock.get(productId) ?? 0) - qty)
      }

      const order = tx
        .insert(salesOrders)
        .values({
          number: 'TEMP',
          customerId: customer.id,
          status,
          orderDate: isoDate(between(0, 90)),
          total,
        })
        .returning()
        .get()

      tx.update(salesOrders)
        .set({ number: `SO-${String(order.id).padStart(4, '0')}` })
        .where(eq(salesOrders.id, order.id))
        .run()

      tx.insert(salesOrderItems)
        .values(
          [...lines].map(([productId, quantity]) => ({
            orderId: order.id,
            productId,
            quantity,
            unitPrice: insertedProducts.find((p) => p.id === productId)!.unitPrice,
          })),
        )
        .run()
      createdOrders++
    }

    // Purchase orders: received ones add to stock; the rest leave stock unchanged.
    const purchaseStatuses: PurchaseStatus[] = ['received', 'received', 'received', 'ordered', 'ordered', 'draft', 'cancelled']
    for (let i = 1; i <= 14; i++) {
      const vendor = pick(insertedVendors)
      const vendorProducts = insertedProducts.filter((p) => p.vendorId === vendor.id)
      if (vendorProducts.length === 0) continue

      const status = pick(purchaseStatuses)
      const lines = new Map<number, number>()
      for (let l = 0; l < between(1, 3); l++) {
        const product = pick(vendorProducts)
        lines.set(product.id, (lines.get(product.id) ?? 0) + between(10, 60))
      }

      let total = 0
      for (const [productId, quantity] of lines) {
        const product = insertedProducts.find((p) => p.id === productId)!
        total += Math.round(product.unitPrice * 0.6) * quantity
        if (status === 'received') stock.set(productId, (stock.get(productId) ?? 0) + quantity)
      }

      const orderDate = isoDate(between(0, 90))
      const expected = new Date(`${orderDate}T00:00:00`)
      expected.setDate(expected.getDate() + between(7, 30))
      const order = tx
        .insert(purchaseOrders)
        .values({
          number: 'TEMP',
          vendorId: vendor.id,
          status,
          orderDate,
          expectedDate: expected.toISOString().slice(0, 10),
          total,
        })
        .returning()
        .get()

      tx.update(purchaseOrders)
        .set({ number: `PO-${String(order.id).padStart(4, '0')}` })
        .where(eq(purchaseOrders.id, order.id))
        .run()

      tx.insert(purchaseOrderItems)
        .values(
          [...lines].map(([productId, quantity]) => ({
            purchaseOrderId: order.id,
            productId,
            quantity,
            unitCost: Math.round(insertedProducts.find((p) => p.id === productId)!.unitPrice * 0.6),
          })),
        )
        .run()
      createdPurchases++
    }

    for (const product of insertedProducts) {
      tx.update(products)
        .set({ stock: stock.get(product.id) ?? 0 })
        .where(eq(products.id, product.id))
        .run()
    }
  })

  console.log(
    `Seeded ${customerSeed.length} customers, ${productSeed.length} products, ` +
      `${employeeSeed.length} employees, ${insertedVendorCount} vendors, ${createdOrders} sales orders, ${createdPurchases} purchase orders.`,
  )
}

seed()
