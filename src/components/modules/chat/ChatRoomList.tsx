'use client'

import Link        from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Users } from 'lucide-react'

import { Skeleton }  from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn, formatDateTime } from '@/lib/utils'
import { useChatRooms }       from '@/hooks/useChat'
import { useAuthStore }       from '@/store/auth.store'
import type { ChatRoom }      from '@/types'

// ─── Helper: bangun label room dari participants ───────────────────────────────

/**
 * Karena ChatRoom.participants hanya menyimpan array userId (string),
 * label room ditampilkan sebagai "Chat Room" + potongan chatRoomId.
 * Untuk UX lebih baik, label bisa diupgrade ke nama peserta lain
 * jika BE menyertakan data user di future sprint.
 */
function getRoomLabel(room: ChatRoom, currentUserId: string): string {
  const others = room.participants.filter((id) => id !== currentUserId)
  if (others.length === 0) return 'Room (hanya Anda)'
  if (others.length === 1) return `Chat · ${room.chatRoomId.slice(0, 8)}`
  return `Grup · ${others.length + 1} peserta`
}

// ─── Sub-component: satu item room di sidebar ────────────────────────────────

interface RoomItemProps {
  room:          ChatRoom
  currentUserId: string
  isActive:      boolean
}

function RoomItem({ room, currentUserId, isActive }: RoomItemProps) {
  const label       = getRoomLabel(room, currentUserId)
  const lastMsg     = room.lastMessage
  const initials    = label.slice(0, 2).toUpperCase()
  const otherCount  = room.participants.length

  return (
    <Link
      href={`/dashboard/shared/chat/${room.chatRoomId}`}
      className={cn(
        'flex items-start gap-3 px-4 py-3.5 transition-colors',
        'border-b border-slate-100 dark:border-slate-800 last:border-0',
        'hover:bg-slate-50 dark:hover:bg-slate-800/60',
        isActive && 'bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-500',
      )}
    >
      {/* Avatar */}
      <Avatar className="h-9 w-9 shrink-0 mt-0.5">
        <AvatarFallback className="text-xs font-semibold bg-slate-200 dark:bg-slate-700">
          {otherCount > 2
            ? <Users className="h-4 w-4" />
            : initials
          }
        </AvatarFallback>
      </Avatar>

      {/* Konten */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-1">
          <p className={cn(
            'text-sm truncate',
            isActive
              ? 'font-semibold text-blue-700 dark:text-blue-400'
              : 'font-medium text-slate-800 dark:text-slate-200',
          )}>
            {label}
          </p>
          {lastMsg && (
            <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
              {formatDateTime(lastMsg.createdAt)}
            </span>
          )}
        </div>

        {lastMsg ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {lastMsg.sender.userId === currentUserId ? (
              <span className="text-slate-400">Anda: </span>
            ) : null}
            {lastMsg.content ?? '📎 File'}
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic mt-0.5">Belum ada pesan</p>
        )}
      </div>
    </Link>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ChatRoomListSkeleton() {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-4">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Sidebar/panel daftar chat room.
 * Ditampilkan di halaman /shared/chat (list) maupun sebagai panel kiri
 * di layout split-view jika diperlukan di masa mendatang.
 */
export function ChatRoomList() {
  const pathname    = usePathname()
  const currentUser = useAuthStore((s) => s.user)
  const { data: rooms, isLoading } = useChatRooms()

  if (!currentUser) return null

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
        <MessageSquare className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Percakapan
        </span>
        {rooms && rooms.length > 0 && (
          <span className="ml-auto text-xs text-slate-400">
            {rooms.length} room
          </span>
        )}
      </div>

      {/* Daftar room */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <ChatRoomListSkeleton />
        ) : !rooms || rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
            <MessageSquare className="h-8 w-8" />
            <p className="text-sm text-center px-4">
              Belum ada percakapan. Mulai chat baru dengan kolega Anda.
            </p>
          </div>
        ) : (
          <div>
            {rooms.map((room) => (
              <RoomItem
                key={room.chatRoomId}
                room={room}
                currentUserId={currentUser.userId}
                isActive={pathname.includes(room.chatRoomId)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
