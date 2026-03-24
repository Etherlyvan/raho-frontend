// Tambahkan ke file encounters.ts yang sudah ada

import {api} from "@/lib/api/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  Encounter,
  CreateEncounterPayload,
  UpdateEncounterStatusPayload,
  EncounterListParams,
  UpsertAssessmentPayload,
} from "@/types";

export const encountersApi = {
    list: (params?: EncounterListParams) =>
    api.get<PaginatedResponse<Encounter>>("/encounters", { params }),

  create: (body: CreateEncounterPayload) =>
    api.post<ApiResponse<Encounter>>("/encounters", body),

  detail: (encounterId: string) =>
    api.get<ApiResponse<Encounter>>(`/encounters/${encounterId}`),

  updateStatus: (encounterId: string, body: UpdateEncounterStatusPayload) =>
    api.patch<ApiResponse<Encounter>>(`/encounters/${encounterId}`, body),

  // fix Gap 9 — PUT /encounters/:id/assessment
  upsertAssessment: (encounterId: string, body: UpsertAssessmentPayload) =>
    api.put<ApiResponse<Encounter>>(
      `/encounters/${encounterId}/assessment`,
      body
    ),

  summary: (encounterId: string) =>
    api.get<ApiResponse<unknown>>(`/encounters/${encounterId}/summary`),
};
