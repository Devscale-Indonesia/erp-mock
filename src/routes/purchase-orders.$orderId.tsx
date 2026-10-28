import { useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Ban, Check, Mail, PackageCheck, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/erp/page-header'
import { StatusBadge } from '@/components/erp/status-badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { errorMessage, formatDate, formatIDR, formatNumber, initials } from '@/lib/format'
import { getPurchaseOrder, setPurchaseOrderStatus } from '@/modules/purchase-orders/server'

export const Route = createFileRoute('/purchase-orders/$orderId')({
  loader: ({ params }) => getPurchaseOrder({ data: { id: Number(params.orderId) } }),
  component: PurchaseOrderDetail,
})

function PurchaseOrderDetail() {
  const { order, items } = Route.useLoaderData()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const closed = order.status === 'received' || order.status === 'cancelled'
  const units = items.reduce((sum, item) => sum + item.quantity, 0)

  async function changeStatus(status: 'ordered' | 'received' | 'cancelled') {
    setBusy(true)
    try {
      await setPurchaseOrderStatus({ data: { id: order.id, status } })
      toast.success(status === 'received' ? 'Stock received' : `Purchase order ${status}`)
      await router.invalidate()
    } catch (err) {
      toast.error('Could not update purchase order', { description: errorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
        <Link to="/purchase-orders">
          <ArrowLeft /> All purchase orders
        </Link>
      </Button>

      <PageHeader
        title={order.number}
        description={`${order.vendorName} · ordered ${formatDate(order.orderDate)} · expected ${formatDate(order.expectedDate)}`}
        actions={
          <>
            <StatusBadge status={order.status} className="mr-1" />
            {order.status === 'draft' && (
              <Button disabled={busy} onClick={() => changeStatus('ordered')}>
                <Truck /> Send to vendor
              </Button>
            )}
            {order.status === 'ordered' && (
              <Button disabled={busy} onClick={() => changeStatus('received')}>
                <PackageCheck /> Mark received
              </Button>
            )}
            {!closed && (
              <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={busy}>
                    <Ban /> Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel {order.number}?</AlertDialogTitle>
                    <AlertDialogDescription>Nothing has been received, so no stock changes. This cannot be undone.</AlertDialogDescription>
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
                      Yes, cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
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
                    <Truck />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{item.productName}</ItemTitle>
                    <ItemDescription className="font-mono">{item.sku}</ItemDescription>
                  </ItemContent>
                  <ItemActions className="text-right tabular-nums">
                    <div className="text-sm text-muted-foreground">
                      {item.quantity} × {formatIDR(item.unitCost)}
                    </div>
                    <div className="font-medium">{formatIDR(item.unitCost * item.quantity)}</div>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
            <Separator className="my-4" />
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Order total</span>
              <span className="text-xl font-semibold tabular-nums">{formatIDR(order.total)}</span>
            </div>
            {order.status === 'received' && (
              <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                <Check className="size-4" /> Received: stock was added for each line.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{initials(order.vendorName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <Link to="/vendors" className="block truncate font-medium hover:underline">
                    {order.vendorName}
                  </Link>
                  <span className="block truncate text-sm text-muted-foreground">{order.vendorEmail}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Payment terms: {order.paymentTerms}</p>
              <Button variant="outline" className="w-full" asChild>
                <a href={`mailto:${order.vendorEmail}?subject=${order.number}`}>
                  <Mail /> Email vendor
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
