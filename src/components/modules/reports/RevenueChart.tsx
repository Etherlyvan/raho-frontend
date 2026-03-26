'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatRupiah } from '@/lib/utils'
import type { RevenueReport } from '@/types'

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 shadow-lg text-xs space-y-1">
      <p className="font-semibold text-slate-700 dark:text-slate-300">{label}</p>
      <p className="text-emerald-600 dark:text-emerald-400">
        Revenue: <span className="font-bold">{formatRupiah(payload[0]?.value)}</span>
      </p>
      {payload[1] && (
        <p className="text-slate-500">
          Invoice: <span className="font-medium">{payload[1]?.value}</span>
        </p>
      )}
    </div>
  )
}

// ─── Summary card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label:   string
  value:   string
  sub?:    string
  trend?:  'up' | 'down' | 'neutral'
}

function SummaryCard({ label, value, sub, trend }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3.5">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
        {trend && trend !== 'neutral' && (
          <span className={cn('text-xs font-medium', trend === 'up' ? 'text-emerald-500' : 'text-red-500')}>
            {trend === 'up' ? <TrendingUp className="h-3.5 w-3.5 inline" /> : <TrendingDown className="h-3.5 w-3.5 inline" />}
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface RevenueChartProps {
  data:      RevenueReport | undefined
  isLoading: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Chart utama laporan revenue.
 *
 * - Bar chart Revenue (IDR) + Invoice count per periode.
 * - Tiga summary card di atas: total revenue, total invoice, rata-rata per sesi.
 * - Tooltip custom menampilkan formatRupiah.
 * - Skeleton saat loading.
 */
export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!data) return null

  const { summary, data: chartData } = data

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="Total Revenue"
          value={formatRupiah(summary.totalRevenue)}
          sub={`${summary.totalInvoices} invoice pada periode ini`}
          trend="neutral"
        />
        <SummaryCard
          label="Total Invoice"
          value={summary.totalInvoices.toLocaleString('id-ID')}
          sub="Invoice terbayar (PAID)"
        />
        <SummaryCard
          label="Rata-rata per Sesi"
          value={formatRupiah(summary.averagePerSession)}
          sub="Revenue / total sesi selesai"
        />
      </div>

      {/* Bar Chart */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 pt-5 pb-3">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Revenue per Periode
        </p>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
            Tidak ada data pada periode ini
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v) =>
                  v >= 1_000_000
                    ? `${(v / 1_000_000).toFixed(1)}jt`
                    : `${(v / 1_000).toFixed(0)}rb`
                }
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={56}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="totalRevenue"
                name="Revenue (IDR)"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
