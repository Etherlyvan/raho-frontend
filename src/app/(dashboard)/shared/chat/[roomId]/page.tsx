'use client'

import { use, useState, useCallback } from 'react'
import { useRouter }        from 'next/navigation'
import {
  ArrowLeft,
  Users,
  RefreshCw,
  ChevronUp,
  Loader2,
} from 'lucide-react'
import Link                 from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { Button }           from '@/components/ui/button'
import { Skeleton }         from '@/components/ui/skeleton'
import { ChatBubble }       from '@/components/modules/chat/ChatBubble'
import { ChatInput }        from '@/components/modules/chat/ChatInput'
import { useChat }          from '@/hooks/useChat'
import { useAuthStore }     from '@/store/auth.store'
import { chatApi }          from '@/lib/api/endpoints/chat'
import { cn }               from '@/lib/utils'
import type { SendMessagePayload } from '@/types'

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ChatPageSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="flex-1 p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={cn('flex gap-3', i % 2 === 0 ? 'flex-row' : 'flex-row-reverse')}>
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            <Skeleton className={cn('h-12 rounded-2xl', i % 2 === 0 ? 'w-56' : 'w-44')} />
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

interface ChatRoomHeaderProps {
  participants:  string[]
  currentUserId: string
  onRefresh:     () => void
  isFetching:    boolean
}

function ChatRoomHeader({
  participants,
  currentUserId,
  onRefresh,
  isFetching,
}: ChatRoomHeaderProps) {
  const otherCount = participants.filter((id) => id !== currentUserId).length

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
        asChild
      >
        <Link href="/dashboard/shared/chat">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
          <Users className="h-4 w-4 text-slate-500" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            Chat Room
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {participants.length} peserta · {otherCount} lainnya
          </p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-slate-400 hover:text-slate-700"
        onClick={onRefresh}
        disabled={isFetching}
        aria-label="Muat ulang pesan"
      >
        <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
      </Button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId }  = use(params)
  const currentUser = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  const [page, setPage]               = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [olderMessages, setOlderMessages] = useState<
    Awaited<ReturnType<typeof chatApi.messages>>['data']['data']
  >([])

  // ── Verifikasi room ────────────────────────────────────────────────────
  const roomQuery = useQuery({
    queryKey: ['chat', 'rooms', 'detail', roomId],
    queryFn: async () => {
      const res  = await chatApi.listRooms()
      const room = res.data.data.find((r) => r.chatRoomId === roomId)
      if (!room) throw new Error('Room tidak ditemukan atau Anda bukan peserta.')
      return room
    },
    staleTime: 60_000,
  })

  // ── Pesan via useChat (polling 5s, auto-scroll) ────────────────────────
  const {
    messages,
    meta,
    isLoading:  isMessagesLoading,
    isFetching: isMessagesFetching,
    scrollRef,
    send,
    isSending,
  } = useChat(roomId)

  // ── Load more ──────────────────────────────────────────────────────────
  const hasMorePages = meta ? page < meta.totalPages : false

  async function loadMore() {
    if (isLoadingMore || !hasMorePages) return
    setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await chatApi.messages(roomId, { page: nextPage, limit: 50 })
      setOlderMessages((prev) => [...(res.data.data ?? []), ...prev])
      setPage(nextPage)
    } catch {
      // silent fail
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleSend = useCallback(
    (payload: SendMessagePayload) => send(payload),
    [send],
  )

  if (!currentUser) return null
  if (roomQuery.isLoading || isMessagesLoading) return <ChatPageSkeleton />

  if (roomQuery.isError || !roomQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] gap-4 text-slate-400">
        <p className="text-sm font-medium text-slate-500">
          Chat room tidak ditemukan atau Anda tidak memiliki akses.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/shared/chat">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Kembali ke daftar chat
          </Link>
        </Button>
      </div>
    )
  }

  const room        = roomQuery.data
  const allMessages = [...olderMessages, ...messages]

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-950">
      <ChatRoomHeader
        participants={room.participants}
        currentUserId={currentUser.userId}
        onRefresh={() =>
          queryClient.invalidateQueries({ queryKey: ['chat', 'messages', roomId] })
        }
        isFetching={isMessagesFetching}
      />

      {/* Area pesan */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
      >
        {/* Load more */}
        {hasMorePages && (
          <div className="flex justify-center pb-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5 text-slate-500"
              onClick={loadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <><Loader2 className="h-3 w-3 animate-spin" />Memuat...</>
              ) : (
                <><ChevronUp className="h-3 w-3" />Muat pesan lebih lama</>
              )}
            </Button>
          </div>
        )}

        {/* Empty state */}
        {allMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 py-16">
            <div className="text-3xl">💬</div>
            <p className="text-sm text-center">
              Belum ada pesan. Mulai percakapan di bawah!
            </p>
          </div>
        )}

        {/* Render bubbles */}
        {allMessages.map((msg, index) => {
          const isSelf     = msg.sender.userId === currentUser.userId
          const prevMsg    = allMessages[index - 1]
          const showSender = !prevMsg || prevMsg.sender.userId !== msg.sender.userId

          return (
            <div
              key={msg.chatMessageId}
              className={cn(showSender && index > 0 ? 'mt-4' : 'mt-1')}
            >
              <ChatBubble
                message={msg}
                isSelf={isSelf}
                showSender={showSender}
              />
            </div>
          )
        })}
      </div>

      <ChatInput
        onSend={handleSend}
        isSending={isSending}
        disabled={roomQuery.isError}
      />
    </div>
  )
}
