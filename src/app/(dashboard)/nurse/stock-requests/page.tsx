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

export default function NurseStockRequestsPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<StatusFilter>('ALL')

  const { data, isLoading } = useQuery({
    queryKey: ['stock-requests', 'nurse', page, status, user?.branchId],
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
  })

  function handleStatusChange(v: string) {
    setStatus(v as StatusFilter)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Permintaan Stok Saya"
          description="Riwayat dan status permintaan penambahan stok"
          className="pb-0"
        />
        <Button
          onClick={() => router.push('/nurse/stock-requests/new')}
          className="shrink-0 gap-2"
        >
          <Plus className="h-4 w-4" />
          Buat Request
        </Button>
      </div>

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

        {status !== 'ALL' && (
          <div className="space-y-1">
            <Label className="text-xs text-slate-500 invisible">Reset</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setStatus('ALL'); setPage(1) }}
              className="text-slate-400 hover:text-slate-600 gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        )}
      </div>

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
        </p>
      )}

      {/* Nurse tidak punya aksi approve/reject/fulfill → showActions=false */}
      <StockRequestTable
        data={data?.data ?? []}
        isLoading={isLoading}
        showActions={false}
      />

      {data?.meta && (
        <Pagination meta={data.meta} page={page} onPageChange={setPage} />
      )}
    </div>
  )
}
