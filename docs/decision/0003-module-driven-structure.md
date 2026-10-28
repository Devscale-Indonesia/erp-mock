# 0003: Module-driven structure for features

- Status: Accepted
- Date: 2026-10-28

## Context

Early on, all components sat in one folder and all server functions in one file. Adding vendors touched code belonging to five other features.

## Decision

- Each business feature is a module in `src/modules/<feature>/` with `server.ts`, `types.ts`, and `components/`.
- Pages stay in `src/routes/`.
- Layout (`components/layout/`) and shared UI (`components/erp/`) are not modules.
- No barrel files. Import the defining file.

See [architecture rules](../rules/architecture.md) for the exact rules.

## Consequences

- A feature can be found, changed, or removed in one folder.
- Some shared pieces (for example, the status badge) are used by several modules. They live in `components/erp/`, not in one module.
- Cross-module imports are limited to `server.ts` and `types.ts`. This keeps modules from tangling.
