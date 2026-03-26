'use client'

import { useRouter }          from 'next/navigation'
import { PageHeader }         from '@/components/shared/PageHeader'
import { ChatRoomList }       from '@/components/modules/chat/ChatRoomList'
import { NewChatRoomDialog }  from '@/components/modules/chat/NewChatRoomDialog'

export default function ChatListPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Chat"
          description="Komunikasi internal antar staf klinik."
        />
        <NewChatRoomDialog
          onSuccess={(roomId) =>
            router.push(`/dashboard/shared/chat/${roomId}`)
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[calc(100vh-14rem)]">
        {/* Panel kiri: daftar room */}
        <div className="lg:col-span-1 h-full overflow-hidden">
          <ChatRoomList />
        </div>

        {/* Panel kanan: placeholder instruksi */}
        <div className="hidden lg:flex lg:col-span-2 h-full items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <div className="text-center space-y-2 text-slate-400 px-6">
            <div className="text-4xl">💬</div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Pilih percakapan untuk memulai
            </p>
            <p className="text-xs">
              Atau buat chat baru dengan tombol di atas
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
