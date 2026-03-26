'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCheck } from 'lucide-react'

import { Button }                from '@/components/ui/button'
import { Skeleton }              from '@/components/ui/skeleton'
import { EmptyState }            from '@/components/shared/EmptyState'
import { Pagination }            from '@/components/shared/Pagination'
import { NotificationItem }      from './NotificationItem'
import { NotificationFilters }   from './NotificationFilters'
import type { ReadFilter }       from './NotificationFilters'
import { notificationsApi }      from '@/lib/api/endpoints/notifications'
import { getApiErrorMessage }    from '@/lib/utils'

const PAGE_LIMIT = 20
const QUERY_KEY  = ['notifications', 'full-list'] as const

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Daftar notifikasi lengkap untuk halaman /shared/notifications.
 * Mendukung filter status baca dan tipe, serta pagination.
 */
export function NotificationList() {
  const queryClient = useQueryClient()

  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [page, setPage]             = useState(1)

  // ── Bangun params berdasarkan filter aktif ─────────────────────────────
  const params = {
    ...(readFilter === 'unread' && { isRead: false }),
    ...(readFilter === 'read'   && { isRead: true  }),
    ...(typeFilter              && { type: typeFilter }),
    page,
    limit: PAGE_LIMIT,
  }

  // ── Query ──────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: async () => {
      const res = await notificationsApi.list(params)
      return res.data
    },
    staleTime: 15_000,
  })

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  // ── Mutasi: tandai satu dibaca ─────────────────────────────────────────
  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess:  invalidateAll,
    onError:    (err) => toast.error(getApiErrorMessage(err, 'Gagal menandai notifikasi')),
  })

  // ── Mutasi: tandai semua dibaca ────────────────────────────────────────
  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      invalidateAll()
      toast.success('Semua notifikasi ditandai sudah dibaca')
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal memperbarui notifikasi')),
  })

  // ── Mutasi: hapus satu notifikasi ──────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.remove(id),
    onSuccess: () => {
      invalidateAll()
      toast.success('Notifikasi dihapus')
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal menghapus notifikasi')),
  })

  // Reset ke halaman 1 saat filter berubah
  const handleReadChange = useCallback((v: ReadFilter) => {
    setReadFilter(v)
    setPage(1)
  }, [])

  const handleTypeChange = useCallback((v: string) => {
    setTypeFilter(v)
    setPage(1)
  }, [])

  const notifications = data?.data   ?? []
  const meta          = data?.meta
  const hasUnread     = notifications.some((n) => !n.isRead)

  // ── Loading skeleton ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-0 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <Skeleton className="h-4 w-4 rounded mt-1 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2.5 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3">
        <NotificationFilters
          readFilter={readFilter}
          typeFilter={typeFilter}
          onReadChange={handleReadChange}
          onTypeChange={handleTypeChange}
        />
      </div>

      {/* Toolbar: tandai semua dibaca */}
      {hasUnread && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {markAllMutation.isPending ? 'Memproses...' : 'Tandai semua dibaca'}
          </Button>
        </div>
      )}

      {/* Daftar notifikasi */}
      {notifications.length === 0 ? (
        <EmptyState
          title="Tidak ada notifikasi"
          description="Belum ada notifikasi yang sesuai dengan filter yang dipilih."
        />
      ) : (
        <div
          className={cn(
            'rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden',
            'bg-white dark:bg-slate-950 transition-opacity',
            isFetching && 'opacity-70',
          )}
        >
          {notifications.map((notif) => (
            <NotificationItem
              key={notif.notificationId}
              notification={notif}
              onMarkRead={(id) => markReadMutation.mutate(id)}
              onRemove={(id)   => removeMutation.mutate(id)}
              isRemoving={removeMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination meta={meta} page={page} onPageChange={setPage} />
      )}
    </div>
  )
}

// cn diperlukan di dalam komponen ini
import { cn } from '@/lib/utils'
