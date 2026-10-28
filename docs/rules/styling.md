# Styling rules

- Tailwind CSS 4 with shadcn/ui (`radix-nova` style). Theme tokens live in `src/styles.css` as CSS variables.
- Light is the default theme. Dark mode follows the `.dark` class, toggled by `next-themes`.
- Use theme tokens (`bg-background`, `text-muted-foreground`, `bg-primary`, `bg-sidebar`). Don't hard-code colours except for status badges, which need specific hues.
- Colours for the charts come from `--chart-1` … `--chart-5`.
- Icons come from `lucide-react`. Size them with `size-4` and let shadcn size them by default otherwise.
- Use `gap-*` for spacing between siblings, not margins.
- Mobile first: the shell collapses the sidebar below `md`. Test a page at 1280×720 as well as a large screen; the table must fit both.
