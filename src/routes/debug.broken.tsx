import { createFileRoute } from '@tanstack/react-router'
import { failInLoader } from '@/modules/diagnostics/server'

// Demo only: the loader always throws, so this page always shows the route error screen.
export const Route = createFileRoute('/debug/broken')({
  loader: () => failInLoader(),
  component: () => <p>You should never see this.</p>,
})
