import {api} from '@/lib/api/axios'
import type {
  ApiResponse,
  PaginatedResponse,
  Notification,
  NotificationListParams,
} from '@/types'

/**
 * Endpoint 96–99 — Notifikasi
 *
 *  96  GET    /notifications           List notifikasi user yang login
 *  97  PATCH  /notifications/:id/read  Tandai satu notifikasi sudah dibaca
 *  98  PATCH  /notifications/read-all  Tandai semua notifikasi sudah dibaca
 *  99  DELETE /notifications/:id       Hapus notifikasi
 */
export const notificationsApi = {
  /** 96 — Daftar notifikasi dengan filter isRead / type / pagination */
  list: (params?: NotificationListParams) =>
    api.get<PaginatedResponse<Notification>>('notifications', { params }),

  /**
   * 97 — Tandai satu notifikasi sebagai sudah dibaca.
   * PENTING: route statis `read-all` harus di-register SEBELUM route dinamis
   * `:notifId` di BE — sudah ditangani di notification.routes.ts.
   */
  markRead: (notifId: string) =>
    api.patch<ApiResponse<Notification>>(`notifications/${notifId}/read`),

  /** 98 — Tandai semua notifikasi milik user sebagai sudah dibaca */
  markAllRead: () =>
    api.patch<ApiResponse<null>>('notifications/read-all'),

  /** 99 — Hapus satu notifikasi secara permanen */
  remove: (notifId: string) =>
    api.delete<ApiResponse<null>>(`notifications/${notifId}`),
}
