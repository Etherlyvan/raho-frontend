import {api} from '@/lib/api/axios'
import type {
  ApiResponse,
  PaginatedResponse,
  StockRequest,
  StockRequestListParams,
  CreateStockRequestPayload,
  RejectStockRequestPayload,
  FulfillStockRequestPayload,
} from '@/types'

export const stockRequestApi = {
  // 85 GET /stock-requests
  list: (params?: StockRequestListParams) =>
    api.get<PaginatedResponse<StockRequest>>('/stock-requests', { params }),

  // 84 POST /stock-requests
  create: (data: CreateStockRequestPayload) =>
    api.post<ApiResponse<StockRequest>>('/stock-requests', data),

  // 86 PATCH /stock-requests/:requestId/approve
  approve: (requestId: string) =>
    api.patch<ApiResponse<StockRequest>>(
      `/stock-requests/${requestId}/approve`,
    ),

  // 87 PATCH /stock-requests/:requestId/reject
  reject: (requestId: string, data: RejectStockRequestPayload) =>
    api.patch<ApiResponse<StockRequest>>(
      `/stock-requests/${requestId}/reject`,
      data,
    ),

  // 88 PATCH /stock-requests/:requestId/fulfill
  fulfill: (requestId: string, data?: FulfillStockRequestPayload) =>
    api.patch<ApiResponse<StockRequest>>(
      `/stock-requests/${requestId}/fulfill`,
      data,
    ),
}
