'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { AddStockDialog } from '@/components/modules/inventory/AddStockDialog'
import { StockAlertBanner } from '@/components/modules/inventory/StockAlertBanner'
import { inventoryApi } from '@/lib/api/endpoints/inventory'
import { useAuthStore } from '@/store/auth.store'
import { useDebounce } from '@/hooks/useDebounce'
import type { InventoryCategory, InventoryItem } from '@/types'

type CategoryFilter = InventoryCategory | 'ALL'

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'ALL', label: 'Semua Kategori' },
  { value: 'MEDICINE', label: 'Obat / Farmasi' },
  { value: 'DEVICE', label: 'Alat Medis' },
  { value: 'CONSUMABLE', label: 'Habis Pakai' },
]

const CATEGORY_STYLE: Record<InventoryCategory, string> = {
  MEDICINE:
    'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-0 text-xs',
  DEVICE:
    'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border-0 text-xs',
  CONSUMABLE:
    'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0 text-xs',
}

const CATEGORY_LABEL: Record<InventoryCategory, string> = {
  MEDICINE: 'Obat',
  DEVICE: 'Alat',
  CONSUMABLE: 'Habis Pakai',
}

export default function NurseInventoryPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('ALL')
  const [addStockTarget, setAddStockTarget] = useState<InventoryItem | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: [
      'inventory',
      'nurse',
      page,
      debouncedSearch,
      category,
      user?.branchId,
    ],
    queryFn: async () => {
      const res = await inventoryApi.list({
        page,
        limit: 20,
        branchId: user?.branchId ?? undefined,
        search: debouncedSearch || undefined,
        category: category !== 'ALL' ? category : undefined,
        isActive: true,
      })
      return res.data
    },
    enabled: !!user,
  })

  function handleCategoryChange(v: string) {
    setCategory(v as CategoryFilter)
    setPage(1)
  }

  const hasFilter = search || category !== 'ALL'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Stok Inventori"
          description="Pantau ketersediaan stok dan ajukan permintaan penambahan"
          className="pb-0"
        />
        <Button
          variant="outline"
          onClick={() => router.push('/nurse/stock-requests/new')}
          className="shrink-0 gap-2"
        >
          <Plus className="h-4 w-4" />
          Minta Stok
        </Button>
      </div>

      {/* Stock alert banner */}
      <StockAlertBanner basePath="nurse" />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1 flex-1 min-w-[200px] max-w-xs">
          <Label className="text-xs text-slate-500">Cari Item</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Nama item..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Kategori</Label>
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasFilter && (
          <div className="space-y-1">
            <Label className="text-xs text-slate-500 invisible">Reset</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                setCategory('ALL')
                setPage(1)
              }}
              className="text-slate-400 hover:text-slate-600 gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        )}
      </div>

      {/* Summary */}
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
          item
        </p>
      )}

      {/* Inventory Cards — Nurse pakai card grid, bukan table agar lebih readable */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data.map((item) => {
            const isCritical = item.stock <= item.minThreshold
            const ratio =
              item.minThreshold > 0
                ? Math.min((item.stock / item.minThreshold) * 100, 100)
                : 100

            return (
              <div
                key={item.inventoryItemId}
                className={`rounded-xl border p-4 space-y-3 bg-white dark:bg-slate-900 transition-shadow hover:shadow-md ${
                  isCritical
                    ? 'border-red-200 dark:border-red-800/60'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    {item.location && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {item.location}
                      </p>
                    )}
                  </div>
                  <Badge className={CATEGORY_STYLE[item.category]}>
                    {CATEGORY_LABEL[item.category]}
                  </Badge>
                </div>

                {/* Stok */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Stok</span>
                    <span
                      className={`font-bold tabular-nums ${
                        isCritical
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {item.stock} {item.unit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        isCritical ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Min: {item.minThreshold} {item.unit}
                  </p>
                </div>

                {/* Action */}
                <Button
                  size="sm"
                  variant={isCritical ? 'default' : 'outline'}
                  className={`w-full text-xs gap-2 ${
                    isCritical
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : ''
                  }`}
                  onClick={() =>
                    router.push('/nurse/stock-requests/new')
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  {isCritical ? 'Minta Stok (Kritis!)' : 'Ajukan Permintaan'}
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && data?.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-slate-500">Tidak ada item inventori ditemukan.</p>
          {hasFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('')
                setCategory('ALL')
              }}
            >
              Reset Filter
            </Button>
          )}
        </div>
      )}

      {data?.meta && (
        <Pagination meta={data.meta} page={page} onPageChange={setPage} />
      )}

      <AddStockDialog
        open={!!addStockTarget}
        onOpenChange={(open) => !open && setAddStockTarget(null)}
        item={addStockTarget}
      />
    </div>
  )
}
