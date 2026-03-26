'use client'

import { useState }          from 'react'
import { useQuery }          from '@tanstack/react-query'

import { PageHeader }           from '@/components/shared/PageHeader'
import { ReportFilterBar }      from '@/components/modules/reports/ReportFilterBar'
import { InventoryUsageTable }  from '@/components/modules/reports/InventoryUsageTable'
import { reportsApi }           from '@/lib/api/endpoints/reports'
import type { ReportBaseParams } from '@/types'

export default function AdminReportsPage() {
  const [params, setParams] = useState<ReportBaseParams>({})

  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'inventory', params],
    queryFn:  async () => {
      const res = await reportsApi.inventory(params)
      return res.data.data
    },
    staleTime: 60_000,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Inventori"
        description="Pantau penggunaan dan mutasi stok cabang Anda."
      />

      {/*
        hideBranchFilter: ADMIN tidak bisa pilih cabang lain.
        hideGroupBy: laporan inventory tidak perlu groupBy (tidak ada chart temporal).
      */}
      <ReportFilterBar
        onFilter={setParams}
        hideBranchFilter
        hideGroupBy
        isLoading={isLoading}
      />

      <InventoryUsageTable data={data} isLoading={isLoading} />
    </div>
  )
}
