import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/erp/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { errorMessage } from '@/lib/format'
import { failOnServer } from '@/modules/diagnostics/server'

// Demo only: each card breaks the app in a different way, so you can show what an
// error tracker (Sentry) captures for each. Not linked from the sidebar.
export const Route = createFileRoute('/debug/errors')({
  component: DebugErrors,
})

function Bomb(): never {
  throw new Error('Sentry demo: component crashed while rendering')
}

function DebugErrors() {
  const [crashed, setCrashed] = useState(false)
  if (crashed) return <Bomb />

  const demos = [
    {
      title: 'Render error',
      description: 'A component throws while rendering. React unmounts the page and shows the route error screen.',
      action: 'Crash the page',
      run: () => setCrashed(true),
    },
    {
      title: 'Event handler error',
      description: 'A click handler throws. The page keeps working; the error only reaches the console and window.onerror.',
      action: 'Throw in click handler',
      run: () => {
        toast.info('Thrown: check the browser console')
        throw new Error('Sentry demo: click handler threw')
      },
    },
    {
      title: 'Unhandled promise rejection',
      description: 'An async task fails and nobody catches it. Reaches window.onunhandledrejection.',
      action: 'Reject a promise',
      run: () => {
        toast.info('Rejected: check the browser console')
        void Promise.reject(new Error('Sentry demo: unhandled promise rejection'))
      },
    },
    {
      title: 'Server function error',
      description: 'A server function throws. The page catches it and shows a toast; the server logs the stack trace.',
      action: 'Call failing server function',
      run: async () => {
        try {
          await failOnServer()
        } catch (error) {
          toast.error(errorMessage(error))
        }
      },
    },
  ]

  return (
    <>
      <PageHeader
        title="Error demo"
        description="Break the app on purpose to see what an error tracker captures. Remove this page before real users."
        actions={
          <Button asChild variant="outline">
            <Link to="/debug/broken">Open a broken page</Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {demos.map((demo) => (
          <Card key={demo.title}>
            <CardHeader>
              <CardTitle>{demo.title}</CardTitle>
              <CardDescription>{demo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={demo.run}>
                {demo.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
