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
import { errorMessage, todayIso } from '@/lib/format'
import { employeeSchema, type EmployeeForm } from '@/modules/employees/types'
import { createEmployee } from '@/modules/employees/server'

const emptyFor = (): EmployeeForm => ({ name: '', email: '', department: '', role: '', hiredAt: todayIso() })

export function EmployeeSheet() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const form = useForm<EmployeeForm>({ resolver: zodResolver(employeeSchema), defaultValues: emptyFor() })

  async function onSubmit(values: EmployeeForm) {
    try {
      const created = await createEmployee({ data: values })
      toast.success(`Added ${created.name}`)
      form.reset(emptyFor())
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
          <Plus /> New employee
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New employee</SheetTitle>
          <SheetDescription>Add someone to the staff directory.</SheetDescription>
        </SheetHeader>
        <form id="employee-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-4">
          <FieldGroup>
            {(
              [
                ['name', 'Full name', 'text'],
                ['email', 'Work email', 'email'],
                ['department', 'Department', 'text'],
                ['role', 'Role', 'text'],
                ['hiredAt', 'Hire date', 'date'],
              ] as const
            ).map(([name, label, type]) => (
              <Controller
                key={name}
                name={name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`employee-${name}`}>{label}</FieldLabel>
                    <Input {...field} id={`employee-${name}`} type={type} aria-invalid={fieldState.invalid} />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            ))}
          </FieldGroup>
          {form.formState.errors.root && (
            <p className="mt-4 text-sm text-destructive">{form.formState.errors.root.message}</p>
          )}
        </form>
        <SheetFooter>
          <Button type="submit" form="employee-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving…' : 'Save employee'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
