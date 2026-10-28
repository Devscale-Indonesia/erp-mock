import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Truck } from 'lucide-react'
import { DataTable } from '@/components/erp/data-table'
import { PageHeader } from '@/components/erp/page-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatIDR, formatNumber, initials } from '@/lib/format'
import { VendorSheet } from '@/modules/vendors/components/vendor-sheet'
import { listVendors } from '@/modules/vendors/server'

export const Route = createFileRoute('/vendors')({
  loader: () => listVendors(),
  component: Vendors,
})

type Vendor = Awaited<ReturnType<typeof listVendors>>[number]

const columns: ColumnDef<Vendor>[] = [
  {
    accessorKey: 'name',
    header: 'Vendor',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">{initials(row.original.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate font-medium">{row.original.name}</div>
          <div className="truncate text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
  },
  { accessorKey: 'category', header: 'Category', cell: ({ getValue }) => <Badge variant="secondary">{getValue<string>()}</Badge> },
  { accessorKey: 'city', header: 'City', cell: ({ getValue }) => <Badge variant="outline">{getValue<string>()}</Badge> },
  { accessorKey: 'paymentTerms', header: 'Terms' },
  {
    accessorKey: 'orderCount',
    header: 'Purchase orders',
    meta: { align: 'right' },
    cell: ({ getValue }) => formatNumber(getValue<number>()),
  },
  {
    accessorKey: 'spend',
    header: 'Total spend',
    meta: { align: 'right' },
    cell: ({ getValue }) => formatIDR(getValue<number>()),
  },
]

function Vendors() {
  const vendors = Route.useLoaderData()
  const active = vendors.filter((v) => v.orderCount > 0).length

  return (
    <>
      <PageHeader
        title="Vendors"
        description={`${vendors.length} suppliers · ${active} with purchase orders`}
        actions={<VendorSheet />}
      />

      <Card className="min-h-0 flex-1">
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <DataTable
            columns={columns}
            data={vendors}
            searchPlaceholder="Search name, email, category or city"
            emptyTitle="No vendors yet"
            emptyDescription="Add a supplier to start buying stock."
            emptyIcon={Truck}
          />
        </CardContent>
      </Card>
    </>
  )
}
