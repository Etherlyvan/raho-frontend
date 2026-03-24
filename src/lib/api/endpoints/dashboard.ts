import {api} from '@/lib/api/axios';
import type {
  ApiResponse,
  AdminDashboard,
  DoctorDashboard,
  NurseDashboard,
} from '@/types';

/**
 * Endpoint 104–107: Dashboard per Role
 * GET /dashboard/admin    → ADMIN, MASTERADMIN
 * GET /dashboard/doctor   → DOCTOR
 * GET /dashboard/nurse    → NURSE
 * GET /dashboard/patient  → PATIENT
 */
export const dashboardApi = {
  /** 104 – Summary harian Admin: revenue, jadwal, stok kritis, invoice pending */
  admin: () =>
    api.get<ApiResponse<AdminDashboard>>('dashboard/admin'),

  /** 105 – Jadwal hari ini, pasien aktif, evaluasi rate Dokter */
  doctor: () =>
    api.get<ApiResponse<DoctorDashboard>>('dashboard/doctor'),

  /**
   * 106 – Sesi hari ini, stok kritis, stock request pending Perawat.
   * Sprint 7: type NurseDashboard menggantikan any.
   */
  nurse: () =>
    api.get<ApiResponse<NurseDashboard>>('dashboard/nurse'),

  /** 107 – Paket aktif, jadwal berikutnya, invoice pending Pasien */
  patient: () =>
    api.get<ApiResponse<any>>('dashboard/patient'),
};
