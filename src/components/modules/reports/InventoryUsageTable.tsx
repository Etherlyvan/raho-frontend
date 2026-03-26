'use client'

import { useState }       from 'react'
import { AlertTriangle }  from 'lucide-react'
import { Badge }          from '@/components/ui/badge'
import { Skeleton }       from '@/components/ui/skeleton'
import { Input }          from '@/components/ui/input'
import { cn }             from '@/lib/utils'
import type { InventoryReport } from '@/types'

interface InventoryUsageTableProps {
  data:      InventoryReport | undefined
  isLoading: boolean
}

/**
 * Tabel 10 item teratas berdasarkan `totalUsed`.
 * Baris berwarna amber jika `isCritical = true`.
 */
export function InventoryUsageTable({ data, isLoading }: InventoryUsageTableProps) {
  const [search, setSearch] = useState('')

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!data) return null

  const { summary, data: items } = data

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Item',      value: summary.totalItems },
          { label: 'Item Kritis',     value: summary.criticalItems,  accent: summary.criticalItems > 0 },
          { label: 'Total Pemakaian', value: summary.totalUsage },
        ].map((card) => (
          <div
            key={card.label}
            className={cn(
              'rounded-xl border px-4 py-3.5 bg-white dark:bg-slate-950',
              card.accent
                ? 'border-amber-300 dark:border-amber-700'
                : 'border-slate-200 dark:border-slate-700',
            )}
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className={cn(
              'text-xl font-bold mt-1',
              card.accent ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white',
            )}>
              {card.value.toLocaleString('id-ID')}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Detail Penggunaan Stok
          </p>
          <Input
            placeholder="Cari nama atau kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs w-52"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                {['Nama Item', 'Kategori', 'Satuan', 'Total Terpakai', 'Stok Saat Ini', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    {search ? 'Tidak ada item yang cocok dengan pencarian.' : 'Tidak ada data inventori.'}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.inventoryItemId}
                    className={cn(
                      'border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors',
                      item.isCritical && 'bg-amber-50/60 dark:bg-amber-950/20',
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.isCritical && (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        )}
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{item.category}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{item.unit}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                      {item.totalUsed.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'font-semibold',
                          item.isCritical
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400',
                        )}>
                          {item.currentStock.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-slate-400">/ {item.minThreshold}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.isCritical ? (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0 text-[10px]">
                          Kritis
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0 text-[10px]">
                          Normal
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
