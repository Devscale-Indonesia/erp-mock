import { z } from 'zod'

export const employeeSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name'),
  email: z.email('Enter a valid email address'),
  department: z.string().trim().min(2, 'Enter a department'),
  role: z.string().trim().min(2, 'Enter a role'),
  hiredAt: z.string().min(1, 'Choose a hire date'),
})
export type EmployeeForm = z.infer<typeof employeeSchema>
