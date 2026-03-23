import {api} from '@/lib/api/axios'
import type {
  ApiResponse,
  PaginatedResponse,
  Invoice,
  PayInvoicePayload,
  RejectInvoicePayload,
  InvoiceListParams,
} from '@/types'

export const invoiceApi = {
  // 89 GET /api/invoices
  list: (params?: InvoiceListParams) =>
    api.get<PaginatedResponse<Invoice>>('invoices', { params }),

  // 90 GET /api/invoices/:invoiceId
  detail: (invoiceId: string) =>
    api.get<ApiResponse<Invoice>>(`invoices/${invoiceId}`),

  // 91 PATCH /api/invoices/:invoiceId/pay — konfirmasi pembayaran
  // BE endpoint-nya adalah /pay (BUKAN /confirm-payment seperti di member-package)
  confirmPayment: (invoiceId: string, data?: PayInvoicePayload) =>
  api.patch<ApiResponse<Invoice>>(`invoices/${invoiceId}/confirm-payment`, data),

  // 93 PATCH /api/invoices/:invoiceId/reject
  reject: (invoiceId: string, data: RejectInvoicePayload) =>
    api.patch<ApiResponse<Invoice>>(`invoices/${invoiceId}/reject`, data),

  // 89b GET /api/members/:memberId/invoices
  listByMember: (memberId: string, params?: InvoiceListParams) =>
    api.get<PaginatedResponse<Invoice>>(`members/${memberId}/invoices`, { params }),

  // GET /api/invoices/:invoiceId/pdf → blob download
  downloadPdf: async (invoiceId: string): Promise<void> => {
    const res = await api.get(`invoices/${invoiceId}/pdf`, { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([res.data as BlobPart]))
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoiceId}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },
}
