import { createRouter as createTanStackRouter, ErrorComponent } from '@tanstack/react-router'
import { captureRouteError, initSentry } from '@/lib/sentry'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  initSentry()

  return createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    // Render and loader errors are caught by the router, so Sentry never sees them on its own. The router only
    // calls defaultOnCatch for per-route boundaries, which exist once defaultErrorComponent is set.
    defaultErrorComponent: ErrorComponent,
    defaultOnCatch: captureRouteError,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
