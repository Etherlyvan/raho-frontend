'use client'

import { useState }   from 'react'
import { Input }      from '@/components/ui/input'
import { Badge }      from '@/components/ui/badge'
import { Skeleton }   from '@/components/ui/skeleton'
import { ROLE_LABELS } from '@/lib/utils'
import type { StaffKpiReport } from '@/types'

interface StaffKpiTableProps {
  data:      StaffKpiReport | undefined
  isLoading: boolean
}

/**
 * Tabel KPI Staf (dokter & perawat).
 *
 * Kolom: Nama, Role, Total Sesi, Selesai, Evaluasi/EMR, Rata-rata/hari.
 * Diurutkan by completedSessions DESC secara default.
 */
export function StaffKpiTable({ data, isLoading }: StaffKpiTableProps) {
  const [search, setSearch] = useState('')

  if (isLoading) return <Skeleton className="h-72 rounded-xl" />
  if (!data) return null

  const filtered = [...data.data]
    .filter((s) =>
      (s.fullName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (s.staffCode ?? '').toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => b.completedSessions - a.completedSessions)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">KPI Staf</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {data.period.dateFrom} — {data.period.dateTo}
          </p>
        </div>
        <Input
          placeholder="Cari nama atau kode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-xs w-48"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              {[
                'Staf', 'Role', 'Total Sesi',
                'Sesi Selesai', 'Evaluasi / EMR', 'Rata-rata / Hari',
              ].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                  Tidak ada data staf pada periode ini.
                </td>
              </tr>
            ) : (
              filtered.map((staff) => (
                <tr
                  key={staff.userId}
                  className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {staff.fullName ?? '-'}
                    </p>
                    {staff.staffCode && (
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {staff.staffCode}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-0 text-[10px]">
                      {ROLE_LABELS[staff.role as keyof typeof ROLE_LABELS] ?? staff.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {staff.totalSessions.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {staff.completedSessions.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {staff.evaluationCount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {staff.avgSessionsPerDay.toFixed(1)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
