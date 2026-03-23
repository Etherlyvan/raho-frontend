'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { StockRequestTable } from '@/components/modules/inventory/StockRequestTable'
import { stockRequestApi } from '@/lib/api/endpoints/stockRequests'
import { useAuthStore } from '@/store/auth.store'
import type { RequestStatus } from '@/types'

type StatusFilter = RequestStatus | 'ALL'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Semua Status' },
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'APPROVED', label: 'Disetujui' },
  { value: 'REJECTED', label: 'Ditolak' },
  { value: 'FULFILLED', label: 'Terpenuhi' },
]

export default function AdminStockRequestsPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<StatusFilter>('PENDING')

  const { data, isLoading } = useQuery({
    queryKey: ['stock-requests', page, status, user?.branchId],
    queryFn: async () => {
      const res = await stockRequestApi.list({
        page,
        limit: 15,
        branchId: user?.branchId ?? undefined,
        status: status !== 'ALL' ? status : undefined,
      })
      return res.data
    },
    enabled: !!user,
    // Auto-refresh setiap 30 detik untuk status PENDING
    refetchInterval: status === 'PENDING' ? 30_000 : false,
  })

  function handleStatusChange(v: string) {
    setStatus(v as StatusFilter)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Permintaan Stok"
          description="Kelola permintaan penambahan stok dari perawat dan staf"
          className="pb-0"
        />
        <Button
          onClick={() => router.push('/admin/stock-requests/new')}
          className="shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Buat Request
        </Button>
      </div>

      {/* Status tabs-like filter */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Status</Label>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {status !== 'PENDING' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatus('PENDING')
              setPage(1)
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Reset ke Pending
          </Button>
        )}
      </div>

      {/* Summary */}
      {data && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Menampilkan{' '}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {data.data.length}
          </span>{' '}
          dari{' '}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {data.meta.total}
          </span>{' '}
          permintaan
          {status !== 'ALL' &&
            ` · ${STATUS_OPTIONS.find((o) => o.value === status)?.label}`}
          {status === 'PENDING' && data.meta.total > 0 && (
            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-amber-500 text-white text-[10px] font-bold px-1.5 leading-none">
              {data.meta.total}
            </span>
          )}
        </p>
      )}

      <StockRequestTable
        data={data?.data ?? []}
        isLoading={isLoading}
        showActions
      />

      {data?.meta && (
        <Pagination meta={data.meta} page={page} onPageChange={setPage} />
      )}
    </div>
  )
}
