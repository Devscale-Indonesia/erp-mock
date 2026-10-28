import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Package } from 'lucide-react'
import { DataTable } from '@/components/erp/data-table'
import { PageHeader } from '@/components/erp/page-header'
import { ProductSheet } from '@/modules/products/components/product-sheet'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { formatIDR, formatNumber } from '@/lib/format'
import { listProducts } from '@/modules/products/server'

export const Route = createFileRoute('/products')({
  loader: () => listProducts(),
  component: Products,
})

type Product = Awaited<ReturnType<typeof listProducts>>[number]

function stockState(stock: number) {
  if (stock === 0) return { label: 'Out of stock', variant: 'destructive' as const }
  if (stock < 20) return { label: 'Low', variant: 'secondary' as const }
  return { label: 'In stock', variant: 'outline' as const }
}

function Products() {
  const products = Route.useLoaderData()
  const [category, setCategory] = useState<string>('all')
  const categories = useMemo(() => [...new Set(products.map((p) => p.category))].sort(), [products])
  const maxStock = Math.max(1, ...products.map((p) => p.stock))
  const visible = category === 'all' ? products : products.filter((p) => p.category === category)

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ getValue }) => <span className="font-mono text-xs">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.category}</div>
        </div>
      ),
    },
    {
      accessorKey: 'unitPrice',
      header: 'Unit price',
      meta: { align: 'right' },
      cell: ({ getValue }) => formatIDR(getValue<number>()),
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      meta: { align: 'right' },
      cell: ({ getValue }) => {
        const stock = getValue<number>()
        const state = stockState(stock)
        return (
          <div className="ml-auto flex max-w-[220px] items-center gap-3">
            <Progress value={(stock / maxStock) * 100} className="h-1.5 flex-1" aria-label={`${stock} units`} />
            <span className="w-14 text-right tabular-nums">{formatNumber(stock)}</span>
            <Badge variant={state.variant} className="hidden lg:inline-flex">
              {state.label}
            </Badge>
          </div>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} SKUs across ${categories.length} categories`}
        actions={<ProductSheet categories={categories} />}
      />

      <Card className="min-h-0 flex-1">
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <DataTable
            columns={columns}
            data={visible}
            searchPlaceholder="Search SKU, name or category"
            emptyTitle="No products in this category"
            emptyDescription="Try another category or add a product."
            emptyIcon={Package}
            toolbar={
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={category}
                onValueChange={(value) => value && setCategory(value)}
                className="flex-wrap justify-start"
              >
                <ToggleGroupItem value="all">All</ToggleGroupItem>
                {categories.map((c) => (
                  <ToggleGroupItem key={c} value={c}>
                    {c}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            }
          />
        </CardContent>
      </Card>
    </>
  )
}
