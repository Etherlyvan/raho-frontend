// ⚠️ PATH: /branch-access — BUKAN /members/:id/branch-access
import { api } from "@/lib/api/axios";
import type { ApiResponse, BranchAccess, GrantBranchAccessPayload } from "@/types";

export const branchAccessApi = {
  // POST /branch-access — grant akses cabang ke pasien via memberNo
  grant: (data: GrantBranchAccessPayload) =>
    api.post<ApiResponse<BranchAccess>>("/branch-access", data),

  // GET /branch-access/:memberId — list cabang yang punya akses ke pasien
  listByMember: (memberId: string) =>
    api.get<ApiResponse<BranchAccess[]>>(`/branch-access/${memberId}`),

  // PATCH /branch-access/:accessId/revoke — cabut akses
  revoke: (accessId: string) =>
    api.patch<ApiResponse<null>>(`/branch-access/${accessId}/revoke`),
};
