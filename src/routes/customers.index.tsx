import { createFileRoute, Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Users } from 'lucide-react'
import { CustomerSheet } from '@/modules/customers/components/customer-sheet'
import { DataTable } from '@/components/erp/data-table'
import { PageHeader } from '@/components/erp/page-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatIDR, formatNumber, initials } from '@/lib/format'
import { listCustomers } from '@/modules/customers/server'

export const Route = createFileRoute('/customers/')({
  loader: () => listCustomers(),
  component: Customers,
})

type Customer = Awaited<ReturnType<typeof listCustomers>>[number]

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'name',
    header: 'Customer',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">{initials(row.original.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <Link
            to="/customers/$customerId"
            params={{ customerId: String(row.original.id) }}
            className="block truncate font-medium hover:underline"
          >
            {row.original.name}
          </Link>
          <span className="block truncate text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'city',
    header: 'City',
    cell: ({ getValue }) => <Badge variant="outline">{getValue<string>()}</Badge>,
  },
  {
    accessorKey: 'orderCount',
    header: 'Orders',
    meta: { align: 'right' },
    cell: ({ getValue }) => formatNumber(getValue<number>()),
  },
  {
    accessorKey: 'lifetimeValue',
    header: 'Lifetime value',
    meta: { align: 'right' },
    cell: ({ getValue }) => formatIDR(getValue<number>()),
  },
]

function Customers() {
  const customers = Route.useLoaderData()
  const active = customers.filter((c) => c.orderCount > 0).length

  return (
    <>
      <PageHeader
        title="Customers"
        description={`${formatNumber(customers.length)} accounts · ${active} with orders`}
        actions={<CustomerSheet />}
      />

      <Card className="min-h-0 flex-1">
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <DataTable
            columns={columns}
            data={customers}
            searchPlaceholder="Search by name, email or city"
            emptyTitle="No customers yet"
            emptyDescription="Add your first customer to start creating orders."
            emptyIcon={Users}
          />
        </CardContent>
      </Card>
    </>
  )
}
