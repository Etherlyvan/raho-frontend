import { api } from "@/lib/api/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  Encounter,
  CreateEncounterPayload,
  UpdateEncounterStatusPayload,
  EncounterListParams,
} from '@/types'

export const encounterApi = {
  // 37 GET /api/encounters
  list: (params?: EncounterListParams) =>
    api.get<PaginatedResponse<Encounter>>('encounters', { params }),

  // POST /api/encounters
  create: (data: CreateEncounterPayload) =>
    api.post<ApiResponse<Encounter>>('encounters', data),

  // 39 GET /api/encounters/:encounterId
  detail: (encounterId: string) =>
    api.get<ApiResponse<Encounter>>(`encounters/${encounterId}`),

  // 41 PATCH /api/encounters/:encounterId (update status)
  updateStatus: (encounterId: string, data: UpdateEncounterStatusPayload) =>
    api.patch<ApiResponse<Encounter>>(`encounters/${encounterId}`, data),

  // 76 GET /api/encounters/:encounterId/summary
  summary: (encounterId: string) =>
    api.get<ApiResponse<unknown>>(`encounters/${encounterId}/summary`),
}
