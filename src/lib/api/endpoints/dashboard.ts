import type { ApiResponse, AdminDashboard, DoctorDashboard } from "@/types";
import { api } from "../axios";

export const dashboardApi = {
  admin: () => api.get<ApiResponse<AdminDashboard>>("/dashboard/admin"),
  doctor: () => api.get<ApiResponse<DoctorDashboard>>("/dashboard/doctor"),
  nurse: () => api.get<ApiResponse<any>>("/dashboard/nurse"),
  patient: () => api.get<ApiResponse<any>>("/dashboard/patient"),
};