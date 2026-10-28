import { Fragment } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Bell, Info, Plus, Search } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { navItems } from './nav'
import { ThemeToggle } from './theme-toggle'

function useCrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const segments = pathname.split('/').filter(Boolean)
  const root = navItems.find((item) => item.to === `/${segments[0] ?? ''}`) ?? navItems[0]!
  const crumbs = [{ label: root.label, to: root.to }]
  if (segments[1]) crumbs.push({ label: 'Details', to: pathname })
  if (segments[0] === 'sales-orders' && segments[1] === 'new') crumbs[1] = { label: 'New order', to: pathname }
  return crumbs
}

export function SiteHeader({ onOpenSearch }: { onOpenSearch: () => void }) {
  const crumbs = useCrumbs()

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1 md:hidden" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap truncate">
          {crumbs.map((crumb, i) => {
            const last = i === crumbs.length - 1
            return (
              <Fragment key={crumb.to}>
                <BreadcrumbItem>
                  {last ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.to}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!last && <BreadcrumbSeparator />}
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="hidden items-center gap-3 md:flex">
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>BS</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>CW</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="icon-sm" className="rounded-full" aria-label="Invite">
            <Plus />
          </Button>
        </AvatarGroup>
      </div>
      <Button variant="ghost" size="icon" aria-label="Help">
        <Info className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell className="size-4" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenSearch} aria-label="Search">
        <Search className="size-4" />
      </Button>
      <ThemeToggle />
    </header>
  )
}
