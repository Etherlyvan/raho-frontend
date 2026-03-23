import { api } from "@/lib/api/axios";
import type { ApiResponse, MemberDocument, DocumentType } from "@/types";

export const memberDocumentApi = {
  list: (memberId: string) =>
    api.get<ApiResponse<MemberDocument[]>>(`/members/${memberId}/documents`),

  upload: (memberId: string, file: File, type: DocumentType) => {
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    return api.post<ApiResponse<MemberDocument>>(
      `/members/${memberId}/documents`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  delete: (memberId: string, documentId: string) =>
    api.delete<ApiResponse<null>>(`/members/${memberId}/documents/${documentId}`),
};
