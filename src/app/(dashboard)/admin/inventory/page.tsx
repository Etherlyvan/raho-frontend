'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react'
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
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { StockAlertBanner } from '@/components/modules/inventory/StockAlertBanner'
import { InventoryTable } from '@/components/modules/inventory/InventoryTable'
import { inventoryApi } from '@/lib/api/endpoints/inventory'
import { useAuthStore } from '@/store/auth.store'
import { useDebounce } from '@/hooks/useDebounce'
import type { InventoryCategory } from '@/types'

type CategoryFilter = InventoryCategory | 'ALL'
type ActiveFilter = 'ALL' | 'true' | 'false'

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'ALL', label: 'Semua Kategori' },
  { value: 'MEDICINE', label: 'Obat / Farmasi' },
  { value: 'DEVICE', label: 'Alat Medis' },
  { value: 'CONSUMABLE', label: 'Habis Pakai' },
]

const ACTIVE_OPTIONS: { value: ActiveFilter; label: string }[] = [
  { value: 'ALL', label: 'Semua Status' },
  { value: 'true', label: 'Aktif' },
  { value: 'false', label: 'Nonaktif' },
]

export default function AdminInventoryPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('ALL')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('true')

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: [
      'inventory',
      page,
      debouncedSearch,
      category,
      activeFilter,
      user?.branchId,
    ],
    queryFn: async () => {
      const res = await inventoryApi.list({
        page,
        limit: 20,
        branchId: user?.branchId ?? undefined,
        search: debouncedSearch || undefined,
        category: category !== 'ALL' ? category : undefined,
        isActive: activeFilter !== 'ALL' ? activeFilter === 'true' : undefined,
      })
      return res.data
    },
    enabled: !!user,
  })

  function handleCategoryChange(v: string) {
    setCategory(v as CategoryFilter)
    setPage(1)
  }

  function handleActiveChange(v: string) {
    setActiveFilter(v as ActiveFilter)
    setPage(1)
  }

  function clearFilters() {
    setSearch('')
    setCategory('ALL')
    setActiveFilter('true')
    setPage(1)
  }

  const hasActiveFilter =
    search || category !== 'ALL' || activeFilter !== 'true'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Inventori"
          description="Manajemen stok obat, alat, dan barang habis pakai"
          className="pb-0"
        />
        <Button
          onClick={() => router.push('/admin/inventory/new')}
          className="shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Item
        </Button>
      </div>

      {/* Stock alert banner */}
      <StockAlertBanner basePath="admin" />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
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

        {/* Kategori */}
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

        {/* Status Aktif */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Status</Label>
          <Select value={activeFilter} onValueChange={handleActiveChange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stok Kritis shortcut */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-500 invisible">Action</Label>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => router.push('/admin/inventory/alerts')}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Stok Kritis
          </Button>
        </div>

        {hasActiveFilter && (
          <div className="space-y-1">
            <Label className="text-xs text-slate-500 invisible">Reset</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Reset Filter
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

      <InventoryTable
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
