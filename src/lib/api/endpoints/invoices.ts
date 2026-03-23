import {api} from '@/lib/api/axios'
import type {
  ApiResponse,
  PaginatedResponse,
  Invoice,
  InvoiceListParams,
  PayInvoicePayload,
  RejectInvoicePayload,
} from '@/types'

export const invoiceApi = {
  list: (params?: InvoiceListParams) =>
    api.get<PaginatedResponse<Invoice>>('/invoices', { params }),

  detail: (invoiceId: string) =>
    api.get<ApiResponse<Invoice>>(`/invoices/${invoiceId}`),

  confirmPayment: (invoiceId: string, data?: PayInvoicePayload) =>
    api.patch<ApiResponse<Invoice>>(`/invoices/${invoiceId}/pay`, data),

  verify: (invoiceId: string) =>
    api.patch<ApiResponse<Invoice>>(`/invoices/${invoiceId}/verify`),

  reject: (invoiceId: string, data: RejectInvoicePayload) =>
    api.patch<ApiResponse<Invoice>>(`/invoices/${invoiceId}/reject`, data),

  update: (
    invoiceId: string,
    data: Partial<{ amount: number; items: unknown[]; notes: string }>,
  ) => api.patch<ApiResponse<Invoice>>(`/invoices/${invoiceId}`, data),

  listByMember: (memberId: string, params?: InvoiceListParams) =>
    api.get<PaginatedResponse<Invoice>>(`/members/${memberId}/invoices`, {
      params,
    }),

  // ✅ TAMBAH — download PDF as blob, trigger browser download
  downloadPdf: async (invoiceId: string): Promise<void> => {
    const res = await api.get<Blob>(`/invoices/${invoiceId}/pdf`, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoiceId}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  },
}
