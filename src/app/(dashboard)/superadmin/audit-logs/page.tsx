'use client'

import { useState, useCallback }  from 'react'
import { useQuery }               from '@tanstack/react-query'
import { ShieldCheck }            from 'lucide-react'

import { PageHeader }             from '@/components/shared/PageHeader'
import { Pagination }             from '@/components/shared/Pagination'
import { AuditLogTable }          from '@/components/modules/audit-log/AuditLogTable'
import { AuditLogDetailDrawer }   from '@/components/modules/audit-log/AuditLogDetailDrawer'
import { AuditLogFilterBar }      from '@/components/modules/audit-log/AuditLogFilterBar'
import { auditLogsApi }           from '@/lib/api/endpoints/auditLogs'
import type { AuditLog, AuditLogListParams } from '@/types'

const DEFAULT_LIMIT = 50

export default function AuditLogsPage() {
  const [params, setParams]     = useState<AuditLogListParams>({ limit: DEFAULT_LIMIT })
  const [page, setPage]         = useState(1)
  const [selected, setSelected] = useState<AuditLog | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', params, page],
    queryFn:  async () => {
      const res = await auditLogsApi.list({ ...params, page, limit: DEFAULT_LIMIT })
      return res.data
    },
    staleTime: 30_000,
  })

  const handleFilter = useCallback((newParams: AuditLogListParams) => {
    setParams({ ...newParams, limit: DEFAULT_LIMIT })
    setPage(1)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        </div>
        <PageHeader
          title="Audit Log"
          description="Rekam jejak seluruh aktivitas sistem secara kronologis."
        />
      </div>

      <AuditLogFilterBar onFilter={handleFilter} isLoading={isLoading} />

      <AuditLogTable
        data={data?.data ?? []}
        isLoading={isLoading}
        onRowClick={setSelected}
      />

      {data?.meta && (
        <Pagination
          meta={data.meta}
          page={page}
          onPageChange={setPage}
        />
      )}

      <AuditLogDetailDrawer
        log={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
