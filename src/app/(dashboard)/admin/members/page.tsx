'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { MemberTable } from '@/components/modules/member/MemberTable'
import { memberApi } from '@/lib/api/endpoints/members'
import type { MemberStatus } from '@/types'

type StatusFilter = MemberStatus | 'ALL'

export default function AdminMembersPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('ALL')

  const { data, isLoading } = useQuery({
    queryKey: ['members', page, search, status],
    queryFn: async () => {
      const res = await memberApi.list({
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: status !== 'ALL' ? status : undefined,
      })
      return res.data
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Manajemen Pasien"
          description="Kelola data pasien cabang"
          className="pb-0"
        />
        <Button
          onClick={() => router.push('/admin/members/new')}
          className="shrink-0 gap-2"
        >
          <Plus className="h-4 w-4" />
          Daftarkan Pasien
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Cari nama, No. Pasien, atau NIK..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as StatusFilter)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="ACTIVE">Aktif</SelectItem>
            <SelectItem value="INACTIVE">Nonaktif</SelectItem>
            <SelectItem value="LEAD">Lead</SelectItem>
          </SelectContent>
        </Select>
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
          pasien
        </p>
      )}

      <MemberTable data={data?.data ?? []} isLoading={isLoading} />

      {data?.meta && (
        <Pagination meta={data.meta} page={page} onPageChange={setPage} />
      )}
    </div>
  )
}
