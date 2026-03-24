import {api} from '@/lib/api/axios';
import type { ApiResponse, MaterialUsage, CreateMaterialUsagePayload } from '@/types';

/**
 * Endpoint 65–67: Pemakaian Bahan & Alat per Sesi
 * GET    /treatment-sessions/:sessionId/material-usages
 * POST   /treatment-sessions/:sessionId/material-usages
 * DELETE /treatment-sessions/:sessionId/material-usages/:muId
 *
 * Catatan BE: stok inventori berkurang otomatis saat POST,
 * dan dikembalikan otomatis saat DELETE.
 */
export const materialUsagesApi = {
  /** 65 – List semua pemakaian bahan/alat pada sesi */
  list: (sessionId: string) =>
    api.get<ApiResponse<MaterialUsage[]>>(
      `treatment-sessions/${sessionId}/material-usages`
    ),

  /** 66 – Input pemakaian baru; stok inventori berkurang otomatis */
  create: (sessionId: string, body: CreateMaterialUsagePayload) =>
    api.post<ApiResponse<MaterialUsage>>(
      `treatment-sessions/${sessionId}/material-usages`,
      body
    ),

  /**
   * 67 – Hapus pemakaian; stok inventori dikembalikan.
   * Hanya bisa dilakukan selama sesi INPROGRESS.
   */
  remove: (sessionId: string, muId: string) =>
    api.delete<ApiResponse<null>>(
      `treatment-sessions/${sessionId}/material-usages/${muId}`
    ),
};
