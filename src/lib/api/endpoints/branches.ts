import { api } from "@/lib/api/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  Branch,
  BranchStats,
  BranchListParams,
  CreateBranchPayload,
  UpdateBranchPayload,
} from "@/types";

export const branchApi = {
  list: (params?: BranchListParams) =>
    api.get<PaginatedResponse<Branch>>("/branches", { params }),

  create: (data: CreateBranchPayload) =>
    api.post<ApiResponse<Branch>>("/branches", data),

  detail: (branchId: string) =>
    api.get<ApiResponse<Branch>>(`/branches/${branchId}`),

  update: (branchId: string, data: UpdateBranchPayload) =>
    api.patch<ApiResponse<Branch>>(`/branches/${branchId}`, data),

  toggleActive: (branchId: string) =>
    api.patch<ApiResponse<Branch>>(`/branches/${branchId}/toggle-active`),

  stats: (branchId: string) =>
    api.get<ApiResponse<BranchStats>>(`/branches/${branchId}/stats`),
};
