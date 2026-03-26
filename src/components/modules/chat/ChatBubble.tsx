'use client'

import { Download } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn, formatDateTime }     from '@/lib/utils'
import type { ChatMessage }       from '@/types'

// ─── Constants ───────────────────────────────────────────────────────────────

/** Tipe file yang dapat dirender sebagai gambar inline */
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// ─── Helper: attachment renderer ─────────────────────────────────────────────

interface AttachmentProps {
  fileUrl:  string
  fileType: string | null
  isSelf:   boolean
}

function MessageAttachment({ fileUrl, fileType, isSelf }: AttachmentProps) {
  const isImage = fileType && IMAGE_TYPES.includes(fileType)

  if (isImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fileUrl}
        alt="Lampiran"
        className="max-w-[240px] rounded-lg border border-slate-200 dark:border-slate-700 mt-1"
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
      />
    )
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 mt-1 text-xs underline underline-offset-2',
        isSelf
          ? 'text-blue-100 hover:text-white'
          : 'text-blue-600 dark:text-blue-400 hover:text-blue-800',
      )}
    >
      <Download className="h-3 w-3" />
      Unduh lampiran
    </a>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatBubbleProps {
  message:      ChatMessage
  isSelf:       boolean
  /** Tampilkan avatar + nama pengirim (false untuk pesan berurutan dari sender sama) */
  showSender:   boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Satu bubble pesan dalam percakapan.
 *
 * - `isSelf = true`  → bubble kanan (biru), avatar disembunyikan.
 * - `isSelf = false` → bubble kiri (abu), avatar + nama pengirim ditampilkan
 *                      hanya jika `showSender = true`.
 * - Mendukung pesan teks, gambar inline, dan file attachment.
 * - Timestamp ditampilkan di bawah bubble.
 */
export function ChatBubble({ message, isSelf, showSender }: ChatBubbleProps) {
  const senderName =
    message.sender.profile?.fullName ??
    message.sender.staffCode ??
    'Pengguna'

  const initials = senderName
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className={cn(
        'flex items-end gap-2 w-full',
        isSelf ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar pengirim — hanya untuk pesan orang lain, dan hanya saat showSender */}
      {!isSelf ? (
        <div className="w-7 shrink-0 mb-0.5">
          {showSender && (
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-[10px] font-semibold bg-slate-200 dark:bg-slate-700">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ) : (
        // Spacer agar bubble self tidak mentok ke kanan
        <div className="w-7 shrink-0" />
      )}

      {/* Bubble + metadata */}
      <div
        className={cn(
          'flex flex-col max-w-[72%] sm:max-w-[60%]',
          isSelf ? 'items-end' : 'items-start',
        )}
      >
        {/* Nama pengirim — hanya untuk orang lain + showSender */}
        {!isSelf && showSender && (
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 px-1">
            {senderName}
          </p>
        )}

        {/* Bubble konten */}
        <div
          className={cn(
            'relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words',
            isSelf
              ? [
                  'bg-blue-600 text-white',
                  'rounded-br-sm',
                  'dark:bg-blue-700',
                ]
              : [
                  'bg-white text-slate-800 border border-slate-200',
                  'rounded-bl-sm',
                  'dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
                ],
          )}
        >
          {/* Teks pesan — preserve newline */}
          {message.content && (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Attachment */}
          {message.fileUrl && (
            <MessageAttachment
              fileUrl={message.fileUrl}
              fileType={message.fileType}
              isSelf={isSelf}
            />
          )}
        </div>

        {/* Timestamp */}
        <p
          className={cn(
            'text-[10px] mt-1 px-1 text-slate-400 dark:text-slate-500',
            isSelf ? 'text-right' : 'text-left',
          )}
        >
          {formatDateTime(message.createdAt)}
        </p>
      </div>
    </div>
  )
}
