import * as Sentry from '@sentry/react'

// Browser error tracking (GlitchTip, Sentry-compatible). Does nothing when
// VITE_SENTRY_DSN is unset, so local dev and e2e runs send no events.
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn || typeof window === 'undefined' || Sentry.getClient()) return

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENV || import.meta.env.MODE,
    tracesSampleRate: 0.01,
    // GlitchTip does not support sessions, so drop the session integration (replaces autoSessionTracking).
    integrations: (defaults) => defaults.filter((integration) => integration.name !== 'BrowserSession'),
  })
}

export function captureRouteError(error: unknown) {
  Sentry.captureException(error)
}
