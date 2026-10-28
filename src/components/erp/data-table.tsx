import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type RowData,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, Search, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useIsMobile } from '@/hooks/use-mobile'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: 'left' | 'right'
  }
}

const MOBILE_PAGE_SIZE = 5
const FALLBACK_ROW_HEIGHT = 53
const FALLBACK_HEADER_HEIGHT = 40

type Props<TData> = {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  searchPlaceholder?: string
  emptyTitle: string
  emptyDescription?: string
  emptyIcon: LucideIcon
  toolbar?: ReactNode
}

// The table fills the space its parent gives it. The number of rows per page is
// measured from that space, so the pagination footer sits at the bottom of the card.
export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = 'Search…',
  emptyTitle,
  emptyDescription,
  emptyIcon: EmptyIcon,
  toolbar,
}: Props<TData>) {
  const isMobile = useIsMobile()
  const boxRef = useRef<HTMLDivElement>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [fitRows, setFitRows] = useState<number | null>(null)

  useLayoutEffect(() => {
    const box = boxRef.current
    if (!box || isMobile) return
    const measure = () => {
      const headHeight = box.querySelector<HTMLElement>('thead')?.offsetHeight || FALLBACK_HEADER_HEIGHT
      const rowHeight = box.querySelector<HTMLElement>('tbody tr')?.offsetHeight || FALLBACK_ROW_HEIGHT
      setFitRows(Math.max(3, Math.floor((box.clientHeight - headHeight) / rowHeight)))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    return () => observer.disconnect()
  }, [isMobile, data.length])


  const pageSize = isMobile ? MOBILE_PAGE_SIZE : (fitRows ?? 10)
  useEffect(() => {
    setPagination((p) => (p.pageSize === pageSize ? p : { pageIndex: 0, pageSize }))
  }, [pageSize])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const rows = table.getRowModel().rows

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8"
            aria-label={searchPlaceholder}
          />
        </div>
        {toolbar}
      </div>

      <div ref={boxRef} className="min-h-0 flex-1 overflow-auto rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => {
                  const sortable = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  const align = header.column.columnDef.meta?.align
                  return (
                    <TableHead key={header.id} className={align === 'right' ? 'text-right' : undefined}>
                      {header.isPlaceholder ? null : sortable ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-2 h-8"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === 'asc' ? (
                            <ArrowUp className="ml-1 size-3.5" />
                          ) : sorted === 'desc' ? (
                            <ArrowDown className="ml-1 size-3.5" />
                          ) : (
                            <ArrowUpDown className="ml-1 size-3.5 opacity-50" />
                          )}
                        </Button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <Empty className="border-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <EmptyIcon />
                      </EmptyMedia>
                      <EmptyTitle>{emptyTitle}</EmptyTitle>
                      {emptyDescription && <EmptyDescription>{emptyDescription}</EmptyDescription>}
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const align = cell.column.columnDef.meta?.align
                    return (
                      <TableCell key={cell.id} className={align === 'right' ? 'text-right tabular-nums' : undefined}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} · {table.getFilteredRowModel().rows.length} rows
          </p>
          <ButtonGroup>
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </ButtonGroup>
        </div>
      )}
    </div>
  )
}
