'use client'

import { useRouter } from 'next/navigation'
import { Trash2, BellDot, Bell } from 'lucide-react'
import { Button }          from '@/components/ui/button'
import { cn, formatDateTime } from '@/lib/utils'
import type { Notification }  from '@/types'

// ─── Resource path builder ────────────────────────────────────────────────────

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
    CHAT:          `/dashboard/shared/chat/${resourceId}`,
  }
  return map[resourceType.toUpperCase()] ?? null
}

// ─── Type label ───────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  SESSION:       'Sesi',
  ENCOUNTER:     'Encounter',
  INVOICE:       'Invoice',
  STOCK_REQUEST: 'Permintaan Stok',
  MEMBER:        'Pasien',
  CHAT:          'Chat',
  SYSTEM:        'Sistem',
}

const TYPE_COLOR: Record<string, string> = {
  SESSION:       'text-sky-600 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400',
  ENCOUNTER:     'text-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-400',
  INVOICE:       'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
  STOCK_REQUEST: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
  MEMBER:        'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400',
  CHAT:          'text-teal-600 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400',
  SYSTEM:        'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification
  onMarkRead:  (id: string) => void
  onRemove:    (id: string) => void
  isRemoving?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Satu baris notifikasi untuk halaman penuh /shared/notifications.
 *
 * - Klik baris → tandai dibaca → navigasi ke resource terkait (jika ada).
 * - Tombol hapus tersedia di kanan (muncul saat hover).
 * - Latar biru muda untuk notifikasi yang belum dibaca.
 */
export function NotificationItem({
  notification: notif,
  onMarkRead,
  onRemove,
  isRemoving,
}: NotificationItemProps) {
  const router = useRouter()

  const typeKey   = notif.type?.toUpperCase() ?? 'SYSTEM'
  const typeLabel = TYPE_LABEL[typeKey]   ?? notif.type
  const typeColor = TYPE_COLOR[typeKey]   ?? TYPE_COLOR.SYSTEM

  function handleClick() {
    if (!notif.isRead) onMarkRead(notif.notificationId)
    if (notif.resourceType && notif.resourceId) {
      const path = buildResourcePath(notif.resourceType, notif.resourceId)
      if (path) router.push(path)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={cn(
        'group relative flex items-start gap-4 px-5 py-4 cursor-pointer',
        'border-b border-slate-100 dark:border-slate-800 last:border-0',
        'transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50',
        !notif.isRead && 'bg-blue-50/50 dark:bg-blue-950/10',
      )}
    >
      {/* Indikator belum dibaca */}
      <div className="mt-1 shrink-0">
        {notif.isRead ? (
          <Bell className="h-4 w-4 text-slate-300 dark:text-slate-600" />
        ) : (
          <BellDot className="h-4 w-4 text-blue-500" />
        )}
      </div>

      {/* Konten */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', typeColor)}>
            {typeLabel}
          </span>
          {!notif.isRead && (
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
          )}
        </div>
        <p className={cn(
          'text-sm text-slate-800 dark:text-slate-200 leading-snug',
          !notif.isRead && 'font-semibold',
        )}>
          {notif.title}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
          {notif.body}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          {formatDateTime(notif.createdAt)}
        </p>
      </div>

      {/* Tombol hapus */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'shrink-0 h-7 w-7 self-start mt-0.5',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30',
        )}
        disabled={isRemoving}
        onClick={(e) => {
          e.stopPropagation()
          onRemove(notif.notificationId)
        }}
        aria-label="Hapus notifikasi"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
