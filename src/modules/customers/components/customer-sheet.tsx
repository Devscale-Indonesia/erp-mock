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
import { customerSchema, type CustomerForm } from '@/modules/customers/types'
import { createCustomer } from '@/modules/customers/server'

const empty: CustomerForm = { name: '', email: '', phone: '', city: '' }

export function CustomerSheet() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const form = useForm<CustomerForm>({ resolver: zodResolver(customerSchema), defaultValues: empty })

  async function onSubmit(values: CustomerForm) {
    try {
      const created = await createCustomer({ data: values })
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
          <Plus /> New customer
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New customer</SheetTitle>
          <SheetDescription>Add a customer you can invoice and create orders for.</SheetDescription>
        </SheetHeader>
        <form id="customer-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-4">
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="customer-name">Name</FieldLabel>
                  <Input {...field} id="customer-name" aria-invalid={fieldState.invalid} placeholder="PT Contoh Jaya" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="customer-email">Email</FieldLabel>
                  <Input {...field} id="customer-email" type="email" aria-invalid={fieldState.invalid} placeholder="ops@company.co.id" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="phone"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="customer-phone">Phone</FieldLabel>
                  <Input {...field} id="customer-phone" placeholder="+62 812-0000-0000" />
                </Field>
              )}
            />
            <Controller
              name="city"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="customer-city">City</FieldLabel>
                  <Input {...field} id="customer-city" aria-invalid={fieldState.invalid} placeholder="Surabaya" />
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
          <Button type="submit" form="customer-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving…' : 'Save customer'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
