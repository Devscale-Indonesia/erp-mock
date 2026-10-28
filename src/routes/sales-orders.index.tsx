import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, ShoppingCart } from 'lucide-react'
import { DataTable } from '@/components/erp/data-table'
import { PageHeader } from '@/components/erp/page-header'
import { StatusBadge } from '@/components/erp/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate, formatIDR } from '@/lib/format'
import { ORDER_STATUSES, type OrderStatus } from '@/lib/order-status'
import { listOrders } from '@/modules/sales-orders/server'

export const Route = createFileRoute('/sales-orders/')({
  loader: () => listOrders(),
  component: SalesOrders,
})

type Order = Awaited<ReturnType<typeof listOrders>>[number]

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'number',
    header: 'Order',
    cell: ({ row }) => (
      <div>
        <Link to="/sales-orders/$orderId" params={{ orderId: String(row.original.id) }} className="font-medium hover:underline">
          {row.original.number}
        </Link>
        <div className="text-xs text-muted-foreground">{formatDate(row.original.orderDate)}</div>
      </div>
    ),
  },
  { accessorKey: 'customerName', header: 'Customer' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusBadge status={getValue<OrderStatus>()} />,
  },
  {
    accessorKey: 'total',
    header: 'Total',
    meta: { align: 'right' },
    cell: ({ getValue }) => formatIDR(getValue<number>()),
  },
]

function SalesOrders() {
  const orders = Route.useLoaderData()
  const [status, setStatus] = useState<'all' | OrderStatus>('all')
  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const o of orders) map.set(o.status, (map.get(o.status) ?? 0) + 1)
    return map
  }, [orders])
  const visible = status === 'all' ? orders : orders.filter((o) => o.status === status)

  return (
    <>
      <PageHeader
        title="Sales orders"
        description={`${orders.length} orders in the system`}
        actions={
          <Button asChild>
            <Link to="/sales-orders/new">
              <Plus /> New order
            </Link>
          </Button>
        }
      />

      <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">
            All <span className="ml-1.5 tabular-nums text-muted-foreground">{orders.length}</span>
          </TabsTrigger>
          {ORDER_STATUSES.map((s) => (
            <TabsTrigger key={s} value={s} className="capitalize">
              {s} <span className="ml-1.5 tabular-nums text-muted-foreground">{counts.get(s) ?? 0}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="min-h-0 flex-1">
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <DataTable
            columns={columns}
            data={visible}
            searchPlaceholder="Search by order number or customer"
            emptyTitle="No orders here"
            emptyDescription="Orders with this status will appear here."
            emptyIcon={ShoppingCart}
          />
        </CardContent>
      </Card>
    </>
  )
}
