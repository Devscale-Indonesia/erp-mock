import { useMemo, useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from 'recharts'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Box, Download, Package, RefreshCw, Search, Wallet, BarChart3, ShoppingBag } from 'lucide-react'
import { PageHeader } from '@/components/erp/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCompactIDR, formatIDR, formatNumber } from '@/lib/format'
import { useIsMobile } from '@/hooks/use-mobile'
import { getDashboard } from '@/modules/dashboard/server'

export const Route = createFileRoute('/')({
  loader: () => getDashboard(),
  component: Dashboard,
})

// Percent change between two values; a zero baseline counts as 100% when the new value is positive.
function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

function Delta({ value }: { value: number }) {
  const up = value >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <Badge variant="outline" className={up ? 'border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'border-transparent bg-destructive/15 text-destructive'}>
      <Icon />
      {Math.abs(value).toFixed(1)}%
    </Badge>
  )
}

const salesConfig = {
  current: { label: 'This period', color: 'var(--chart-1)' },
  previous: { label: 'Last period', color: 'var(--chart-2)' },
} satisfies ChartConfig

function Dashboard() {
  const data = Route.useLoaderData()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [metric, setMetric] = useState<'value' | 'orders'>('value')
  const [productQuery, setProductQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const months = data.revenueByMonth
  const last = months.at(-1)
  const prev = months.at(-2)
  const totalValue = months.reduce((sum, m) => sum + m.total, 0)
  const totalOrders = months.reduce((sum, m) => sum + m.orders, 0)
  const avgOrder = totalOrders === 0 ? 0 : totalValue / totalOrders
  const avgOf = (m?: { total: number; orders: number }) => (m && m.orders > 0 ? m.total / m.orders : 0)

  const lastValue = last?.total ?? 0
  const prevValue = prev?.total ?? 0
  const lastOrders = last?.orders ?? 0
  const prevOrders = prev?.orders ?? 0

  const paidCount = data.statusCounts.find((s) => s.status === 'paid')?.n ?? 0
  const shippedCount = data.statusCounts.find((s) => s.status === 'shipped')?.n ?? 0
  const confirmedCount = data.statusCounts.find((s) => s.status === 'confirmed')?.n ?? 0
  const draftCount = data.statusCounts.find((s) => s.status === 'draft')?.n ?? 0
  const cancelledCount = data.statusCounts.find((s) => s.status === 'cancelled')?.n ?? 0
  const allOrders = draftCount + confirmedCount + shippedCount + paidCount + cancelledCount

  // Funnel: each stage counts orders that reached it (later stages imply earlier ones).
  const funnel = [
    { label: 'Orders created', count: allOrders },
    { label: 'Confirmed', count: confirmedCount + shippedCount + paidCount },
    { label: 'Shipped', count: shippedCount + paidCount },
    { label: 'Paid', count: paidCount },
  ]
  const conversion = allOrders === 0 ? 0 : (paidCount / allOrders) * 100

  const chartData = useMemo(
    () =>
      months.map((m, i) => ({
        month: m.month,
        current: metric === 'value' ? m.total : m.orders,
        previous: i > 0 ? (metric === 'value' ? months[i - 1]!.total : months[i - 1]!.orders) : 0,
      })),
    [months, metric],
  )

  const inStock = data.counts.products - data.outOfStock.length
  const lowStock = data.topProducts.filter((p) => p.stock > 0 && p.stock < 20).length
  const inStockPct = data.counts.products === 0 ? 0 : Math.round((inStock / data.counts.products) * 100)
  const filteredProducts = data.topProducts.filter((p) => {
    const q = productQuery.trim().toLowerCase()
    return !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
  })

  const stats = [
    {
      label: 'Net order value',
      value: formatCompactIDR(totalValue),
      delta: percentChange(lastValue, prevValue),
      footer: `${lastValue - prevValue >= 0 ? '+' : ''}${formatIDR(lastValue - prevValue)} from last month`,
      icon: Wallet,
    },
    {
      label: 'Average order',
      value: formatIDR(Math.round(avgOrder)),
      delta: percentChange(avgOf(last), avgOf(prev)),
      footer: `${formatIDR(Math.round(avgOf(last) - avgOf(prev)))} from last month`,
      icon: BarChart3,
    },
    {
      label: 'Total orders',
      value: formatNumber(totalOrders),
      delta: percentChange(lastOrders, prevOrders),
      footer: `${lastOrders - prevOrders >= 0 ? '+' : ''}${lastOrders - prevOrders} from last month`,
      icon: ShoppingBag,
    },
  ]

  async function refresh() {
    setRefreshing(true)
    await router.invalidate()
    setRefreshing(false)
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome back, Demo Admin"
        actions={
          <Button>
            <Download /> Export
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="gap-4">
            <CardHeader className="gap-1">
              <div className="flex items-start justify-between gap-2">
                <CardDescription className="text-xs font-medium tracking-wide uppercase">{stat.label}</CardDescription>
                <span className="flex size-9 items-center justify-center rounded-lg border bg-background">
                  <stat.icon className="size-4 text-muted-foreground" />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl tabular-nums">{stat.value}</CardTitle>
                <Delta value={stat.delta} />
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
              <span className="truncate">{stat.footer}</span>
              <Button variant="ghost" size="icon-sm" aria-label={`Open ${stat.label}`} asChild>
                <Link to="/sales-orders">
                  <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        <Card className="gap-4">
          <CardHeader className="gap-1">
            <div className="flex items-start justify-between gap-2">
              <CardDescription className="text-xs font-medium tracking-wide uppercase">Paid revenue</CardDescription>
              <span className="flex size-9 items-center justify-center rounded-lg border bg-background">
                <Wallet className="size-4 text-muted-foreground" />
              </span>
            </div>
            <CardTitle className="text-2xl tabular-nums">{formatCompactIDR(data.paidRevenue)}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
            <span className="truncate">{paidCount} paid orders</span>
            <Button variant="ghost" size="icon-sm" aria-label="Open paid orders" asChild>
              <Link to="/sales-orders">
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="gap-1">
            <div className="flex items-start justify-between gap-2">
              <CardDescription className="text-xs font-medium tracking-wide uppercase">Overall sales</CardDescription>
              <span className="flex size-9 items-center justify-center rounded-lg border bg-background">
                <BarChart3 className="size-4 text-muted-foreground" />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl tabular-nums">{metric === 'value' ? formatIDR(totalValue) : formatNumber(totalOrders)}</CardTitle>
              <Delta value={percentChange(lastValue, prevValue)} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Select value={metric} onValueChange={(v) => setMetric(v as 'value' | 'orders')}>
                <SelectTrigger className="w-[180px]" aria-label="Metric">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="value">Order value</SelectItem>
                  <SelectItem value="orders">Order count</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="size-2.5 rounded-sm bg-[var(--chart-1)]" /> This period
                </span>
                <span className="flex items-center gap-2">
                  <span className="size-2.5 rounded-sm bg-[var(--chart-2)]" /> Last period
                </span>
              </div>
            </div>
            {months.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No orders yet, so there is no sales trend to show.</p>
            ) : (
              <ChartContainer config={salesConfig} className={isMobile ? 'h-[200px] w-full' : 'h-[280px] w-full'}>
                <AreaChart data={chartData} margin={{ left: 4, right: 12 }}>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={72}
                    tickFormatter={(v) => (metric === 'value' ? formatCompactIDR(Number(v)) : formatNumber(Number(v)))}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        indicator="line"
                        formatter={(v) => (metric === 'value' ? formatIDR(Number(v)) : formatNumber(Number(v)))}
                      />
                    }
                  />
                  {/* Fill only: no outline, so the stroke sits on the top edge alone. */}
                  <Area dataKey="previous" type="monotone" stroke="none" fillOpacity={0.08} style={{ fill: 'var(--color-previous)' }} />
                  <Area dataKey="current" type="monotone" stroke="none" fillOpacity={0.12} style={{ fill: 'var(--color-current)' }} />
                  <Line dataKey="previous" type="monotone" dot={false} strokeWidth={2} style={{ stroke: 'var(--color-previous)' }} />
                  <Line dataKey="current" type="monotone" dot={false} strokeWidth={2} style={{ stroke: 'var(--color-current)' }} />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-1">
            <div className="flex items-start justify-between gap-2">
              <CardDescription className="text-xs font-medium tracking-wide uppercase">Conversion rate</CardDescription>
              <span className="flex size-9 items-center justify-center rounded-lg border bg-background">
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </span>
            </div>
            <CardTitle className="text-2xl tabular-nums">{conversion.toFixed(2)}%</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {funnel.map((stage) => {
              const pct = allOrders === 0 ? 0 : (stage.count / allOrders) * 100
              return (
                <div key={stage.label} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="font-medium">{stage.label}</div>
                    <div className="text-xs text-muted-foreground">{pct.toFixed(0)}% of orders</div>
                  </div>
                  <div className="text-lg font-semibold tabular-nums">{formatNumber(stage.count)}</div>
                </div>
              )
            })}
            {cancelledCount > 0 && (
              <p className="pt-3 text-xs text-muted-foreground">{cancelledCount} cancelled orders are excluded from the funnel.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader className="gap-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardDescription className="text-xs font-medium tracking-wide uppercase">Inventory</CardDescription>
                <CardTitle className="text-lg">Stock health</CardTitle>
              </div>
              <Button size="sm" asChild>
                <Link to="/products">Restock</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 text-sm leading-relaxed text-muted-foreground">
              {inStock} of {data.counts.products} products have stock on hand. {data.outOfStock.length} are out of stock and cannot be
              added to new orders until they are restocked.
            </div>
            <div className="grid grid-cols-2 divide-x rounded-lg border">
              <div className="space-y-1 p-4">
                <div className="text-xs text-muted-foreground">In stock</div>
                <div className="flex items-center gap-1 text-xl font-semibold tabular-nums">
                  <ArrowUpRight className="size-4 text-emerald-600" />
                  {inStockPct}%
                </div>
              </div>
              <div className="space-y-1 p-4">
                <div className="text-xs text-muted-foreground">Out of stock</div>
                <div className="flex items-center gap-1 text-xl font-semibold tabular-nums">
                  <Package className="size-4 text-muted-foreground" />
                  {data.outOfStock.length}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Low-stock items among top sellers: {lowStock}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-1">
            <div className="flex items-start justify-between gap-2">
              <CardDescription className="text-xs font-medium tracking-wide uppercase">Product list</CardDescription>
              <span className="flex size-9 items-center justify-center rounded-lg border bg-background">
                <Box className="size-4 text-muted-foreground" />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl tabular-nums">{formatNumber(data.counts.products)}</CardTitle>
              <Badge variant="secondary">{data.outOfStock.length} out of stock</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={productQuery} onChange={(e) => setProductQuery(e.target.value)} placeholder="Search products" className="pl-8" aria-label="Search products" />
              </div>
              <Button variant="outline" onClick={refresh} disabled={refreshing}>
                <RefreshCw className={refreshing ? 'animate-spin' : undefined} /> Refresh
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">Top products by units sold (cancelled orders excluded)</div>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Product info</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Sold</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No products match “{productQuery}”.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                              <Package className="size-4 text-muted-foreground" />
                            </span>
                            <div className="min-w-0">
                              <div className="truncate font-medium">{p.name}</div>
                              <div className="font-mono text-xs text-muted-foreground">{p.sku}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatIDR(p.unitPrice)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatNumber(p.stock)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatNumber(p.sold)}</TableCell>
                        <TableCell>
                          {p.stock === 0 ? (
                            <Badge variant="destructive">Out of stock</Badge>
                          ) : p.stock < 20 ? (
                            <Badge variant="secondary">Low</Badge>
                          ) : (
                            <Badge variant="outline" className="border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">In stock</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
