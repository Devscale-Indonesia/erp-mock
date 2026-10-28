# Docs

Shared context for the team. Keep it short, keep it true, and update it in the same change as the code it describes.

| Folder | What goes here | Naming |
| --- | --- | --- |
| `decision/` | Architecture decision records (ADRs): one decision, its context, and its consequences | `xxxx-short-name.md` |
| `product/` | What the product does and the business rules behind it (not code) | `xxxx-short-name.md` |
| `rules/` | How we write code in this repo. One file per area | `area.md` |

- Numbers (`xxxx`) only go up and are never reused. A replaced decision stays in place and is marked `Superseded by`.
- Write for the next engineer: say why, not only what.
- Don't paste code that will drift. Point at the file path instead.

Start here:

- [Architecture rules](rules/architecture.md)
- [Decision 0001: TanStack Start](decision/0001-use-tanstack-start.md)
- [Product 0001: ERP mock scope](product/0001-erp-mock-scope.md)
