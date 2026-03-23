'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { EncounterTable } from '@/components/modules/encounter/EncounterTable'
import { encounterApi } from '@/lib/api/endpoints/encounters'
import { useAuthStore } from '@/store/auth.store'
import type { EncounterStatus, EncounterType } from '@/types'

type TypeFilter = EncounterType | 'ALL'
type StatusFilter = EncounterStatus | 'ALL'

export default function AdminEncountersPage() {
  const { user } = useAuthStore()
  const router = useRouter()

  const [page, setPage] = useState(1)
  const [type, setType] = useState<TypeFilter>('ALL')
  const [status, setStatus] = useState<StatusFilter>('ALL')

  const { data, isLoading } = useQuery({
    queryKey: ['encounters', page, type, status, user?.branchId],
    queryFn: async () => {
      const res = await encounterApi.list({
        page,
        limit: 15,
        branchId: user?.branchId ?? undefined,
        type: type !== 'ALL' ? type : undefined,
        status: status !== 'ALL' ? status : undefined,
      })
      return res.data
    },
  })

  function handleTypeChange(v: string) {
    setType(v as TypeFilter)
    setPage(1)
  }

  function handleStatusChange(v: string) {
    setStatus(v as StatusFilter)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Encounter"
        description="Manajemen encounter konsultasi dan treatment pasien"
      >
        <Button onClick={() => router.push('/admin/encounters/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Encounter
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Tipe</SelectItem>
            <SelectItem value="CONSULTATION">Konsultasi</SelectItem>
            <SelectItem value="TREATMENT">Treatment</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="PLANNED">Dijadwalkan</SelectItem>
            <SelectItem value="ONGOING">Berlangsung</SelectItem>
            <SelectItem value="COMPLETED">Selesai</SelectItem>
            <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <EncounterTable
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
