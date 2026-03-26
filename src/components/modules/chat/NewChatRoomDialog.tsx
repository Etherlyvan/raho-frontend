'use client'

import { useState } from 'react'
import { useForm }  from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Loader2, Search } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button }   from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}                   from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
}                   from '@/components/ui/form'
import { Input }    from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge }    from '@/components/ui/badge'
import { cn }       from '@/lib/utils'
import { chatApi }  from '@/lib/api/endpoints/chat'
import { userApi }  from '@/lib/api/endpoints/users'
import { getApiErrorMessage } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { ROLE_LABELS } from '@/lib/utils'
import type { StaffUser } from '@/types'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  search: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface NewChatRoomDialogProps {
  /** Dipanggil setelah room berhasil dibuat atau room duplikat ditemukan */
  onSuccess?: (roomId: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Dialog untuk membuat chat room baru.
 *
 * Alur:
 * 1. User mengetik nama/staff code untuk mencari user lain.
 * 2. User memilih satu atau lebih peserta dari daftar hasil pencarian.
 * 3. Klik "Mulai Chat" → POST /chatrooms.
 * 4. BE mengembalikan room yang sudah ada jika participants sama persis
 *    (deduplication logic ada di BE).
 */
export function NewChatRoomDialog({ onSuccess }: NewChatRoomDialogProps) {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)

  const [open, setOpen]             = useState(false)
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState<StaffUser[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { search: '' },
  })

  // ── Cari user lain (kecuali diri sendiri) ─────────────────────────────
  const { data: searchResult, isLoading: isSearching } = useQuery({
    queryKey: ['users', 'chat-search', search],
    queryFn: async () => {
      if (!search.trim()) return []
      const res = await userApi.list({ search, limit: 20 })
      return (res.data.data as StaffUser[]).filter(
        (u) => u.userId !== currentUser?.userId,
      )
    },
    enabled: search.length >= 2,
    staleTime: 30_000,
  })

  // ── Mutasi: buat chat room ─────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: () =>
      chatApi.createRoom({
        participants: selected.map((u) => u.userId),
      }),
    onSuccess: (res) => {
      const roomId = res.data.data.chatRoomId
      queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] })
      toast.success('Chat room siap digunakan')
      setOpen(false)
      resetState()
      onSuccess?.(roomId)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal membuat chat room')),
  })

  function resetState() {
    setSearch('')
    setSelected([])
    form.reset()
  }

  function toggleUser(user: StaffUser) {
    setSelected((prev) =>
      prev.some((u) => u.userId === user.userId)
        ? prev.filter((u) => u.userId !== user.userId)
        : [...prev, user],
    )
  }

  function isSelected(userId: string) {
    return selected.some((u) => u.userId === userId)
  }

  const users = searchResult ?? []

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetState() }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Chat Baru
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mulai Chat Baru</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Pencarian user */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Cari nama atau kode staff..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Chip user yang dipilih */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((u) => (
                <Badge
                  key={u.userId}
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/40 hover:text-red-700"
                  onClick={() => toggleUser(u)}
                >
                  {u.profile?.fullName ?? u.staffCode ?? u.email}
                  <span className="text-slate-400">×</span>
                </Badge>
              ))}
            </div>
          )}

          {/* Hasil pencarian */}
          {search.length >= 2 && (
            <ScrollArea className="h-52 rounded-lg border border-slate-200 dark:border-slate-700">
              {isSearching ? (
                <div className="flex items-center justify-center h-full gap-2 text-slate-400 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mencari...
                </div>
              ) : users.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                  Tidak ada pengguna ditemukan
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((user) => {
                    const name     = user.profile?.fullName ?? user.staffCode ?? user.email
                    const initials = name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
                    const selected = isSelected(user.userId)

                    return (
                      <button
                        key={user.userId}
                        type="button"
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                          'hover:bg-slate-50 dark:hover:bg-slate-800/60',
                          selected && 'bg-blue-50 dark:bg-blue-950/20',
                        )}
                        onClick={() => toggleUser(user)}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs bg-slate-200 dark:bg-slate-700">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm truncate',
                            selected
                              ? 'font-semibold text-blue-700 dark:text-blue-400'
                              : 'font-medium text-slate-800 dark:text-slate-200',
                          )}>
                            {name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {ROLE_LABELS[user.role.name]} {user.branch ? `· ${user.branch.name}` : ''}
                          </p>
                        </div>
                        {selected && (
                          <span className="shrink-0 text-xs font-semibold text-blue-600 dark:text-blue-400">
                            ✓
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          )}

          {/* Tombol aksi */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setOpen(false); resetState() }}
            >
              Batal
            </Button>
            <Button
              size="sm"
              disabled={selected.length === 0 || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Membuat...
                </>
              ) : (
                `Mulai Chat (${selected.length} peserta)`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
