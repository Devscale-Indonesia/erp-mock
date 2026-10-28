import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ClipboardList, Plus } from 'lucide-react'
import { DataTable } from '@/components/erp/data-table'
import { PageHeader } from '@/components/erp/page-header'
import { StatusBadge } from '@/components/erp/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate, formatIDR } from '@/lib/format'
import { PURCHASE_STATUSES, type PurchaseStatus } from '@/lib/purchase-status'
import { listPurchaseOrders } from '@/modules/purchase-orders/server'

export const Route = createFileRoute('/purchase-orders/')({
  loader: () => listPurchaseOrders(),
  component: PurchaseOrders,
})

type PurchaseOrder = Awaited<ReturnType<typeof listPurchaseOrders>>[number]

const columns: ColumnDef<PurchaseOrder>[] = [
  {
    accessorKey: 'number',
    header: 'Purchase order',
    cell: ({ row }) => (
      <div>
        <Link to="/purchase-orders/$orderId" params={{ orderId: String(row.original.id) }} className="font-medium hover:underline">
          {row.original.number}
        </Link>
        <div className="text-xs text-muted-foreground">Expected {formatDate(row.original.expectedDate)}</div>
      </div>
    ),
  },
  { accessorKey: 'vendorName', header: 'Vendor' },
  { accessorKey: 'orderDate', header: 'Ordered', cell: ({ getValue }) => formatDate(getValue<string>()) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusBadge status={getValue<PurchaseStatus>()} />,
  },
  {
    accessorKey: 'total',
    header: 'Total',
    meta: { align: 'right' },
    cell: ({ getValue }) => formatIDR(getValue<number>()),
  },
]

function PurchaseOrders() {
  const orders = Route.useLoaderData()
  const [status, setStatus] = useState<'all' | PurchaseStatus>('all')
  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const o of orders) map.set(o.status, (map.get(o.status) ?? 0) + 1)
    return map
  }, [orders])
  const visible = status === 'all' ? orders : orders.filter((o) => o.status === status)

  return (
    <>
      <PageHeader
        title="Purchase orders"
        description={`${orders.length} purchase orders with suppliers`}
        actions={
          <Button asChild>
            <Link to="/purchase-orders/new">
              <Plus /> New purchase order
            </Link>
          </Button>
        }
      />

      <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">
            All <span className="ml-1.5 tabular-nums text-muted-foreground">{orders.length}</span>
          </TabsTrigger>
          {PURCHASE_STATUSES.map((s) => (
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
            searchPlaceholder="Search by purchase order or vendor"
            emptyTitle="No purchase orders here"
            emptyDescription="Orders with this status will appear here."
            emptyIcon={ClipboardList}
          />
        </CardContent>
      </Card>
    </>
  )
}
