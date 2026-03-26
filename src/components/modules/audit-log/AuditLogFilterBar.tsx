'use client'

import { useForm }        from 'react-hook-form'
import { RotateCcw, Search } from 'lucide-react'

import { Button }  from '@/components/ui/button'
import { Input }   from '@/components/ui/input'
import { Label }   from '@/components/ui/label'
import type { AuditLogListParams } from '@/types'

interface AuditLogFilterBarProps {
  onFilter:   (params: AuditLogListParams) => void
  isLoading?: boolean
}

interface FilterValues {
  userId:   string
  action:   string
  resource: string
  dateFrom: string
  dateTo:   string
}

const DEFAULTS: FilterValues = {
  userId:   '',
  action:   '',
  resource: '',
  dateFrom: '',
  dateTo:   '',
}

/**
 * Filter bar untuk halaman Audit Log.
 *
 * Semua field bersifat opsional — BE menerima `undefined` jika kosong.
 * userId → input staffCode / userId (user mengetik manual)
 * action → misal: CREATE, UPDATE, DELETE, LOGIN
 * resource → misal: MEMBER, ENCOUNTER, INVOICE, SESSION
 */
export function AuditLogFilterBar({ onFilter, isLoading }: AuditLogFilterBarProps) {
  const { register, handleSubmit, reset } = useForm<FilterValues>({
    defaultValues: DEFAULTS,
  })

  function onSubmit(values: FilterValues) {
    onFilter({
      userId:   values.userId   || undefined,
      action:   values.action   || undefined,
      resource: values.resource || undefined,
      dateFrom: values.dateFrom || undefined,
      dateTo:   values.dateTo   || undefined,
    })
  }

  function handleReset() {
    reset(DEFAULTS)
    onFilter({})
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-5 py-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* User ID */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">User ID / Staff Code</Label>
          <Input
            {...register('userId')}
            placeholder="cth: USR-001"
            className="h-9 text-sm"
          />
        </div>

        {/* Action */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Action</Label>
          <Input
            {...register('action')}
            placeholder="cth: CREATE"
            className="h-9 text-sm"
          />
        </div>

        {/* Resource */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Resource</Label>
          <Input
            {...register('resource')}
            placeholder="cth: MEMBER"
            className="h-9 text-sm"
          />
        </div>

        {/* Date From */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Dari Tanggal</Label>
          <Input
            type="date"
            {...register('dateFrom')}
            className="h-9 text-sm"
          />
        </div>

        {/* Date To */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Sampai Tanggal</Label>
          <Input
            type="date"
            {...register('dateTo')}
            className="h-9 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs gap-1.5 text-slate-500"
          onClick={handleReset}
          disabled={isLoading}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
        <Button
          type="submit"
          size="sm"
          className="h-8 text-xs gap-1.5"
          disabled={isLoading}
        >
          <Search className="h-3.5 w-3.5" />
          Cari
        </Button>
      </div>
    </form>
  )
}
