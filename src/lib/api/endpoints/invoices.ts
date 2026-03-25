import { api } from '@/lib/api/axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Invoice,
  PayInvoicePayload,
  RejectInvoicePayload,
  InvoiceListParams,
} from '@/types';

/**
 * Endpoint Sprint 4: Invoice
 *
 * ADMIN / MASTERADMIN:
 *   GET    /invoices                       → list
 *   GET    /invoices/:id                   → detail
 *   PATCH  /invoices/:id/confirm-payment   → confirmPayment
 *   PATCH  /invoices/:id/reject            → reject
 *   GET    /invoices/:id/pdf               → pdf (blob)
 *
 * Sprint 8 – Fix Gap 8 (PATIENT):
 *   GET    /members/:id/invoices           → listByMember
 *   GET    /invoices/:id                   → detail (reused, read-only)
 *   GET    /invoices/:id/pdf               → pdf (reused)
 */
export const invoicesApi = {
  // ── Sprint 4 – ADMIN ──────────────────────────────────────────────────────

  // Daftar invoice dengan filter (Admin/MasterAdmin)
  list: (params?: InvoiceListParams) =>
    api.get<PaginatedResponse<Invoice[]>>('invoices', { params }),

  // Detail satu invoice
  detail: (invoiceId: string) =>
    api.get<ApiResponse<Invoice>>(`invoices/${invoiceId}`),

  // Konfirmasi pembayaran (ADMIN / MASTERADMIN)
  confirmPayment: (invoiceId: string, payload: PayInvoicePayload) =>
    api.patch<ApiResponse<Invoice>>(
      `invoices/${invoiceId}/confirm-payment`,
      payload,
    ),

  // Tolak invoice (ADMIN / MASTERADMIN)
  reject: (invoiceId: string, payload: RejectInvoicePayload) =>
    api.patch<ApiResponse<Invoice>>(`invoices/${invoiceId}/reject`, payload),

  // Unduh PDF invoice sebagai Blob — buka tab baru (Admin) atau trigger download (Patient)
  pdf: (invoiceId: string) =>
    api.get<Blob>(`invoices/${invoiceId}/pdf`, { responseType: 'blob' }),

  // ── Sprint 8 – Fix Gap 8 – PATIENT ───────────────────────────────────────

  // Invoice milik pasien tertentu, diakses via /members/:id/invoices
  // PATIENT hanya bisa akses data diri sendiri — scoping di BE via req.user
  listByMember: (memberId: string, params?: InvoiceListParams) =>
    api.get<PaginatedResponse<Invoice[]>>(
      `members/${memberId}/invoices`,
      { params },
    ),
};
export const invoiceApi = {
  ...invoicesApi,
  downloadPdf: invoicesApi.pdf,
};