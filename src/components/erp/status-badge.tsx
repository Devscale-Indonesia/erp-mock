import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/lib/order-status'
import type { PurchaseStatus } from '@/lib/purchase-status'
import { cn } from '@/lib/utils'

const styles: Record<OrderStatus | PurchaseStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  confirmed: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  ordered: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  shipped: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
  paid: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  received: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  cancelled: 'bg-destructive/15 text-destructive',
}

export function StatusBadge({
  status,
  className,
}: {
  status: OrderStatus | PurchaseStatus
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn('border-transparent capitalize', styles[status], className)}>
      {status}
    </Badge>
  )
}
