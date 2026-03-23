import { api } from "@/lib/api/axios";
import type {
  ApiResponse,
  MemberPackage,
  AssignPackagePayload,
  ConfirmPackagePaymentPayload,
} from "@/types";

export const memberPackageApi = {
  list: (memberId: string) =>
    api.get<ApiResponse<MemberPackage[]>>(`/members/${memberId}/packages`),

  listActive: (memberId: string) =>
    api.get<ApiResponse<MemberPackage[]>>(`/members/${memberId}/packages/active`),

  create: (memberId: string, data: AssignPackagePayload) =>
    api.post<ApiResponse<MemberPackage>>(`/members/${memberId}/packages`, data),

  detail: (memberId: string, packageId: string) =>
    api.get<ApiResponse<MemberPackage>>(`/members/${memberId}/packages/${packageId}`),

  confirmPayment: (memberId: string, packageId: string, data: ConfirmPackagePaymentPayload) =>
    api.patch<ApiResponse<MemberPackage>>(
      `/members/${memberId}/packages/${packageId}/confirm-payment`,
      data,
    ),

  cancel: (memberId: string, packageId: string) =>
    api.patch<ApiResponse<MemberPackage>>(
      `/members/${memberId}/packages/${packageId}/cancel`,
    ),
};
