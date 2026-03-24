import {api} from "@/lib/api/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  Diagnosis,
  CreateDiagnosisPayload,
  UpdateDiagnosisPayload,
} from "@/types";

export const diagnosisApi = {
  list: (encounterId: string) =>
    api.get<ApiResponse<Diagnosis[]>>(
      `/encounters/${encounterId}/diagnoses`
    ),

  create: (encounterId: string, body: CreateDiagnosisPayload) =>
    api.post<ApiResponse<Diagnosis>>(
      `/encounters/${encounterId}/diagnoses`,
      body
    ),

  detail: (encounterId: string, diagnosisId: string) =>
    api.get<ApiResponse<Diagnosis>>(
      `/encounters/${encounterId}/diagnoses/${diagnosisId}`
    ),

  update: (
    encounterId: string,
    diagnosisId: string,
    body: UpdateDiagnosisPayload
  ) =>
    api.patch<ApiResponse<Diagnosis>>(
      `/encounters/${encounterId}/diagnoses/${diagnosisId}`,
      body
    ),

  remove: (encounterId: string, diagnosisId: string) =>
    api.delete<ApiResponse<null>>(
      `/encounters/${encounterId}/diagnoses/${diagnosisId}`
    ),
};
