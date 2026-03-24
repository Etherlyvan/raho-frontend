import {api} from "@/lib/api/axios";
import type {
  ApiResponse,
  TherapyPlan,
  CreateTherapyPlanPayload,
  UpdateTherapyPlanPayload,
} from "@/types";

export const therapyPlanApi = {
  get: (sessionId: string) =>
    api.get<ApiResponse<TherapyPlan>>(
      `/treatment-sessions/${sessionId}/therapy-plan`
    ),

  create: (sessionId: string, body: CreateTherapyPlanPayload) =>
    api.post<ApiResponse<TherapyPlan>>(
      `/treatment-sessions/${sessionId}/therapy-plan`,
      body
    ),

  update: (sessionId: string, body: UpdateTherapyPlanPayload) =>
    api.patch<ApiResponse<TherapyPlan>>(
      `/treatment-sessions/${sessionId}/therapy-plan`,
      body
    ),
};
