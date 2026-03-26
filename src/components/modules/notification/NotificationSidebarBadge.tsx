'use client'

import { useNotifications } from '@/hooks/useNotifications'

/**
 * Badge kecil untuk menu Notifikasi di AppSidebar.
 * Muncul hanya jika ada notifikasi yang belum dibaca.
 */
export function NotificationSidebarBadge() {
  const { unreadCount } = useNotifications()

  if (unreadCount === 0) return null

  return (
    <span className="inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none px-0.5">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  )
}
