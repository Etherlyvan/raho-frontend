'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Skeleton }  from '@/components/ui/skeleton'
import { cn }        from '@/lib/utils'
import type { TreatmentReport } from '@/types'

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
      <div
        className={cn('h-1.5 rounded-full transition-all', color)}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  )
}

// ─── Stat row ─────────────────────────────────────────────────────────────────

function StatRow({
  label,
  value,
  sub,
  progressValue,
  progressColor,
}: {
  label:          string
  value:          string | number
  sub?:           string
  progressValue?: number
  progressColor?: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</span>
      </div>
      {progressValue !== undefined && progressColor && (
        <ProgressBar value={progressValue} color={progressColor} />
      )}
      {sub && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500">{sub}</p>
      )}
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TreatmentSummaryCardProps {
  data:      TreatmentReport | undefined
  isLoading: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Ringkasan laporan treatment.
 *
 * - Summary: total sesi, completion rate, postponed.
 * - Bar chart: sesi selesai vs ditunda per periode.
 */
export function TreatmentSummaryCard({ data, isLoading }: TreatmentSummaryCardProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (!data) return null

  const { summary, data: chartData } = data

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-5 py-4 space-y-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Ringkasan Treatment
        </p>
        <StatRow
          label="Total Sesi"
          value={summary.totalSessions.toLocaleString('id-ID')}
        />
        <StatRow
          label="Sesi Selesai"
          value={`${summary.completedSessions.toLocaleString('id-ID')} (${summary.completionRate.toFixed(1)}%)`}
          progressValue={summary.completionRate}
          progressColor="bg-emerald-500"
        />
        <StatRow
          label="Sesi Ditunda"
          value={summary.postponedSessions.toLocaleString('id-ID')}
          progressValue={
            summary.totalSessions > 0
              ? (summary.postponedSessions / summary.totalSessions) * 100
              : 0
          }
          progressColor="bg-amber-400"
        />
        <StatRow
          label="Total Encounter"
          value={summary.totalEncounters.toLocaleString('id-ID')}
        />
      </div>

      {/* Bar chart sesi per periode */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 pt-5 pb-3">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Sesi per Periode
        </p>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
            Tidak ada data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="period" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={32} />
              <Tooltip
                formatter={(v: number, name: string) => [
                  v,
                  name === 'completedSessions' ? 'Selesai' : 'Ditunda',
                ]}
              />
              <Bar dataKey="completedSessions" name="Selesai" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={32} stackId="a" />
              <Bar dataKey="postponedSessions" name="Ditunda"  fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={32} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
