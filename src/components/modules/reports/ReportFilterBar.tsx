'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Button }     from '@/components/ui/button'
import { Input }      from '@/components/ui/input'
import { Label }      from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
}                     from '@/components/ui/select'
import { branchApi }  from '@/lib/api/endpoints/branches'
import { useAuthStore } from '@/store/auth.store'
import type { ReportBaseParams, ReportGroupBy } from '@/types'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  dateFrom: z.string().optional(),
  dateTo:   z.string().optional(),
  branchId: z.string().optional(),
  groupBy:  z.enum(['day', 'week', 'month']).default('month'),
})

type FilterValues = z.infer<typeof schema>

// ─── Constants ────────────────────────────────────────────────────────────────

const GROUP_BY_OPTIONS: { value: ReportGroupBy; label: string }[] = [
  { value: 'day',   label: 'Harian'  },
  { value: 'week',  label: 'Mingguan' },
  { value: 'month', label: 'Bulanan'  },
]

// ─── Helpers: default date range ─────────────────────────────────────────────

function getDefaultDateFrom(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 3)
  return d.toISOString().split('T')[0]
}

function getDefaultDateTo(): string {
  return new Date().toISOString().split('T')[0]
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReportFilterBarProps {
  /** Dipanggil setiap filter berubah (dengan debounce via onSubmit) */
  onFilter:        (params: ReportBaseParams) => void
  /** Sembunyikan filter cabang untuk ADMIN (hanya bisa lihat cabangnya sendiri) */
  hideBranchFilter?: boolean
  /** Sembunyikan groupBy (misal untuk halaman inventory yang tidak butuh groupBy) */
  hideGroupBy?:    boolean
  isLoading?:      boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Filter bar terpusat untuk semua halaman laporan.
 *
 * Tersedia field:
 * - dateFrom / dateTo  → date picker native HTML (input type="date")
 * - branchId           → dropdown cabang (disembunyikan untuk ADMIN)
 * - groupBy            → day / week / month (untuk grafik)
 *
 * Memanggil `onFilter` setiap kali form di-submit (bukan real-time)
 * untuk menghindari request berlebihan.
 */
export function ReportFilterBar({
  onFilter,
  hideBranchFilter = false,
  hideGroupBy      = false,
  isLoading,
}: ReportFilterBarProps) {
  const user = useAuthStore((s) => s.user)

  const defaultValues: FilterValues = {
    dateFrom: getDefaultDateFrom(),
    dateTo:   getDefaultDateTo(),
    branchId: '',
    groupBy:  'month',
  }

  const { control, handleSubmit, reset, register } = useForm<FilterValues>({
    resolver:      zodResolver(schema),
    defaultValues,
  })

  // ── Ambil daftar cabang untuk dropdown ────────────────────────────────────
  const { data: branches } = useQuery({
    queryKey: ['branches', 'all'],
    queryFn:  async () => {
      const res = await branchApi.list({ limit: 100, isActive: true })
      return res.data.data
    },
    enabled: !hideBranchFilter,
    staleTime: 5 * 60_000,
  })

  // Emit filter default saat mount
  useEffect(() => {
    onFilter({
      dateFrom: defaultValues.dateFrom,
      dateTo:   defaultValues.dateTo,
      groupBy:  defaultValues.groupBy,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onSubmit(values: FilterValues) {
    onFilter({
      dateFrom: values.dateFrom || undefined,
      dateTo:   values.dateTo   || undefined,
      branchId: values.branchId || undefined,
      groupBy:  values.groupBy,
    })
  }

  function handleReset() {
    reset(defaultValues)
    onFilter({
      dateFrom: defaultValues.dateFrom,
      dateTo:   defaultValues.dateTo,
      groupBy:  defaultValues.groupBy,
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-5 py-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Filter Laporan
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date From */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Dari Tanggal</Label>
          <Input
            type="date"
            {...register('dateFrom')}
            className="text-sm h-9"
          />
        </div>

        {/* Date To */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Sampai Tanggal</Label>
          <Input
            type="date"
            {...register('dateTo')}
            className="text-sm h-9"
          />
        </div>

        {/* Branch Filter */}
        {!hideBranchFilter && (
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Cabang</Label>
            <Controller
              name="branchId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Semua Cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Cabang</SelectItem>
                    {branches?.map((b) => (
                      <SelectItem key={b.branchId} value={b.branchId}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        {/* Group By */}
        {!hideGroupBy && (
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Kelompokkan Per</Label>
            <Controller
              name="groupBy"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_BY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}
      </div>

      {/* Actions */}
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
          className="h-8 text-xs"
          disabled={isLoading}
        >
          {isLoading ? 'Memuat...' : 'Terapkan Filter'}
        </Button>
      </div>
    </form>
  )
}
