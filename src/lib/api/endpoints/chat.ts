import {api} from '@/lib/api/axios'
import type {
  ApiResponse,
  PaginatedResponse,
  ChatRoom,
  ChatMessage,
  CreateChatRoomPayload,
  SendMessagePayload,
  MessageListParams,
} from '@/types'

/**
 * Endpoint 100–103 — Chat
 *
 *  100  GET   /chatrooms                  List chat room milik user yang login
 *  101  POST  /chatrooms                  Buat chat room baru (cek duplikat di BE)
 *  102  GET   /chatrooms/:id/messages     Ambil pesan dengan pagination (DESC → dibalik di BE)
 *  103  POST  /chatrooms/:id/messages     Kirim pesan teks atau file
 */
export const chatApi = {
  /** 100 — List seluruh chat room di mana user adalah peserta */
  listRooms: () =>
    api.get<ApiResponse<ChatRoom[]>>('chatrooms'),

  /**
   * 101 — Buat chat room baru.
   * BE secara otomatis menambahkan createdBy ke participants dan
   * mengembalikan room yang sudah ada jika participants sama persis.
   */
  createRoom: (body: CreateChatRoomPayload) =>
    api.post<ApiResponse<ChatRoom>>('chatrooms', body),

  /** 102 — Ambil pesan dalam satu room; diurutkan dari lama ke baru (BE reverse) */
  messages: (roomId: string, params?: MessageListParams) =>
    api.get<PaginatedResponse<ChatMessage>>(
      `chatrooms/${roomId}/messages`,
      { params },
    ),

  /** 103 — Kirim pesan; wajib ada `content` atau `fileUrl` */
  send: (roomId: string, body: SendMessagePayload) =>
    api.post<ApiResponse<ChatMessage>>(
      `chatrooms/${roomId}/messages`,
      body,
    ),
}
