import { api } from '@/lib/api/axios'
import type {
  ApiResponse,
  PaginatedResponse,
  TreatmentSession,
  TreatmentSessionDetail,
  TherapyPlan,
  CreateSessionPayload,
  CompleteSessionPayload,
  PostponeSessionPayload,
  UpdateSessionPayload,
  SessionListParams,
} from '@/types'

export const sessionApi = {
  // 49 GET /api/treatment-sessions
  list: (params?: SessionListParams) =>
    api.get<PaginatedResponse<TreatmentSession>>('treatment-sessions', { params }),

  // POST /api/treatment-sessions
  create: (data: CreateSessionPayload) =>
    api.post<ApiResponse<TreatmentSessionDetail>>('treatment-sessions', data),

  // 50 GET /api/treatment-sessions/:sessionId (full detail incl. sub-data)
  detail: (sessionId: string) =>
    api.get<ApiResponse<TreatmentSessionDetail>>(`treatment-sessions/${sessionId}`),

  // 73 PATCH /api/treatment-sessions/:sessionId (update umum)
  update: (sessionId: string, data: UpdateSessionPayload) =>
    api.patch<ApiResponse<TreatmentSessionDetail>>(`treatment-sessions/${sessionId}`, data),

  // 54 PATCH /api/treatment-sessions/:sessionId/start
  start: (sessionId: string) =>
    api.patch<ApiResponse<TreatmentSessionDetail>>(`treatment-sessions/${sessionId}/start`),

  // 68 PATCH /api/treatment-sessions/:sessionId/complete → auto-create Invoice
  complete: (sessionId: string, data: CompleteSessionPayload) =>
    api.patch<ApiResponse<TreatmentSessionDetail>>(
      `treatment-sessions/${sessionId}/complete`,
      data,
    ),

  // 72 PATCH /api/treatment-sessions/:sessionId/postpone
  postpone: (sessionId: string, data: PostponeSessionPayload) =>
    api.patch<ApiResponse<TreatmentSessionDetail>>(
      `treatment-sessions/${sessionId}/postpone`,
      data,
    ),

  // 52 GET /api/treatment-sessions/:sessionId/therapy-plan
  therapyPlan: (sessionId: string) =>
    api.get<ApiResponse<TherapyPlan>>(`treatment-sessions/${sessionId}/therapy-plan`),
}
