# 0006: shadcn/ui as the component source

- Status: Accepted
- Date: 2026-10-28

## Context

We need accessible, consistent UI components without building them from scratch, and we want to own the code rather than depend on a component library version.

## Decision

Use shadcn/ui (`radix-nova` style, configured in `components.json`). Components are copied into `src/components/ui/` by the CLI.

## Consequences

- The code is ours, so we can read and adapt it, but the `ui/` folder is generated. Compose components in feature code instead of editing them. See [architecture rules](../rules/architecture.md).
- Updating a component means re-running the CLI and reviewing the diff.
- Hooks shipped with shadcn (`use-mobile`, `use-highlighted-code`) live in `src/hooks/`.
