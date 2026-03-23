import { api } from "@/lib/api/axios";
import type {
  ApiResponse,
  LoginPayload,
  LoginResponse,
  MeResponse,
  ChangePasswordPayload,
} from "@/types";

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<LoginResponse>>("/auth/login", payload),

  logout: () =>
    api.post<ApiResponse<null>>("/auth/logout"),

  me: () =>
    api.get<ApiResponse<MeResponse>>("/auth/me"),  // ✅ pakai MeResponse

  changePassword: (payload: ChangePasswordPayload) =>
    api.patch<ApiResponse<null>>("/auth/change-password", payload),
};
