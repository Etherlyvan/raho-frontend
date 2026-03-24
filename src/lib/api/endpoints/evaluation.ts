import {api} from "@/lib/api/axios";
import type {
  ApiResponse,
  SessionEvaluation,
  CreateEvaluationPayload,
  UpdateEvaluationPayload,
} from "@/types";

export const evaluationApi = {
  get: (sessionId: string) =>
    api.get<ApiResponse<SessionEvaluation>>(
      `/treatment-sessions/${sessionId}/evaluation`
    ),

  create: (sessionId: string, body: CreateEvaluationPayload) =>
    api.post<ApiResponse<SessionEvaluation>>(
      `/treatment-sessions/${sessionId}/evaluation`,
      body
    ),

  update: (sessionId: string, body: UpdateEvaluationPayload) =>
    api.patch<ApiResponse<SessionEvaluation>>(
      `/treatment-sessions/${sessionId}/evaluation`,
      body
    ),
};
