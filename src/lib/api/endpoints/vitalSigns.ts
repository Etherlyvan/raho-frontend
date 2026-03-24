import {api} from '@/lib/api/axios';
import type { ApiResponse, VitalSign, CreateVitalSignPayload } from '@/types';

/**
 * Endpoint 62–64: Tanda Vital per Sesi
 * GET  /treatment-sessions/:sessionId/vital-signs
 * POST /treatment-sessions/:sessionId/vital-signs
 * DELETE /treatment-sessions/:sessionId/vital-signs/:vsId
 */
export const vitalSignsApi = {
  /** 62 – Ambil semua tanda vital sesi, urut measuredAt ASC */
  list: (sessionId: string) =>
    api.get<ApiResponse<VitalSign[]>>(
      `treatment-sessions/${sessionId}/vital-signs`
    ),

  /** 63 – Input tanda vital baru (bisa berkali-kali dalam satu sesi) */
  create: (sessionId: string, body: CreateVitalSignPayload) =>
    api.post<ApiResponse<VitalSign>>(
      `treatment-sessions/${sessionId}/vital-signs`,
      body
    ),

  /** 64 – Hapus record tanda vital spesifik */
  remove: (sessionId: string, vsId: string) =>
    api.delete<ApiResponse<null>>(
      `treatment-sessions/${sessionId}/vital-signs/${vsId}`
    ),
};
