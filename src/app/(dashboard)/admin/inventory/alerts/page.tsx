'use client'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertTriangle, PackagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AddStockDialog } from '@/components/modules/inventory/AddStockDialog'
import { inventoryApi } from '@/lib/api/endpoints/inventory'
import { useAuthStore } from '@/store/auth.store'
import { useState } from 'react'
import type { InventoryAlert, InventoryCategory } from '@/types'

const CATEGORY_LABEL: Record<InventoryCategory, string> = {
  MEDICINE: 'Obat',
  DEVICE: 'Alat',
  CONSUMABLE: 'Habis Pakai',
}

const CATEGORY_COLOR: Record<InventoryCategory, string> = {
  MEDICINE: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-0 text-xs',
  DEVICE: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border-0 text-xs',
  CONSUMABLE: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0 text-xs',
}

// InventoryAlert → minimal shape untuk AddStockDialog yang butuh InventoryItem
function alertToDialogItem(alert: InventoryAlert) {
  return {
    inventoryItemId: alert.inventoryItemId,
    name: alert.name,
    category: alert.category,
    unit: alert.unit,
    stock: alert.stock,
    minThreshold: alert.minThreshold,
    location: alert.location,
    isActive: true,
    partnershipId: null,
    createdAt: '',
    updatedAt: '',
    branch: { branchId: alert.branchId, name: '', city: '', tipe: 'KLINIK' as const },
    partnership: null,
    _count: { usages: 0, requests: 0 },
  }
}

export default function InventoryAlertsPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [addStockTarget, setAddStockTarget] = useState<ReturnType<typeof alertToDialogItem> | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'alerts'],
    queryFn: async () => {
      const res = await inventoryApi.alerts()
      return res.data.data
    },
    enabled: !!user,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => router.push('/admin/inventory')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Stok Kritis"
          description="Item inventori yang stoknya di bawah minimum threshold"
          className="pb-0"
        />
      </div>

      {/* Summary card */}
      {!isLoading && data && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            {data.total === 0
              ? 'Tidak ada item yang kritis saat ini.'
              : `${data.total} item membutuhkan penambahan stok segera.`}
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && data?.total === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
            <PackagePlus className="h-8 w-8 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Semua stok dalam kondisi aman
          </p>
          <p className="text-xs text-slate-400">
            Tidak ada item yang berada di bawah minimum threshold.
          </p>
        </div>
      )}

      {/* Alert cards grid */}
      {!isLoading && data && data.total > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((alert) => {
            const deficit = alert.minThreshold - alert.stock
            const ratio =
              alert.minThreshold > 0
                ? Math.min((alert.stock / alert.minThreshold) * 100, 100)
                : 0

            return (
              <Card
                key={alert.inventoryItemId}
                className="border-red-200 dark:border-red-800/60 hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-5 pb-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {alert.name}
                      </p>
                      {alert.location && (
                        <p className="text-xs text-slate-400 truncate">
                          {alert.location}
                        </p>
                      )}
                    </div>
                    <Badge className={CATEGORY_COLOR[alert.category]}>
                      {CATEGORY_LABEL[alert.category]}
                    </Badge>
                  </div>

                  {/* Stock numbers */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Stok saat ini</span>
                      <span className="font-bold text-red-600 dark:text-red-400 tabular-nums">
                        {alert.stock} {alert.unit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-red-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Min: {alert.minThreshold} {alert.unit}
                      </span>
                      <span className="text-red-500 font-medium">
                        -{deficit} {alert.unit}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <Button
                    size="sm"
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                    onClick={() => setAddStockTarget(alertToDialogItem(alert))}
                  >
                    <PackagePlus className="h-3.5 w-3.5" />
                    Tambah Stok
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Stock Dialog */}
      <AddStockDialog
        open={!!addStockTarget}
        onOpenChange={(open) => !open && setAddStockTarget(null)}
        item={addStockTarget}
      />
    </div>
  )
}
