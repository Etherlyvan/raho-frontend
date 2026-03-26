import { api } from "@/lib/api/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  StaffUser,
  CreateUserPayload,
  UpdateUserPayload,
  ResetPasswordPayload,
  UserListParams,
} from "@/types";

export const userApi = {
  list: (params?: UserListParams) =>
    
    api.get<PaginatedResponse<StaffUser>>("/users", { params }),

  create: (data: CreateUserPayload) =>
    api.post<ApiResponse<StaffUser>>("/users", data),

  detail: (userId: string) =>
    api.get<ApiResponse<StaffUser>>(`/users/${userId}`),

  update: (userId: string, data: UpdateUserPayload) =>
    api.patch<ApiResponse<StaffUser>>(`/users/${userId}`, data),

  toggleActive: (userId: string) =>
    api.patch<ApiResponse<StaffUser>>(`/users/${userId}/toggle-active`),

  resetPassword: (userId: string, data: ResetPasswordPayload) =>
    api.patch<ApiResponse<null>>(`/users/${userId}/reset-password`, data),
};
