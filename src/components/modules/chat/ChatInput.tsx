'use client'

import {
  useRef,
  useState,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react'
import { Send, Paperclip, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn }       from '@/lib/utils'
import type { SendMessagePayload } from '@/types'

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_MB  = 10
const ALLOWED_MIME      = [
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatInputProps {
  onSend:    (payload: SendMessagePayload) => void
  isSending: boolean
  disabled?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Input area percakapan.
 *
 * Perilaku keyboard:
 * - Enter          → kirim pesan
 * - Shift + Enter  → tambah baris baru (newline)
 *
 * Attachment (opsional):
 * - Klik ikon paperclip → pilih file (gambar / PDF / DOCX).
 * - File dikonversi ke base64 data URL dan dikirim via `fileUrl`.
 * - File melebihi MAX_FILE_SIZE_MB ditolak di sisi klien.
 * - Preview nama file ditampilkan sebelum mengirim; bisa dihapus.
 *
 * Validasi: minimal ada `content` atau `fileUrl` sebelum bisa dikirim.
 */
export function ChatInput({ onSend, isSending, disabled }: ChatInputProps) {
  const [text, setText]           = useState('')
  const [filePreview, setFilePreview] = useState<{
    name:     string
    dataUrl:  string
    mimeType: string
  } | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Auto-resize textarea ──────────────────────────────────────────────────
  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  // ── Handler: perubahan teks ───────────────────────────────────────────────
  function handleTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    autoResize()
  }

  // ── Handler: keyboard ────────────────────────────────────────────────────
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Handler: pilih file ───────────────────────────────────────────────────
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFileError(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_MIME.includes(file.type)) {
      setFileError('Format file tidak didukung. Gunakan JPG, PNG, WebP, PDF, atau DOCX.')
      return
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`Ukuran file maksimal ${MAX_FILE_SIZE_MB} MB.`)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setFilePreview({
        name:     file.name,
        dataUrl:  reader.result as string,
        mimeType: file.type,
      })
    }
    reader.readAsDataURL(file)

    // Reset input agar file yang sama bisa dipilih ulang
    e.target.value = ''
  }

  // ── Handler: hapus file yang dipilih ─────────────────────────────────────
  function clearFile() {
    setFilePreview(null)
    setFileError(null)
  }

  // ── Handler: kirim pesan ──────────────────────────────────────────────────
  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed && !filePreview) return
    if (isSending || disabled) return

    const payload: SendMessagePayload = {
      ...(trimmed && { content: trimmed }),
      ...(filePreview && {
        fileUrl:  filePreview.dataUrl,
        fileType: filePreview.mimeType,
      }),
    }

    onSend(payload)
    setText('')
    clearFile()

    // Reset tinggi textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Fokus kembali ke textarea setelah kirim
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  const canSend = (text.trim().length > 0 || !!filePreview) && !isSending && !disabled

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 space-y-2">
      {/* Preview file terpilih */}
      {filePreview && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <ImageIcon className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
            {filePreview.name}
          </span>
          <button
            type="button"
            onClick={clearFile}
            className="shrink-0 text-slate-400 hover:text-red-500 transition-colors"
            aria-label="Hapus file"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Pesan error file */}
      {fileError && (
        <p className="text-xs text-red-500 dark:text-red-400 px-1">{fileError}</p>
      )}

      {/* Area input utama */}
      <div className="flex items-end gap-2">
        {/* Tombol lampiran file */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              disabled={disabled || isSending}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Lampirkan file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Lampirkan file (maks. {MAX_FILE_SIZE_MB} MB)</p>
          </TooltipContent>
        </Tooltip>

        {/* Input file tersembunyi */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_MIME.join(',')}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Ketik pesan... (Enter untuk kirim, Shift+Enter untuk baris baru)"
          disabled={disabled || isSending}
          rows={1}
          className={cn(
            'flex-1 resize-none min-h-[40px] max-h-40 py-2.5 text-sm',
            'border-slate-200 dark:border-slate-700',
            'focus-visible:ring-blue-500',
            'overflow-y-auto',
          )}
        />

        {/* Tombol kirim */}
        <Button
          type="button"
          size="icon"
          className={cn(
            'h-9 w-9 shrink-0 transition-all',
            canSend
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed',
          )}
          disabled={!canSend}
          onClick={handleSend}
          aria-label="Kirim pesan"
        >
          {isSending
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />
          }
        </Button>
      </div>

      {/* Hint keyboard */}
      <p className="text-[10px] text-slate-400 dark:text-slate-500 text-right px-1 select-none">
        Enter untuk kirim · Shift+Enter untuk baris baru
      </p>
    </div>
  )
}
