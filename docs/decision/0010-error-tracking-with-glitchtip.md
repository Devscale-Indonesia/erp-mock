# 0010: Browser error tracking with GlitchTip (Sentry SDK)

- Status: Accepted
- Date: 2026-10-28

## Context

Errors in the browser (render crashes, failing loaders, click handlers, unhandled rejections) were only visible in the user's console. We run a self-hosted GlitchTip, which accepts events from the Sentry SDK.

## Decision

- Use `@sentry/react`, initialised in `src/lib/sentry.ts` and called from `getRouter()` in `src/router.tsx` (TanStack Start has no client entry file we own).
- The DSN comes from `VITE_SENTRY_DSN` at build time. With no DSN, Sentry stays off, so local dev and e2e send nothing. `VITE_SENTRY_ENV` names the environment (`staging`, `production`); it falls back to the Vite mode.
- The router's `defaultOnCatch` reports errors that its error screen catches (render and loader errors). Sentry's global handlers cover the rest.
- `tracesSampleRate` is 0.01 and the session integration is removed, because GlitchTip does not support sessions.

## Consequences

- Each server needs `VITE_SENTRY_DSN` (and `VITE_SENTRY_ENV`) in its build environment, for example in `.env.production` in the checkout. The deploy builds on the server, so a missing value silently disables tracking for that deploy.
- The DSN is public by design (it ships in the browser bundle), but keep it out of git so each environment can use its own project.
- Server-side errors (server functions) are not reported yet. Add `@sentry/node` later if we want them.
- Source maps are not uploaded, so stack traces point at minified code.
