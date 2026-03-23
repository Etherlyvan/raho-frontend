import { api } from "@/lib/api/axios";
import type { ApiResponse, AdminDashboard } from "@/types";

export const dashboardApi = {
  admin: () =>
    api.get<ApiResponse<AdminDashboard>>("/dashboard/admin"),

  doctor: () =>
    api.get<ApiResponse<unknown>>("/dashboard/doctor"),

  nurse: () =>
    api.get<ApiResponse<unknown>>("/dashboard/nurse"),

  patient: () =>
    api.get<ApiResponse<unknown>>("/dashboard/patient"),
};
