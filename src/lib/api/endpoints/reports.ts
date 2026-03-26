import {api}from '@/lib/api/axios'
import type {
  ApiResponse,
  RevenueReport,
  TreatmentReport,
  InventoryReport,
  StaffKpiReport,
  ReportBaseParams,
  ExportParams,
} from '@/types'

/**
 * Endpoint 108–112 — Reports
 *
 *  108  GET  /reports/revenue      Laporan revenue per periode / cabang
 *  109  GET  /reports/treatment    Laporan sesi & outcome klinis
 *  110  GET  /reports/inventory    Laporan mutasi & penggunaan stok
 *  111  GET  /reports/staff-kpi    KPI dokter & perawat
 *  112  GET  /reports/export       Export laporan ke CSV (blob response)
 *
 * Role:
 *  EP-108,109,111,112 → MASTERADMIN, SUPERADMIN
 *  EP-110             → ADMIN (scope cabang), MASTERADMIN, SUPERADMIN
 */
export const reportsApi = {
  /** 108 — Revenue report; dikelompokkan by day / week / month */
  revenue: (params?: ReportBaseParams) =>
    api.get<ApiResponse<RevenueReport>>('reports/revenue', { params }),

  /** 109 — Treatment report; completionRate, total sesi per periode */
  treatment: (params?: ReportBaseParams) =>
    api.get<ApiResponse<TreatmentReport>>('reports/treatment', { params }),

  /**
   * 110 — Inventory usage report.
   * ADMIN hanya mendapat data cabangnya sendiri (difilter BE via branchId dari JWT).
   * MASTERADMIN/SUPERADMIN dapat pass `branchId` secara eksplisit.
   */
  inventory: (params?: ReportBaseParams) =>
    api.get<ApiResponse<InventoryReport>>('reports/inventory', { params }),

  /** 111 — Staff KPI; filter by role secara opsional via groupBy param */
  staffKpi: (params?: ReportBaseParams) =>
    api.get<ApiResponse<StaffKpiReport>>('reports/staff-kpi', { params }),

  /**
   * 112 — Export laporan ke CSV.
   * Menggunakan `responseType: 'blob'` agar Axios tidak mem-parse JSON.
   * Filename diambil dari header `Content-Disposition` jika tersedia.
   */
  export: (params: ExportParams) =>
    api.get<Blob>('reports/export', {
      params,
      responseType: 'blob',
    }),
}
