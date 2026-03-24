import {api} from '@/lib/api/axios';
import type { ApiResponse, SessionPhoto, CreateSessionPhotoPayload } from '@/types';

/**
 * Endpoint 68–70: Foto Sesi
 * GET    /treatment-sessions/:sessionId/photos
 * POST   /treatment-sessions/:sessionId/photos
 * DELETE /treatment-sessions/:sessionId/photos/:photoId
 *
 * Catatan BE: POST diblokir jika member.isConsentToPhoto === false.
 * FE wajib memvalidasi consent sebelum menampilkan form upload.
 */
export const sessionPhotoApi = {
  /** 68 – List semua foto sesi, urut createdAt ASC */
  list: (sessionId: string) =>
    api.get<ApiResponse<SessionPhoto[]>>(
      `treatment-sessions/${sessionId}/photos`
    ),

  /**
   * 69 – Upload foto sesi.
   * BE memvalidasi isConsentToPhoto; kirim URL hasil upload storage (bukan file binary).
   */
  create: (sessionId: string, body: CreateSessionPhotoPayload) =>
    api.post<ApiResponse<SessionPhoto>>(
      `treatment-sessions/${sessionId}/photos`,
      body
    ),

  /** 70 – Hapus foto sesi */
  remove: (sessionId: string, photoId: string) =>
    api.delete<ApiResponse<null>>(
      `treatment-sessions/${sessionId}/photos/${photoId}`
    ),
};
