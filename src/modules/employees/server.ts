import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { employees } from '@/db/schema'
import { requireText, withUniqueCheck } from '@/lib/validation'

export const listEmployees = createServerFn({ method: 'GET' }).handler(async () => {
  return db.select().from(employees).orderBy(employees.name).all()
})

export const createEmployee = createServerFn({ method: 'POST' })
  .validator(
    (data: { name: string; email: string; department: string; role: string; hiredAt: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    return withUniqueCheck(() =>
      db
        .insert(employees)
        .values({
          name: requireText(data.name, 'Name'),
          email: requireText(data.email, 'Email').toLowerCase(),
          department: requireText(data.department, 'Department'),
          role: requireText(data.role, 'Role'),
          hiredAt: requireText(data.hiredAt, 'Hire date'),
        })
        .returning()
        .get(),
    )
  })
