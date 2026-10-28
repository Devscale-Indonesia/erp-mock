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
import { createVendor } from '@/modules/vendors/server'
import { vendorSchema, type VendorForm } from '@/modules/vendors/types'

const empty: VendorForm = { name: '', email: '', phone: '', city: '', category: '', paymentTerms: 'Net 30' }

const fields: { name: keyof VendorForm; label: string; placeholder?: string; type?: string }[] = [
  { name: 'name', label: 'Name', placeholder: 'PT Pemasok Sejahtera' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'sales@vendor.co.id' },
  { name: 'phone', label: 'Phone', placeholder: '+62 21-555-0000' },
  { name: 'city', label: 'City', placeholder: 'Jakarta' },
  { name: 'category', label: 'Category', placeholder: 'Electronics' },
  { name: 'paymentTerms', label: 'Payment terms', placeholder: 'Net 30' },
]

export function VendorSheet() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const form = useForm<VendorForm>({ resolver: zodResolver(vendorSchema), defaultValues: empty })

  async function onSubmit(values: VendorForm) {
    try {
      const created = await createVendor({ data: values })
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
          <Plus /> New vendor
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New vendor</SheetTitle>
          <SheetDescription>Suppliers you buy stock from. Purchase orders are raised against them.</SheetDescription>
        </SheetHeader>
        <form id="vendor-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-4">
          <FieldGroup>
            {fields.map((f) => (
              <Controller
                key={f.name}
                name={f.name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`vendor-${f.name}`}>{f.label}</FieldLabel>
                    <Input
                      {...field}
                      id={`vendor-${f.name}`}
                      type={f.type}
                      placeholder={f.placeholder}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            ))}
          </FieldGroup>
          {form.formState.errors.root && <p className="mt-4 text-sm text-destructive">{form.formState.errors.root.message}</p>}
        </form>
        <SheetFooter>
          <Button type="submit" form="vendor-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving…' : 'Save vendor'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
