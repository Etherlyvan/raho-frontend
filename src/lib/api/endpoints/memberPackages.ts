import { api } from '@/lib/api/axios';
import type {
  ApiResponse,
  PaginatedResponse,
  MemberPackage,
  AssignPackagePayload,
  ConfirmPackagePaymentPayload,
} from '@/types';

/**
 * Endpoint Sprint 3–4: Paket Member
 * Semua path berada di bawah /members/:memberId/packages
 *
 * Sprint 3 – ADMIN:
 *   GET    /members/:id/packages          → list
 *   GET    /members/:id/packages/active   → listActive  (reused Sprint 8 PATIENT)
 *   GET    /members/:id/packages/:pkgId   → detail
 *   POST   /members/:id/packages          → assign
 *   PATCH  /members/:id/packages/:pkgId/confirm-payment → confirmPayment
 *   PATCH  /members/:id/packages/:pkgId/cancel          → cancel
 */
export const memberPackageApi = {
  // Daftar semua paket pasien (paginated)
  list: (memberId: string) =>
    api.get<PaginatedResponse<MemberPackage[]>>(
      `members/${memberId}/packages`,
    ),

  // Paket aktif saja (non-paginated array) — dipakai Admin Sprint 3 & Patient Sprint 8
  listActive: (memberId: string) =>
    api.get<ApiResponse<MemberPackage[]>>(
      `members/${memberId}/packages/active`,
    ),

  // Detail satu paket
  detail: (memberId: string, pkgId: string) =>
    api.get<ApiResponse<MemberPackage>>(
      `members/${memberId}/packages/${pkgId}`,
    ),

  // Assign paket baru ke pasien (ADMIN)
  assign: (memberId: string, payload: AssignPackagePayload) =>
    api.post<ApiResponse<MemberPackage>>(
      `members/${memberId}/packages`,
      payload,
    ),

  // Konfirmasi pembayaran paket (ADMIN)
  confirmPayment: (
    memberId: string,
    pkgId: string,
    payload: ConfirmPackagePaymentPayload,
  ) =>
    api.patch<ApiResponse<MemberPackage>>(
      `members/${memberId}/packages/${pkgId}/confirm-payment`,
      payload,
    ),

  // Batalkan paket (ADMIN)
  cancel: (memberId: string, pkgId: string) =>
    api.patch<ApiResponse<MemberPackage>>(
      `members/${memberId}/packages/${pkgId}/cancel`,
    ),
};
