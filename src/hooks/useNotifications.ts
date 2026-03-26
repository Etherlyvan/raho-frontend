'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { notificationsApi } from '@/lib/api/endpoints/notifications'
import { getApiErrorMessage } from '@/lib/utils'

// ─── Constants ───────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 30_000
const BELL_LIMIT       = 8   // notifikasi yang ditampilkan di dropdown bell
const QUERY_KEY        = ['notifications'] as const

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Hook terpusat untuk manajemen notifikasi.
 *
 * - Polling otomatis setiap 30 detik untuk mendeteksi notifikasi baru.
 * - `unreadCount` digunakan oleh NotificationBell di Navbar.
 * - `notifications` (max 8) digunakan untuk preview dropdown Bell.
 * - Mutasi markRead / markAllRead / remove tersedia untuk dipakai
 *   baik di dropdown Bell maupun di halaman penuh /shared/notifications.
 */
export function useNotifications() {
  const queryClient = useQueryClient()

  // ── Unread query (untuk badge + dropdown Bell) ───────────────────────────
  const unreadQuery = useQuery({
    queryKey: [...QUERY_KEY, 'unread'],
    queryFn: async () => {
      const res = await notificationsApi.list({ isRead: false, limit: BELL_LIMIT })
      return res.data
    },
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: POLL_INTERVAL_MS,
  })

  // ── Helpers untuk invalidasi ─────────────────────────────────────────────
  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY })
  }

  // ── Mutasi: tandai satu notifikasi dibaca ────────────────────────────────
  const markReadMutation = useMutation({
    mutationFn: (notifId: string) => notificationsApi.markRead(notifId),
    onSuccess: invalidateAll,
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal menandai notifikasi')),
  })

  // ── Mutasi: tandai semua dibaca ──────────────────────────────────────────
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      invalidateAll()
      toast.success('Semua notifikasi ditandai sudah dibaca')
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal memperbarui notifikasi')),
  })

  // ── Mutasi: hapus satu notifikasi ────────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: (notifId: string) => notificationsApi.remove(notifId),
    onSuccess: () => {
      invalidateAll()
      toast.success('Notifikasi dihapus')
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal menghapus notifikasi')),
  })

  return {
    /** Notifikasi belum dibaca (max BELL_LIMIT item, untuk dropdown) */
    notifications: unreadQuery.data?.data ?? [],
    /** Total notifikasi belum dibaca — dipakai sebagai angka badge Bell */
    unreadCount: unreadQuery.data?.meta.total ?? 0,
    isLoading: unreadQuery.isLoading,
    isFetching: unreadQuery.isFetching,

    markRead:        markReadMutation.mutate,
    isMarkingRead:   markReadMutation.isPending,
    markAllRead:     markAllReadMutation.mutate,
    isMarkingAll:    markAllReadMutation.isPending,
    remove:          removeMutation.mutate,
    isRemoving:      removeMutation.isPending,

    /** Paksa refetch manual (misal setelah navigasi kembali ke halaman notif) */
    refetch: unreadQuery.refetch,
  }
}
