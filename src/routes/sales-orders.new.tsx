import { useMemo } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import { AlertTriangle, ArrowLeft, CalendarIcon, Plus, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/erp/page-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { errorMessage, formatIDR, todayIso } from '@/lib/format'
import { orderSchema, type OrderForm } from '@/modules/sales-orders/types'
import { createOrder } from '@/modules/sales-orders/server'
import { listCustomers } from '@/modules/customers/server'
import { listProducts } from '@/modules/products/server'

export const Route = createFileRoute('/sales-orders/new')({
  loader: async () => {
    const [customers, products] = await Promise.all([listCustomers(), listProducts()])
    return { customers, products }
  },
  component: NewOrder,
})

function NewOrder() {
  const { customers, products } = Route.useLoaderData()
  const navigate = useNavigate()
  const productById = useMemo(() => new Map(products.map((p) => [String(p.id), p])), [products])

  const form = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerId: '',
      orderDate: todayIso(),
      items: [{ productId: '', quantity: '1' }],
    },
  })
  const fields = useFieldArray({ control: form.control, name: 'items' })
  const watchedItems = useWatch({ control: form.control, name: 'items' })

  // Totals and stock warnings are derived from the live form values.
  const lines = watchedItems.map((item) => {
    const product = productById.get(item.productId)
    const quantity = Number(item.quantity) || 0
    return { product, quantity, subtotal: (product?.unitPrice ?? 0) * quantity }
  })
  const total = lines.reduce((sum, l) => sum + l.subtotal, 0)

  const requestedByProduct = new Map<number, number>()
  for (const l of lines) {
    if (!l.product) continue
    requestedByProduct.set(l.product.id, (requestedByProduct.get(l.product.id) ?? 0) + l.quantity)
  }
  const overStock = [...requestedByProduct].flatMap(([id, qty]) => {
    const product = products.find((p) => p.id === id)
    return product && qty > product.stock ? [{ name: product.name, stock: product.stock, qty }] : []
  })

  async function onSubmit(values: OrderForm) {
    try {
      const created = await createOrder({
        data: {
          customerId: Number(values.customerId),
          orderDate: values.orderDate,
          items: values.items.map((i) => ({ productId: Number(i.productId), quantity: Number(i.quantity) })),
        },
      })
      toast.success('Order created', { description: 'Stock has been reserved for this order.' })
      await navigate({ to: '/sales-orders/$orderId', params: { orderId: String(created.id) } })
    } catch (err) {
      form.setError('root', { message: errorMessage(err) })
    }
  }

  if (customers.length === 0) {
    return (
      <>
        <PageHeader title="New sales order" />
        <Card>
          <CardContent className="pt-6">
            <Empty className="border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>
                <EmptyTitle>Add a customer first</EmptyTitle>
                <EmptyDescription>Orders need a customer to belong to.</EmptyDescription>
              </EmptyHeader>
              <Button asChild>
                <Link to="/customers">Go to customers</Link>
              </Button>
            </Empty>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
        <Link to="/sales-orders">
          <ArrowLeft /> All orders
        </Link>
      </Button>
      <PageHeader title="New sales order" description="Stock is reserved as soon as the order is created." />

      <form id="order-form" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer & date</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="customerId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="order-customer">Customer</FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="order-customer" aria-invalid={fieldState.invalid} className="w-full">
                          <SelectValue placeholder="Choose a customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.name} <span className="text-muted-foreground">· {c.city}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
                <Controller
                  name="orderDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Order date</FieldLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start font-normal" aria-invalid={fieldState.invalid}>
                            <CalendarIcon /> {field.value ? format(parseISO(field.value), 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? parseISO(field.value) : undefined}
                            onSelect={(date) => date && field.onChange(format(date, 'yyyy-MM-dd'))}
                          />
                        </PopoverContent>
                      </Popover>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>Duplicate products are merged when the order is saved.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.fields.map((row, index) => {
                const line = lines[index]
                return (
                  <div key={row.id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_96px_120px_40px] sm:items-end">
                    <Controller
                      name={`items.${index}.productId`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={`item-${index}-product`} className="sm:sr-only">
                            Product
                          </FieldLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id={`item-${index}-product`} aria-invalid={fieldState.invalid} className="w-full">
                              <SelectValue placeholder="Choose a product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)} disabled={p.stock === 0}>
                                  {p.name} <span className="text-muted-foreground">· {p.stock} left</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />
                    <Controller
                      name={`items.${index}.quantity`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={`item-${index}-qty`} className="sm:sr-only">
                            Qty
                          </FieldLabel>
                          <Input
                            {...field}
                            id={`item-${index}-qty`}
                            inputMode="numeric"
                            aria-invalid={fieldState.invalid}
                            className="text-right tabular-nums"
                          />
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />
                    <div className="text-right tabular-nums sm:pb-2">
                      <div className="text-xs text-muted-foreground sm:hidden">Subtotal</div>
                      {line?.product ? formatIDR(line.subtotal) : '—'}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove item"
                      disabled={fields.fields.length === 1}
                      onClick={() => fields.remove(index)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                )
              })}
              {typeof form.formState.errors.items?.message === 'string' && (
                <p className="text-sm text-destructive">{form.formState.errors.items.message}</p>
              )}
              <Button type="button" variant="outline" onClick={() => fields.append({ productId: '', quantity: '1' })}>
                <Plus /> Add item
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lines.filter((l) => l.product).map((l, i) => (
                <div key={i} className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {l.product!.name} × {l.quantity}
                  </span>
                  <span className="tabular-nums">{formatIDR(l.subtotal)}</span>
                </div>
              ))}
              {lines.every((l) => !l.product) && <p className="text-sm text-muted-foreground">Choose products to see totals.</p>}
              <Separator />
              <div className="flex items-baseline justify-between">
                <span className="font-medium">Total</span>
                <span className="text-xl font-semibold tabular-nums">{formatIDR(total)}</span>
              </div>
              {overStock.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle />
                  <AlertTitle>Not enough stock</AlertTitle>
                  <AlertDescription>
                    {overStock.map((o) => (
                      <div key={o.name}>
                        {o.name}: requested {o.qty}, available {o.stock}
                      </div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}
              {form.formState.errors.root && <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button type="submit" form="order-form" className="w-full" disabled={form.formState.isSubmitting || overStock.length > 0}>
                {form.formState.isSubmitting ? 'Creating…' : 'Create order'}
              </Button>
              <FieldDescription className="text-center">Creating an order confirms it immediately.</FieldDescription>
            </CardFooter>
          </Card>
        </div>
      </form>
    </>
  )
}
