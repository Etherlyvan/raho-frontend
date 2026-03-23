import {api} from '@/lib/api/axios'
import type {
  ApiResponse,
  PaginatedResponse,
  InventoryItem,
  InventoryListParams,
  CreateInventoryPayload,
  UpdateInventoryPayload,
  AddStockPayload,
  AlertsResponse,
} from '@/types'

export const inventoryApi = {
  // 78 GET /inventory
  list: (params?: InventoryListParams) =>
    api.get<PaginatedResponse<InventoryItem>>('/inventory', { params }),

  // 77 POST /inventory
  create: (data: CreateInventoryPayload) =>
    api.post<ApiResponse<InventoryItem>>('/inventory', data),

  // 83 GET /inventory/alerts — HARUS sebelum detail agar tidak bentrok
  alerts: () =>
    api.get<ApiResponse<AlertsResponse>>('/inventory/alerts'),

  // 79 GET /inventory/:itemId
  detail: (itemId: string) =>
    api.get<ApiResponse<InventoryItem>>(`/inventory/${itemId}`),

  // 80 PATCH /inventory/:itemId
  update: (itemId: string, data: UpdateInventoryPayload) =>
    api.patch<ApiResponse<InventoryItem>>(`/inventory/${itemId}`, data),

  // 81 PATCH /inventory/:itemId/add-stock
  addStock: (itemId: string, data: AddStockPayload) =>
    api.patch<ApiResponse<InventoryItem>>(`/inventory/${itemId}/add-stock`, data),

  // 82 DELETE /inventory/:itemId — null jika hard delete, item jika soft delete
  remove: (itemId: string) =>
    api.delete<ApiResponse<InventoryItem | null>>(`/inventory/${itemId}`),
}
