'use client'

import { useRouter } from 'next/navigation'
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

import { Button }          from '@/components/ui/button'
import { ScrollArea }      from '@/components/ui/scroll-area'
import { Separator }       from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
}                          from '@/components/ui/popover'
import { Skeleton }        from '@/components/ui/skeleton'
import { cn, formatDateTime } from '@/lib/utils'
import { useNotifications }  from '@/hooks/useNotifications'
import type { Notification }  from '@/types'

// ─── Resource navigator ──────────────────────────────────────────────────────

/**
 * Bangun path navigasi dari resourceType + resourceId notifikasi.
 * Pola ini sesuai dengan route struktur FE yang sudah ada.
 */
function buildResourcePath(
  resourceType: string,
  resourceId: string,
): string | null {
  const map: Record<string, string> = {
    SESSION:       `/dashboard/admin/sessions/${resourceId}`,
    ENCOUNTER:     `/dashboard/admin/encounters/${resourceId}`,
    INVOICE:       `/dashboard/admin/invoices/${resourceId}`,
    STOCK_REQUEST: `/dashboard/admin/stock-requests`,
    MEMBER:        `/dashboard/admin/members/${resourceId}`,
  }
  return map[resourceType.toUpperCase()] ?? null
}

// ─── Sub-component: satu item notifikasi di dropdown ─────────────────────────

interface NotifItemProps {
  notif:     Notification
  onRead:    (id: string) => void
  onRemove:  (id: string) => void
  onClose:   () => void
}

function NotifDropdownItem({ notif, onRead, onRemove, onClose }: NotifItemProps) {
  const router = useRouter()

  function handleClick() {
    if (!notif.isRead) onRead(notif.notificationId)
    const path = notif.resourceType && notif.resourceId
      ? buildResourcePath(notif.resourceType, notif.resourceId)
      : null
    if (path) {
      onClose()
      router.push(path)
    }
  }

  return (
    <div
      className={cn(
        'group relative flex gap-3 px-4 py-3 transition-colors cursor-pointer',
        'hover:bg-slate-50 dark:hover:bg-slate-800/60',
        !notif.isRead && 'bg-blue-50/60 dark:bg-blue-950/20',
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Indikator belum dibaca */}
      {!notif.isRead && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
      )}

      <div className="min-w-0 flex-1">
        <p className={cn(
          'text-xs leading-snug text-slate-800 dark:text-slate-200 truncate',
          !notif.isRead && 'font-semibold',
        )}>
          {notif.title}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
          {notif.body}
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
          {formatDateTime(notif.createdAt)}
        </p>
      </div>

      {/* Tombol hapus — muncul saat hover */}
      <button
        className={cn(
          'shrink-0 self-start mt-0.5 p-1 rounded transition-opacity opacity-0',
          'group-hover:opacity-100 text-slate-400 hover:text-red-500',
        )}
        onClick={(e) => {
          e.stopPropagation()
          onRemove(notif.notificationId)
        }}
        aria-label="Hapus notifikasi"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function NotifDropdownSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * NotificationBell — menggantikan placeholder Bell di Sprint 1.
 *
 * Fitur:
 * - Badge merah menampilkan jumlah notifikasi belum dibaca (polling 30 detik).
 * - Popover dropdown menampilkan 8 notifikasi terbaru yang belum dibaca.
 * - Klik item → tandai dibaca → navigasi ke resource terkait.
 * - Tombol "Tandai semua dibaca" dan link "Lihat semua" ke halaman penuh.
 */
export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markAllRead,
    isMarkingAll,
    remove,
  } = useNotifications()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          aria-label={`Notifikasi${unreadCount > 0 ? ` — ${unreadCount} belum dibaca` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute top-1 right-1 flex items-center justify-center',
                'h-4 min-w-4 rounded-full bg-red-500 text-white font-bold',
                'text-[9px] leading-none px-0.5',
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 shadow-lg border border-slate-200 dark:border-slate-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Notifikasi
            </span>
            {unreadCount > 0 && (
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                ({unreadCount} baru)
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              onClick={() => markAllRead()}
              disabled={isMarkingAll}
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              {isMarkingAll ? 'Memproses...' : 'Semua dibaca'}
            </Button>
          )}
        </div>

        {/* Body */}
        {isLoading ? (
          <NotifDropdownSkeleton />
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
            <BellOff className="h-8 w-8" />
            <p className="text-sm">Tidak ada notifikasi baru</p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((notif) => (
                <Popover key={notif.notificationId}>
                  <NotifDropdownItem
                    notif={notif}
                    onRead={markRead}
                    onRemove={remove}
                    onClose={() => {
                      /* Popover akan tutup via state internal */
                    }}
                  />
                </Popover>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        <Separator />
        <div className="px-4 py-2.5">
          <Link
            href="/dashboard/shared/notifications"
            className={cn(
              'flex items-center justify-center gap-1.5 text-xs font-medium',
              'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors',
            )}
          >
            <ExternalLink className="h-3 w-3" />
            Lihat semua notifikasi
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
