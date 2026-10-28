import { Link, useRouterState } from '@tanstack/react-router'
import { Boxes, ChevronsUpDown, LogOut, PanelLeftClose, Search, Settings, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { navGroups, navItems } from './nav'

export function AppSidebar({ onOpenSearch }: { onOpenSearch: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { toggleSidebar, state } = useSidebar()
  const isActive = (to: string) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`))

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-4 p-4">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <Link to="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
            <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Boxes className="size-4" />
            </span>
            <span className="group-data-[collapsible=icon]:hidden">ERP Mock</span>
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={state === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}
            className="rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex h-10 w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search</span>
          <KbdGroup>
            <Kbd className="bg-sidebar-accent text-sidebar-foreground">⌘</Kbd>
            <Kbd className="bg-sidebar-accent text-sidebar-foreground">K</Kbd>
          </KbdGroup>
        </button>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {navGroups.map((group, index) => (
          <SidebarGroup key={group}>
            {index > 0 && <SidebarSeparator className="mb-4" />}
            <SidebarGroupLabel className="text-sidebar-foreground/60">{group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={isActive(item.to)} tooltip={item.label} className="h-10 rounded-lg">
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-2 text-left text-sm text-sidebar-foreground hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-sidebar-primary text-xs text-sidebar-primary-foreground">DA</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">Demo Admin</span>
                <span className="truncate text-xs text-sidebar-foreground/60">admin@anvia.dev</span>
              </div>
              <ChevronsUpDown className="size-4 text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings /> Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
