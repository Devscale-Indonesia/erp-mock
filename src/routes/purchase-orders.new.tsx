import { useMemo } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import { AlertTriangle, ArrowLeft, CalendarIcon, Plus, Trash2, Truck } from 'lucide-react'
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
import { listProducts } from '@/modules/products/server'
import { createPurchaseOrder } from '@/modules/purchase-orders/server'
import { purchaseOrderSchema, type PurchaseOrderForm } from '@/modules/purchase-orders/types'
import { listVendors } from '@/modules/vendors/server'

export const Route = createFileRoute('/purchase-orders/new')({
  loader: async () => {
    const [vendors, products] = await Promise.all([listVendors(), listProducts()])
    return { vendors, products }
  },
  component: NewPurchaseOrder,
})

const addDays = (iso: string, days: number) => {
  const d = parseISO(iso)
  d.setDate(d.getDate() + days)
  return format(d, 'yyyy-MM-dd')
}

function NewPurchaseOrder() {
  const { vendors, products } = Route.useLoaderData()
  const navigate = useNavigate()
  const productById = useMemo(() => new Map(products.map((p) => [String(p.id), p])), [products])

  const orderDate = todayIso()
  const form = useForm<PurchaseOrderForm>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      vendorId: '',
      orderDate,
      expectedDate: addDays(orderDate, 14),
      items: [{ productId: '', quantity: '10', unitCost: '' }],
    },
  })
  const fields = useFieldArray({ control: form.control, name: 'items' })
  const watchedItems = useWatch({ control: form.control, name: 'items' })
  const watchedVendor = useWatch({ control: form.control, name: 'vendorId' })

  // Only products supplied by the chosen vendor can go on this order.
  const vendorProducts = products.filter((p) => String(p.vendorId) === watchedVendor)

  const lines = watchedItems.map((item) => {
    const quantity = Number(item.quantity) || 0
    const unitCost = Number(item.unitCost) || 0
    return { quantity, unitCost, subtotal: quantity * unitCost, product: productById.get(item.productId) }
  })
  const total = lines.reduce((sum, l) => sum + l.subtotal, 0)

  async function onSubmit(values: PurchaseOrderForm) {
    try {
      const created = await createPurchaseOrder({
        data: {
          vendorId: Number(values.vendorId),
          orderDate: values.orderDate,
          expectedDate: values.expectedDate,
          items: values.items.map((i) => ({
            productId: Number(i.productId),
            quantity: Number(i.quantity),
            unitCost: Number(i.unitCost),
          })),
        },
      })
      toast.success('Purchase order raised', { description: 'Receive it from the order page to add stock.' })
      await navigate({ to: '/purchase-orders/$orderId', params: { orderId: String(created.id) } })
    } catch (err) {
      form.setError('root', { message: errorMessage(err) })
    }
  }

  if (vendors.length === 0) {
    return (
      <>
        <PageHeader title="New purchase order" />
        <Card>
          <CardContent className="pt-6">
            <Empty className="border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Truck />
                </EmptyMedia>
                <EmptyTitle>Add a vendor first</EmptyTitle>
                <EmptyDescription>Purchase orders are raised against a supplier.</EmptyDescription>
              </EmptyHeader>
              <Button asChild>
                <Link to="/vendors">Go to vendors</Link>
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
        <Link to="/purchase-orders">
          <ArrowLeft /> All purchase orders
        </Link>
      </Button>
      <PageHeader title="New purchase order" description="Pick a vendor, then the products they supply." />

      <form id="po-form" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor & dates</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup className="grid gap-4 sm:grid-cols-3">
                <Controller
                  name="vendorId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="sm:col-span-3">
                      <FieldLabel htmlFor="po-vendor">Vendor</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          fields.replace([{ productId: '', quantity: '10', unitCost: '' }])
                        }}
                      >
                        <SelectTrigger id="po-vendor" aria-invalid={fieldState.invalid} className="w-full">
                          <SelectValue placeholder="Choose a vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendors.map((v) => (
                            <SelectItem key={v.id} value={String(v.id)}>
                              {v.name} <span className="text-muted-foreground">· {v.paymentTerms}</span>
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
                      <DatePick value={field.value} onChange={field.onChange} invalid={fieldState.invalid} />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
                <Controller
                  name="expectedDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Expected delivery</FieldLabel>
                      <DatePick value={field.value} onChange={field.onChange} invalid={fieldState.invalid} />
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
              <CardDescription>
                {watchedVendor
                  ? vendorProducts.length > 0
                    ? 'Only products this vendor supplies are listed.'
                    : 'This vendor has no products yet.'
                  : 'Choose a vendor to see its products.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.fields.map((row, index) => {
                const line = lines[index]
                return (
                  <div key={row.id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_96px_140px_120px_40px] sm:items-end">
                    <Controller
                      name={`items.${index}.productId`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={`po-item-${index}-product`} className="sm:sr-only">
                            Product
                          </FieldLabel>
                          <Select value={field.value} onValueChange={field.onChange} disabled={!watchedVendor}>
                            <SelectTrigger id={`po-item-${index}-product`} aria-invalid={fieldState.invalid} className="w-full">
                              <SelectValue placeholder="Choose a product" />
                            </SelectTrigger>
                            <SelectContent>
                              {vendorProducts.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                  {p.name} <span className="text-muted-foreground">· {p.stock} in stock</span>
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
                          <FieldLabel htmlFor={`po-item-${index}-qty`} className="sm:sr-only">
                            Qty
                          </FieldLabel>
                          <Input {...field} id={`po-item-${index}-qty`} inputMode="numeric" aria-invalid={fieldState.invalid} className="text-right tabular-nums" />
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />
                    <Controller
                      name={`items.${index}.unitCost`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={`po-item-${index}-cost`} className="sm:sr-only">
                            Unit cost (IDR)
                          </FieldLabel>
                          <Input
                            {...field}
                            id={`po-item-${index}-cost`}
                            inputMode="numeric"
                            placeholder={line?.product ? String(Math.round(line.product.unitPrice * 0.6)) : 'Unit cost'}
                            aria-invalid={fieldState.invalid}
                            className="text-right tabular-nums"
                          />
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />
                    <div className="text-right tabular-nums sm:pb-2">
                      <div className="text-xs text-muted-foreground sm:hidden">Subtotal</div>
                      {line && line.subtotal > 0 ? formatIDR(line.subtotal) : '—'}
                    </div>
                    <Button type="button" variant="ghost" size="icon" aria-label="Remove item" disabled={fields.fields.length === 1} onClick={() => fields.remove(index)}>
                      <Trash2 />
                    </Button>
                  </div>
                )
              })}
              {typeof form.formState.errors.items?.message === 'string' && (
                <p className="text-sm text-destructive">{form.formState.errors.items.message}</p>
              )}
              <Button
                type="button"
                variant="outline"
                disabled={!watchedVendor}
                onClick={() => fields.append({ productId: '', quantity: '10', unitCost: '' })}
              >
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
              {lines.filter((l) => l.product && l.subtotal > 0).map((l, i) => (
                <div key={i} className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {l.product!.name} × {l.quantity}
                  </span>
                  <span className="tabular-nums">{formatIDR(l.subtotal)}</span>
                </div>
              ))}
              {lines.every((l) => l.subtotal === 0) && <p className="text-sm text-muted-foreground">Add items to see the total.</p>}
              <Separator />
              <div className="flex items-baseline justify-between">
                <span className="font-medium">Total</span>
                <span className="text-xl font-semibold tabular-nums">{formatIDR(total)}</span>
              </div>
              {watchedVendor && vendorProducts.length === 0 && (
                <Alert>
                  <AlertTriangle />
                  <AlertTitle>Nothing to order</AlertTitle>
                  <AlertDescription>Link products to this vendor first.</AlertDescription>
                </Alert>
              )}
              {form.formState.errors.root && <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button type="submit" form="po-form" className="w-full" disabled={form.formState.isSubmitting || !watchedVendor}>
                {form.formState.isSubmitting ? 'Raising…' : 'Raise purchase order'}
              </Button>
              <FieldDescription className="text-center">Stock is added when the order is marked received.</FieldDescription>
            </CardFooter>
          </Card>
        </div>
      </form>
    </>
  )
}

function DatePick({ value, onChange, invalid }: { value: string; onChange: (v: string) => void; invalid: boolean }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start font-normal" aria-invalid={invalid}>
          <CalendarIcon /> {value ? format(parseISO(value), 'PPP') : 'Pick a date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value ? parseISO(value) : undefined} onSelect={(date) => date && onChange(format(date, 'yyyy-MM-dd'))} />
      </PopoverContent>
    </Popover>
  )
}
