'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  Users,
  LayoutDashboard,
  UserRound,
  FileText,
  Package,
  Stethoscope,
  Clipboard,
  FlaskConical,
  Boxes,
  ShoppingCart,
  Receipt,
  Bell,
  MessageSquare,
  BarChart3,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { StockAlertBadge } from '@/components/modules/inventory/StockAlertBanner'
import type { RoleName } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  // badge: komponen React untuk ditampilkan di kanan label (misal: alert count)
  badge?: React.ReactNode
}

const ADMIN_STOCK_BADGE = <StockAlertBadge />

const NAVITEMS: Record<RoleName, NavItem[]> = {
  SUPER_ADMIN: [
    { label: 'Cabang', href: 'superadmin/branches', icon: Building2 },
    { label: 'Staff', href: 'superadmin/users', icon: Users },
    { label: 'Laporan', href: 'superadmin/reports', icon: BarChart3 },
    { label: 'Audit Log', href: 'superadmin/audit-logs', icon: ClipboardList },
  ],
  MASTER_ADMIN: [
    { label: 'Dashboard', href: 'masteradmin/dashboard', icon: LayoutDashboard },
    { label: 'Cabang', href: 'masteradmin/branches', icon: Building2 },
    { label: 'Staff', href: 'masteradmin/users', icon: Users },
    { label: 'Laporan', href: 'masteradmin/reports', icon: BarChart3 },
  ],
  ADMIN: [
    { label: 'Dashboard', href: 'admin/dashboard', icon: LayoutDashboard },
    { label: 'Pasien', href: 'admin/members', icon: UserRound },
    { label: 'Encounter', href: 'admin/encounters', icon: Stethoscope },
    { label: 'Sesi', href: 'admin/sessions', icon: Clipboard },
    { label: 'Invoice', href: 'admin/invoices', icon: Receipt },
    {
      label: 'Inventori',
      href: 'admin/inventory',
      icon: Boxes,
      badge: ADMIN_STOCK_BADGE,
    },
    {
      label: 'Permintaan Stok',
      href: 'admin/stock-requests',
      icon: ShoppingCart,
    },
    { label: 'Laporan', href: 'admin/reports', icon: BarChart3 },
  ],
  DOCTOR: [
    { label: 'Dashboard', href: 'doctor/dashboard', icon: LayoutDashboard },
    { label: 'Encounter', href: 'doctor/encounters', icon: Stethoscope },
    { label: 'Sesi', href: 'doctor/sessions', icon: Clipboard },
  ],
  NURSE: [
    { label: 'Dashboard', href: 'nurse/dashboard', icon: LayoutDashboard },
    { label: 'Sesi', href: 'nurse/sessions', icon: Clipboard },
    {
      label: 'Stok Kritis',
      href: 'nurse/inventory',
      icon: FlaskConical,
      badge: ADMIN_STOCK_BADGE,
    },
    { label: 'Permintaan Stok', href: 'nurse/stock-requests', icon: ShoppingCart },
  ],
  PATIENT: [
    { label: 'Dashboard', href: 'patient/dashboard', icon: LayoutDashboard },
    { label: 'Paket Saya', href: 'patient/packages', icon: Package },
    { label: 'Invoice', href: 'patient/invoices', icon: Receipt },
    { label: 'Rekam Medis', href: 'patient/emr', icon: FileText },
  ],
}

const SHARED_ITEMS: NavItem[] = [
  { label: 'Notifikasi', href: 'shared/notifications', icon: Bell },
  { label: 'Chat', href: 'shared/chat', icon: MessageSquare },
]

const ROLE_ACCENT: Record<RoleName, string> = {
  SUPER_ADMIN:
    'text-violet-600 bg-violet-50 dark:bg-violet-950 dark:text-violet-400',
  MASTER_ADMIN: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400',
  ADMIN:
    'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400',
  DOCTOR: 'text-sky-600 bg-sky-50 dark:bg-sky-950 dark:text-sky-400',
  NURSE: 'text-teal-600 bg-teal-50 dark:bg-teal-950 dark:text-teal-400',
  PATIENT: 'text-rose-600 bg-rose-50 dark:bg-rose-950 dark:text-rose-400',
}

export function AppSidebar() {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const { sidebarOpen, toggleSidebar } = useUIStore()

  if (!user) return null

  const items: NavItem[] = NAVITEMS[user.role] ?? []
  const accent: string = ROLE_ACCENT[user.role]

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 transition-all duration-300',
        sidebarOpen ? 'w-60' : 'w-16',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
        {sidebarOpen && (
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            RAHO
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 ml-auto text-slate-500 hover:text-slate-900"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-1 px-2">
          {items.map((item: NavItem) => {
            const active = pathname.startsWith(`/${item.href}`)
            return (
              <Link
                key={item.href}
                href={`/${item.href}`}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? accent
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                  !sidebarOpen && 'justify-center px-2',
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {/* Badge — hanya tampil saat sidebar terbuka */}
                    {item.badge && item.badge}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        <Separator className="my-3 mx-2" />

        <nav className="space-y-1 px-2">
          {SHARED_ITEMS.map((item: NavItem) => {
            const active = pathname.startsWith(`/${item.href}`)
            return (
              <Link
                key={item.href}
                href={`/${item.href}`}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? accent
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                  !sidebarOpen && 'justify-center px-2',
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Profile mini */}
      {sidebarOpen && (
        <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3">
          <Link href="/dashboard/shared/profile" className="flex items-center gap-2 group">
            <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <UserRound className="h-4 w-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate group-hover:underline">
                {user.fullName ?? user.email}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.role.replace('_', ' ')}
              </p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  )
}
