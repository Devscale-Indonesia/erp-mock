import {
  ClipboardList,
  IdCard,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = { to: string; label: string; icon: LucideIcon; group: string }

export const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, group: 'Main Menu' },
  { to: '/products', label: 'Products', icon: Package, group: 'Main Menu' },
  { to: '/sales-orders', label: 'Order', icon: ShoppingCart, group: 'Main Menu' },
  { to: '/customers', label: 'Customer', icon: Users, group: 'Main Menu' },
  { to: '/vendors', label: 'Vendors', icon: Truck, group: 'Procurement' },
  { to: '/purchase-orders', label: 'Purchase orders', icon: ClipboardList, group: 'Procurement' },
  { to: '/employees', label: 'Employees', icon: IdCard, group: 'Other' },
]

export const navGroups = [...new Set(navItems.map((item) => item.group))]
