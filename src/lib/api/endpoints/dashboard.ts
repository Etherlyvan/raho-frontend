import { api } from '@/lib/api/axios';
import type {
  ApiResponse,
  AdminDashboard,
  DoctorDashboard,
  NurseDashboard,
  PatientDashboard,
} from '@/types';

/**
 * Endpoint 103–106: Dashboard per Role
 * GET /api/dashboard/admin   → ADMIN, MASTERADMIN, SUPERADMIN
 * GET /api/dashboard/doctor  → DOCTOR
 * GET /api/dashboard/nurse   → NURSE
 * GET /api/dashboard/patient → PATIENT
 */
export const dashboardApi = {
  // 103 – Ringkasan harian: revenue, jadwal, stok kritis, invoice pending
  admin: () =>
    api.get<ApiResponse<AdminDashboard>>('dashboard/admin'),

  // 104 – Jadwal hari ini, encounter aktif, evaluasi rate (Dokter)
  doctor: () =>
    api.get<ApiResponse<DoctorDashboard>>('dashboard/doctor'),

  // 105 – Sesi hari ini, stok kritis, stock request pending (Perawat)
  nurse: () =>
    api.get<ApiResponse<NurseDashboard>>('dashboard/nurse'),

  // 106 – Paket aktif, sesi berikutnya, invoice pending (Pasien) [Fix Sprint 8]
  patient: () =>
    api.get<ApiResponse<PatientDashboard>>('dashboard/patient'),
};
