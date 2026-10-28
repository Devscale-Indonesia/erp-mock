import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Circle, IdCard } from "lucide-react"
import { DataTable } from '@/components/erp/data-table'
import { EmployeeSheet } from '@/modules/employees/components/employee-sheet'
import { PageHeader } from '@/components/erp/page-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'
import { formatDate, initials } from '@/lib/format'
import { listEmployees } from '@/modules/employees/server'

export const Route = createFileRoute('/employees')({
  loader: () => listEmployees(),
  component: Employees,
})

type Employee = Awaited<ReturnType<typeof listEmployees>>[number]

const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Employee',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">{initials(row.original.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate font-medium">{row.original.name}</div>
          <div className="truncate text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: ({ getValue }) => <Badge variant="secondary">{getValue<string>()}</Badge>,
  },
  { accessorKey: 'role', header: 'Role' },
  {
    accessorKey: 'hiredAt',
    header: 'Hired',
    cell: ({ getValue }) => formatDate(getValue<string>()),
  },
  {
    accessorKey: 'active',
    header: 'Status',
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Marker>
          <MarkerIcon>
            <Circle className="fill-emerald-500 text-emerald-500" />
          </MarkerIcon>
          <MarkerContent>Active</MarkerContent>
        </Marker>
      ) : (
        <Marker>
          <MarkerIcon>
            <Circle className="text-muted-foreground" />
          </MarkerIcon>
          <MarkerContent className="text-muted-foreground">Inactive</MarkerContent>
        </Marker>
      ),
  },
]

function Employees() {
  const employees = Route.useLoaderData()
  const departments = new Set(employees.map((e) => e.department)).size
  const active = employees.filter((e) => e.active).length

  return (
    <>
      <PageHeader
        title="Employees"
        description={`${employees.length} people · ${active} active · ${departments} departments`}
        actions={<EmployeeSheet />}
      />

      <Card className="min-h-0 flex-1">
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <DataTable
            columns={columns}
            data={employees}
            searchPlaceholder="Search name, email, department or role"
            emptyTitle="No employees yet"
            emptyDescription="Add people to the directory."
            emptyIcon={IdCard}
          />
        </CardContent>
      </Card>
    </>
  )
}
