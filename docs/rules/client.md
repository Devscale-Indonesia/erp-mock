# Client rules

## Pages

1. A route file in `src/routes/` owns loading (`loader`) and the page component. Read loader data with `Route.useLoaderData()`.
2. After a write, call `router.invalidate()` so the loader runs again. Don't keep a copy of server data in local state.
3. Use the shell for layout. Pages render inside `<main>` and must not add their own page-level padding.

## Forms

1. Use `react-hook-form` with `zodResolver`. Schemas live in the module's `types.ts`.
2. Store form inputs as strings, then convert before calling the server (`Number(values.unitPrice)`). Number inputs in the DOM hand back strings.
3. Use `Field`, `FieldLabel`, `FieldError` from `components/ui/field` and set `aria-invalid` on the input.
4. Show a server error with `form.setError('root', { message })`, not `alert`.
5. Create actions open a `Sheet` (see `customer-sheet.tsx`). Close it and show a `toast.success` on success.

## Tables

1. Use `DataTable` from `components/erp/data-table.tsx`. Define columns with `ColumnDef`. Right-align numbers with `meta: { align: 'right' }`.
2. On list pages, the card fills the viewport. Give it `className="min-h-0 flex-1"` and its `CardContent` `className="flex min-h-0 flex-1 flex-col"`. `DataTable` then fits the rows to the space.
3. Mobile shows 5 rows per page. Desktop fits the rows to the height.

## Charts

1. Use shadcn's `ChartContainer` with a `ChartConfig`.
2. Set series colours with the `style` prop, not `stroke="var(--…)"`. SVG presentation attributes do not resolve CSS variables, so the series disappears.
3. Keep the area fill and the outline separate: `Area` with `stroke="none"` for the fill, `Line` for the top edge only.

## Status and money display

- Use `StatusBadge` for order and purchase statuses. Add a new status to its colour map in the same change.
- Format money with `formatIDR` and counts with `formatNumber` from `src/lib/format.ts`.
