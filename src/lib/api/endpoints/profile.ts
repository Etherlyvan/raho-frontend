import { api } from "@/lib/api/axios";
import type { ApiResponse, UpdateProfilePayload, UserProfile } from "@/types";

export const profileApi = {
  get: (userId: string) =>
    api.get<ApiResponse<UserProfile>>(`/users/${userId}/profile`),

  update: (userId: string, payload: UpdateProfilePayload) =>
    api.patch<ApiResponse<UserProfile>>(`/users/${userId}/profile`, payload),
};
