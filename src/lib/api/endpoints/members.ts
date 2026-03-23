import { api } from "@/lib/api/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  Member,
  MemberLookupResult,
  MemberListParams,
  CreateMemberPayload,
  UpdateMemberPayload,
} from "@/types";

export const memberApi = {
  // ⚠️ /members/lookup HARUS sebelum /members/:id di routing
  lookup: (memberNo: string) =>
    api.get<ApiResponse<MemberLookupResult[]>>("/members/lookup", {
      params: { memberNo },
    }),

  list: (params?: MemberListParams) =>
    api.get<PaginatedResponse<Member>>("/members", { params }),

  create: (data: CreateMemberPayload) =>
    api.post<ApiResponse<Member>>("/members", data),

  detail: (memberId: string) =>
    api.get<ApiResponse<Member>>(`/members/${memberId}`),

  update: (memberId: string, data: UpdateMemberPayload) =>
    api.patch<ApiResponse<Member>>(`/members/${memberId}`, data),

  toggleActive: (memberId: string) =>
    api.patch<ApiResponse<Member>>(`/members/${memberId}/toggle-active`),

  updateConsentPhoto: (memberId: string, isConsentToPhoto: boolean) =>
    api.patch<ApiResponse<Member>>(`/members/${memberId}/consent-photo`, {
      isConsentToPhoto,
    }),

  emr: (memberId: string) =>
    api.get<ApiResponse<EMREntry[]>>(`/members/${memberId}/emr`),
};

// ← re-export EMREntry type agar bisa diimport dari sini juga
import type { EMREntry } from "@/types";
export type { EMREntry };
