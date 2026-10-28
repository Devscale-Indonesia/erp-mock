import { useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Check, ChevronDown, Circle, ArrowLeft, Ban, Mail, Package } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/erp/page-header'
import { StatusBadge } from '@/components/erp/status-badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle } from '@/components/ui/trace'
import { errorMessage, formatDate, formatIDR, formatNumber, initials } from '@/lib/format'
import { ORDER_STATUSES, type OrderStatus } from '@/lib/order-status'
import { getOrder, setOrderStatus } from '@/modules/sales-orders/server'

export const Route = createFileRoute('/sales-orders/$orderId')({
  loader: ({ params }) => getOrder({ data: { id: Number(params.orderId) } }),
  component: OrderDetail,
})

const LIFECYCLE: { status: OrderStatus; label: string; detail: string }[] = [
  { status: 'confirmed', label: 'Confirmed', detail: 'Stock reserved for the order' },
  { status: 'shipped', label: 'Shipped', detail: 'Handed to the courier' },
  { status: 'paid', label: 'Paid', detail: 'Payment received' },
]

function OrderDetail() {
  const { order, items } = Route.useLoaderData()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const isCancelled = order.status === 'cancelled'
  const currentIndex = LIFECYCLE.findIndex((step) => step.status === order.status)
  const units = items.reduce((sum, item) => sum + item.quantity, 0)

  async function changeStatus(status: OrderStatus) {
    setBusy(true)
    try {
      await setOrderStatus({ data: { id: order.id, status } })
      toast.success(`Order marked ${status}`)
      await router.invalidate()
    } catch (err) {
      toast.error('Could not update order', { description: errorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
        <Link to="/sales-orders">
          <ArrowLeft /> All orders
        </Link>
      </Button>

      <PageHeader
        title={order.number}
        description={`${order.customerName} · ordered ${formatDate(order.orderDate)}`}
        actions={
          <>
            <StatusBadge status={order.status} className="mr-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={busy || isCancelled}>
                  Update status <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Move to</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ORDER_STATUSES.filter((s) => s !== order.status && s !== 'cancelled').map((s) => (
                  <DropdownMenuItem key={s} className="capitalize" onSelect={() => changeStatus(s)}>
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={busy || isCancelled}>
                  <Ban /> Cancel order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel {order.number}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Reserved stock for its {units} units goes back to inventory. A cancelled order cannot be reopened.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep order</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={async () => {
                      await changeStatus('cancelled')
                      setCancelOpen(false)
                    }}
                  >
                    Yes, cancel order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lifecycle</CardTitle>
              <CardDescription>{isCancelled ? 'This order was cancelled.' : 'Where this order is in its journey.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Trace>
                {LIFECYCLE.map((step, i) => {
                  const reached = !isCancelled && currentIndex >= i
                  const current = !isCancelled && currentIndex === i
                  return (
                    <TraceLine key={step.status} status={reached ? undefined : 'pending'}>
                      <TraceIcon>{reached ? <Check className="text-emerald-600" /> : <Circle />}</TraceIcon>
                      <div>
                        <TraceTitle className={current ? 'font-semibold text-foreground' : undefined}>{step.label}</TraceTitle>
                        <TraceDescription>{step.detail}</TraceDescription>
                      </div>
                    </TraceLine>
                  )
                })}
                {isCancelled && (
                  <TraceLine status="error">
                    <TraceIcon>
                      <Ban />
                    </TraceIcon>
                    <TraceTitle>Cancelled</TraceTitle>
                  </TraceLine>
                )}
              </Trace>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>
                {items.length} products · {formatNumber(units)} units
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ItemGroup>
                {items.map((item) => (
                  <Item key={item.id} variant="outline">
                    <ItemMedia variant="icon">
                      <Package />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{item.productName}</ItemTitle>
                      <ItemDescription className="font-mono">{item.sku}</ItemDescription>
                    </ItemContent>
                    <ItemActions className="text-right tabular-nums">
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} × {formatIDR(item.unitPrice)}
                      </div>
                      <div className="font-medium">{formatIDR(item.unitPrice * item.quantity)}</div>
                    </ItemActions>
                  </Item>
                ))}
              </ItemGroup>
              <Separator className="my-4" />
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Order total</span>
                <span className="text-xl font-semibold tabular-nums">{formatIDR(order.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{initials(order.customerName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <Link to="/customers/$customerId" params={{ customerId: String(order.customerId) }} className="block truncate font-medium hover:underline">
                    {order.customerName}
                  </Link>
                  <span className="block truncate text-sm text-muted-foreground">{order.customerEmail}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <a href={`mailto:${order.customerEmail}?subject=${order.number}`}>
                  <Mail /> Email customer
                </a>
              </Button>
            </CardContent>
          </Card>

          <TraceCollapsible>
            <Card>
              <CardHeader>
                <CardTitle>
                  <TraceCollapsibleTrigger className="flex items-center gap-2">
                    Audit notes
                    <ChevronDown className="size-4 transition-transform data-[state=open]:rotate-180" />
                  </TraceCollapsibleTrigger>
                </CardTitle>
              </CardHeader>
              <TraceCollapsibleContent>
                <CardContent className="text-sm text-muted-foreground">
                  <p>
                    Status changes are applied in a single transaction. Cancelling an unshipped order restores stock for every
                    line.
                  </p>
                </CardContent>
              </TraceCollapsibleContent>
            </Card>
          </TraceCollapsible>
        </div>
      </div>
    </>
  )
}
