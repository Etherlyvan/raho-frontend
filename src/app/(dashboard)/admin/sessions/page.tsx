'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { SessionTable } from '@/components/modules/session/SessionTable'
import { sessionApi } from '@/lib/api/endpoints/sessions'
import { useAuthStore } from '@/store/auth.store'
import type { SessionStatus } from '@/types'

type StatusFilter = SessionStatus | 'ALL'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Semua Status' },
  { value: 'PLANNED', label: 'Dijadwalkan' },
  { value: 'IN_PROGRESS', label: 'Berlangsung' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'POSTPONED', label: 'Ditunda' },
]

export default function AdminSessionsPage() {
  // ✅ selector — user bertipe AppUser | null
  const user = useAuthStore((state) => state.user)

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['sessions', page, status, dateFrom, dateTo, user?.branchId],
    queryFn: async () => {
      const res = await sessionApi.list({
        page,
        limit: 15,
        branchId: user?.branchId ?? undefined,
        status: status !== 'ALL' ? status : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
      return res.data
    },
  })

  function handleStatusChange(v: string) {
    setStatus(v as StatusFilter)
    setPage(1)
  }

  function clearDateFilter() {
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const hasDateFilter = dateFrom || dateTo

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sesi Treatment"
        description="Daftar semua sesi treatment pasien"
      />

      {/* Filters */}
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

        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Dari Tanggal</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className="w-40"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Sampai Tanggal</Label>
          <Input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className="w-40"
          />
        </div>

        {hasDateFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearDateFilter}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Reset Tanggal
          </Button>
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
          sesi
          {status !== 'ALL' && ` · filter: ${STATUS_OPTIONS.find((o) => o.value === status)?.label}`}
        </p>
      )}

      <SessionTable
        data={data?.data ?? []}
        isLoading={isLoading}
        basePath="admin"
      />

      {data?.meta && (
        <Pagination meta={data.meta} page={page} onPageChange={setPage} />
      )}
    </div>
  )
}
