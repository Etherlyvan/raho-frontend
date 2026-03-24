import {api} from "@/lib/api/axios";
import type { ApiResponse, EMRNote, CreateEMRNotePayload, EMREntry } from "@/types";

export const emrNotesApi = {
  // EMR per Encounter
  listByEncounter: (encounterId: string) =>
    api.get<ApiResponse<EMRNote[]>>(
      `/encounters/${encounterId}/emr-notes`
    ),

  createEncounterNote: (encounterId: string, body: CreateEMRNotePayload) =>
    api.post<ApiResponse<EMRNote>>(
      `/encounters/${encounterId}/emr-notes`,
      body
    ),

  // EMR per Session (fix Gap 5)
  listBySession: (sessionId: string) =>
    api.get<ApiResponse<EMRNote[]>>(
      `/treatment-sessions/${sessionId}/emr-notes`
    ),

  createSessionNote: (sessionId: string, body: CreateEMRNotePayload) =>
    api.post<ApiResponse<EMRNote>>(
      `/treatment-sessions/${sessionId}/emr-notes`,
      body
    ),

  // Full EMR pasien lintas encounter
  fullEmr: (memberId: string) =>
    api.get<ApiResponse<EMREntry[]>>(`/members/${memberId}/emr`),
};
