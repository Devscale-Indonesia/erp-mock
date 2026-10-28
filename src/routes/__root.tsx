/// <reference types="vite/client" />
import { useState, type ReactNode } from 'react'
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { ThemeProvider } from 'next-themes'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { CommandMenu } from '@/components/layout/command-menu'
import { SiteHeader } from '@/components/layout/site-header'
import { Toaster } from '@/components/ui/sonner'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'ERP Mock' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
})

function RootComponent() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <RootDocument>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar onOpenSearch={() => setSearchOpen(true)} />
            <SidebarInset className="h-svh min-w-0">
              <SiteHeader onOpenSearch={() => setSearchOpen(true)} />
              <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                <Outlet />
              </main>
            </SidebarInset>
          </SidebarProvider>
          <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} />
          <Toaster richColors closeButton />
        </TooltipProvider>
      </ThemeProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
