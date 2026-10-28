import { createServerFn } from '@tanstack/react-start'

// Demo only: always fails, so an error tracker has something to capture on the server.
export const failOnServer = createServerFn({ method: 'POST' }).handler(async () => {
  throw new Error('Sentry demo: server function failed')
})

export const failInLoader = createServerFn({ method: 'GET' }).handler(async () => {
  throw new Error('Sentry demo: route loader failed')
})
