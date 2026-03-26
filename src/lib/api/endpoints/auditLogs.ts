import {api} from '@/lib/api/axios'
import type { PaginatedResponse, AuditLog, AuditLogListParams } from '@/types'

/**
 * Endpoint 113 — Audit Log
 *
 *  113  GET  /audit-logs  Log semua aktivitas sistem dengan filter & pagination
 *
 * Role: MASTERADMIN, SUPERADMIN
 */
export const auditLogsApi = {
  /**
   * List audit log.
   * Filter tersedia: userId, action, resource, dateFrom, dateTo.
   * Default limit: 50 item per halaman.
   */
  list: (params?: AuditLogListParams) =>
    api.get<PaginatedResponse<AuditLog>>('audit-logs', { params }),
}
