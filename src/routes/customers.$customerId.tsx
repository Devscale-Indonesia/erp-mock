import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Mail, MapPin, Phone, ShoppingBag, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/erp/page-header'
import { StatCard } from '@/components/erp/stat-card'
import { StatusBadge } from '@/components/erp/status-badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate, formatIDR, initials } from '@/lib/format'
import { getCustomer } from '@/modules/customers/server'

export const Route = createFileRoute('/customers/$customerId')({
  loader: ({ params }) => getCustomer({ data: { id: Number(params.customerId) } }),
  component: CustomerDetail,
})

function CustomerDetail() {
  const { customer, orders } = Route.useLoaderData()
  const lifetimeValue = orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0)
  const lastOrder = orders[0]

  return (
    <>
      <Button variant="ghost" size="sm" className="w-fit -ml-2" asChild>
        <Link to="/customers">
          <ArrowLeft /> All customers
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="size-14">
          <AvatarFallback className="text-lg">{initials(customer.name)}</AvatarFallback>
        </Avatar>
        <PageHeader
          title={customer.name}
          description={`Customer since ${formatDate(customer.createdAt.slice(0, 10))}`}
          actions={
            <>
              <Button variant="outline" asChild>
                <a href={`mailto:${customer.email}`}>
                  <Mail /> Email
                </a>
              </Button>
              <Button asChild>
                <Link to="/sales-orders/new">New order</Link>
              </Button>
            </>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Orders" value={String(orders.length)} icon={ShoppingBag} hint={`${orders.filter((o) => o.status === 'paid').length} paid`} />
        <StatCard label="Lifetime value" value={formatIDR(lifetimeValue)} icon={Wallet} hint="Excludes cancelled" />
        <StatCard label="Last order" value={lastOrder ? formatDate(lastOrder.orderDate) : '—'} icon={MapPin} hint={lastOrder ? lastOrder.number : 'No orders yet'} />
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardContent className="pt-6">
              {orders.length === 0 ? (
                <Empty className="border-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ShoppingBag />
                    </EmptyMedia>
                    <EmptyTitle>No orders yet</EmptyTitle>
                    <EmptyDescription>Create the first sales order for this customer.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell>
                          <Link to="/sales-orders/$orderId" params={{ orderId: String(o.id) }} className="font-medium hover:underline">
                            {o.number}
                          </Link>
                        </TableCell>
                        <TableCell>{formatDate(o.orderDate)}</TableCell>
                        <TableCell>
                          <StatusBadge status={o.status} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatIDR(o.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>Used on invoices and delivery notes</CardDescription>
            </CardHeader>
            <CardContent>
              <ItemGroup>
                <Item variant="outline">
                  <ItemMedia variant="icon">
                    <Mail />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Email</ItemTitle>
                    <ItemDescription>{customer.email}</ItemDescription>
                  </ItemContent>
                </Item>
                <Item variant="outline">
                  <ItemMedia variant="icon">
                    <Phone />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Phone</ItemTitle>
                    <ItemDescription>{customer.phone ?? 'Not provided'}</ItemDescription>
                  </ItemContent>
                </Item>
                <Item variant="outline">
                  <ItemMedia variant="icon">
                    <MapPin />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>City</ItemTitle>
                    <ItemDescription>{customer.city}</ItemDescription>
                  </ItemContent>
                </Item>
              </ItemGroup>
              <Separator className="my-4" />
              <Badge variant="secondary">Customer ID {customer.id}</Badge>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
