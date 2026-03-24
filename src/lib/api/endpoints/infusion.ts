import {api} from '@/lib/api/axios';
import type {
  ApiResponse,
  InfusionExecution,
  CreateInfusionPayload,
  UpdateInfusionPayload,
} from '@/types';

/**
 * Endpoint 59–61: Pelaksanaan Infus Aktual per Sesi
 * GET   /treatment-sessions/:sessionId/infusion
 * POST  /treatment-sessions/:sessionId/infusion
 * PATCH /treatment-sessions/:sessionId/infusion
 *
 * Catatan BE: deviationNote WAJIB diisi jika nilai aktual berbeda dari rencana.
 * Validasi ini dilakukan di sisi BE — FE cukup menampilkan DeviationAlert.
 */
export const infusionApi = {
  /** 59 – Ambil data infus aktual (beserta session.therapyPlan untuk perbandingan) */
  get: (sessionId: string) =>
    api.get<ApiResponse<InfusionExecution>>(
      `treatment-sessions/${sessionId}/infusion`
    ),

  /** 60 – Input infus aktual (satu sesi hanya boleh satu record) */
  create: (sessionId: string, body: CreateInfusionPayload) =>
    api.post<ApiResponse<InfusionExecution>>(
      `treatment-sessions/${sessionId}/infusion`,
      body
    ),

  /** 61 – Update infus aktual (hanya saat sesi masih INPROGRESS) */
  update: (sessionId: string, body: UpdateInfusionPayload) =>
    api.patch<ApiResponse<InfusionExecution>>(
      `treatment-sessions/${sessionId}/infusion`,
      body
    ),
};
