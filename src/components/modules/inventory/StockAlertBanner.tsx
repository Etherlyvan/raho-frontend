'use client'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { inventoryApi } from '@/lib/api/endpoints/inventory'
import { useAuthStore } from '@/store/auth.store'

interface Props {
  basePath?: string
}

export function StockAlertBanner({ basePath = 'admin' }: Props) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const { data } = useQuery({
    queryKey: ['inventory', 'alerts'],
    queryFn: async () => {
      const res = await inventoryApi.alerts()
      return res.data.data
    },
    // Poll setiap 5 menit
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
    enabled: !!user,
  })

  const count = data?.total ?? 0
  if (count === 0) return null

  return (
    <button
      onClick={() => router.push(`/${basePath}/inventory/alerts`)}
      className="w-full flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-3 py-2 text-left hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors"
    >
      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 animate-pulse" />
      <span className="text-xs font-medium text-red-700 dark:text-red-400 flex-1">
        {count} item stok kritis
      </span>
      <span className="text-xs text-red-500 dark:text-red-400">Lihat →</span>
    </button>
  )
}

// ── Badge kecil untuk sidebar menu item ──────────────────────────────────────

export function StockAlertBadge() {
  const user = useAuthStore((state) => state.user)

  const { data } = useQuery({
    queryKey: ['inventory', 'alerts'],
    queryFn: async () => {
      const res = await inventoryApi.alerts()
      return res.data.data
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
    enabled: !!user,
  })

  const count = data?.total ?? 0
  if (count === 0) return null

  return (
    <span className="ml-auto inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
      {count > 99 ? '99+' : count}
    </span>
  )
}
