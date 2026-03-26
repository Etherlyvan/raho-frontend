'use client'

import { useRef, useEffect } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { chatApi } from '@/lib/api/endpoints/chat'
import { getApiErrorMessage } from '@/lib/utils'
import type { SendMessagePayload } from '@/types'

// ─── Constants ───────────────────────────────────────────────────────────────

/** Polling pesan aktif setiap 5 detik untuk pengalaman mendekati real-time */
const MESSAGE_POLL_INTERVAL_MS = 5_000

// ─── Hook: daftar room ────────────────────────────────────────────────────────

export function useChatRooms() {
  return useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: async () => {
      const res = await chatApi.listRooms()
      return res.data.data
    },
    staleTime: 30_000,
  })
}

// ─── Hook: pesan dalam satu room ─────────────────────────────────────────────

/**
 * Hook untuk mengelola percakapan dalam satu chat room.
 *
 * - Polling setiap 5 detik agar pesan baru muncul otomatis.
 * - `scrollRef` dipasang ke container pesan; akan auto-scroll ke bawah
 *   setiap kali ada pesan baru.
 * - `send()` otomatis invalidate query room agar lastMessage di sidebar
 *   ikut diperbarui.
 */
export function useChat(roomId: string) {
  const queryClient  = useQueryClient()
  const scrollRef    = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef<number>(0)

  // ── Fetch pesan ───────────────────────────────────────────────────────────
  const messagesQuery = useQuery({
    queryKey: ['chat', 'messages', roomId],
    queryFn: async () => {
      const res = await chatApi.messages(roomId, { limit: 50 })
      return res.data
    },
    refetchInterval: MESSAGE_POLL_INTERVAL_MS,
    enabled: !!roomId,
  })

  // ── Auto-scroll ke bawah saat ada pesan baru ──────────────────────────────
  useEffect(() => {
    const messages = messagesQuery.data?.data ?? []
    if (messages.length !== prevCountRef.current) {
      prevCountRef.current = messages.length
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      })
    }
  }, [messagesQuery.data])

  // ── Mutasi: kirim pesan ───────────────────────────────────────────────────
  const sendMutation = useMutation({
    mutationFn: (body: SendMessagePayload) => chatApi.send(roomId, body),
    onSuccess: () => {
      // Invalidate pesan room ini & daftar room (lastMessage preview)
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', roomId] })
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Pesan gagal dikirim')),
  })

  return {
    messages:    messagesQuery.data?.data ?? [],
    meta:        messagesQuery.data?.meta,
    isLoading:   messagesQuery.isLoading,
    isFetching:  messagesQuery.isFetching,
    /** Ref dipasang ke elemen scroll container di ChatPage */
    scrollRef,
    send:        sendMutation.mutate,
    isSending:   sendMutation.isPending,
  }
}
