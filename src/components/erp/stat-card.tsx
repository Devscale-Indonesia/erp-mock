import type { LucideIcon } from 'lucide-react'
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        <CardAction>
          <span className="flex size-9 items-center justify-center rounded-md bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </span>
        </CardAction>
      </CardHeader>
      {hint && (
        <div className="px-6 pb-4">
          <Badge variant="secondary">{hint}</Badge>
        </div>
      )}
    </Card>
  )
}
