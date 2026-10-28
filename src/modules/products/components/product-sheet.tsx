import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { errorMessage } from '@/lib/format'
import { productSchema, type ProductForm } from '@/modules/products/types'
import { createProduct } from '@/modules/products/server'

const empty: ProductForm = { sku: '', name: '', category: '', unitPrice: '', stock: '0' }

export function ProductSheet({ categories }: { categories: string[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const form = useForm<ProductForm>({ resolver: zodResolver(productSchema), defaultValues: empty })

  async function onSubmit(values: ProductForm) {
    try {
      const created = await createProduct({
        data: {
          sku: values.sku,
          name: values.name,
          category: values.category,
          unitPrice: Number(values.unitPrice),
          stock: Number(values.stock),
        },
      })
      toast.success(`Added ${created.name}`)
      form.reset(empty)
      setOpen(false)
      await router.invalidate()
    } catch (err) {
      form.setError('root', { message: errorMessage(err) })
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus /> New product
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New product</SheetTitle>
          <SheetDescription>Products appear in the order builder once they have stock.</SheetDescription>
        </SheetHeader>
        <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-4">
          <FieldGroup>
            <Controller
              name="sku"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-sku">SKU</FieldLabel>
                  <Input {...field} id="product-sku" aria-invalid={fieldState.invalid} className="font-mono uppercase" placeholder="ELC-021" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-name">Name</FieldLabel>
                  <Input {...field} id="product-name" aria-invalid={fieldState.invalid} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="category"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-category">Category</FieldLabel>
                  <Input {...field} id="product-category" list="product-categories" aria-invalid={fieldState.invalid} />
                  <datalist id="product-categories">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="unitPrice"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-price">Unit price (IDR)</FieldLabel>
                  <Input {...field} id="product-price" inputMode="numeric" aria-invalid={fieldState.invalid} placeholder="1500000" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="stock"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-stock">Opening stock</FieldLabel>
                  <Input {...field} id="product-stock" inputMode="numeric" aria-invalid={fieldState.invalid} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
          {form.formState.errors.root && (
            <p className="mt-4 text-sm text-destructive">{form.formState.errors.root.message}</p>
          )}
        </form>
        <SheetFooter>
          <Button type="submit" form="product-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving…' : 'Save product'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
