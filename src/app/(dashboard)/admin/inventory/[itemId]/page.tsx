'use client'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Pencil,
  PackagePlus,
  Trash2,
  AlertTriangle,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { AddStockDialog } from '@/components/modules/inventory/AddStockDialog'
import { inventoryApi } from '@/lib/api/endpoints/inventory'
import { formatDate, getApiErrorMessage } from '@/lib/utils'
import { toast } from 'sonner'
import { useState } from 'react'
import type { InventoryCategory } from '@/types'

const CATEGORY_LABEL: Record<InventoryCategory, string> = {
  MEDICINE: 'Obat / Farmasi',
  DEVICE: 'Alat Medis',
  CONSUMABLE: 'Barang Habis Pakai',
}

const CATEGORY_COLOR: Record<InventoryCategory, string> = {
  MEDICINE: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-0',
  DEVICE: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border-0',
  CONSUMABLE: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0',
}

function InfoRow({
  label,
  value,
  className,
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-start justify-between gap-4 py-2.5 ${className}`}>
      <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 text-right">
        {value}
      </span>
    </div>
  )
}

export default function InventoryDetailPage() {
  const { itemId } = useParams<{ itemId: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [addStockOpen, setAddStockOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: item, isLoading } = useQuery({
    queryKey: ['inventory', itemId],
    queryFn: async () => {
      const res = await inventoryApi.detail(itemId)
      return res.data.data
    },
    enabled: !!itemId,
  })

  const deleteMutation = useMutation({
    mutationFn: () => inventoryApi.remove(itemId),
    onSuccess: (res) => {
      const isHardDelete = res.data.data === null
      toast.success(
        isHardDelete
          ? 'Item berhasil dihapus permanen'
          : 'Item dinonaktifkan (memiliki riwayat pemakaian)',
      )
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      router.push('/admin/inventory')
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal menghapus item')),
  })

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Package className="h-12 w-12 text-slate-300" />
        <p className="text-slate-500">Item tidak ditemukan.</p>
        <Button
          variant="outline"
          onClick={() => router.push('/admin/inventory')}
        >
          Kembali ke Inventori
        </Button>
      </div>
    )
  }

  const isCritical = item.stock <= item.minThreshold
  const stockRatio =
    item.minThreshold > 0
      ? Math.min((item.stock / item.minThreshold) * 100, 200)
      : 100

  return (
    <div className="space-y-6">
      {/* Header */}
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
          title={item.name}
          description={`${CATEGORY_LABEL[item.category]} · ${item.branch.name}`}
          className="pb-0 flex-1"
        />
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/inventory/${itemId}/edit`)}
          className="gap-2"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button
          size="sm"
          onClick={() => setAddStockOpen(true)}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <PackagePlus className="h-4 w-4" />
          Tambah Stok
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
        >
          <Trash2 className="h-4 w-4" />
          Hapus
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Stok Card ─────────────────────────────────────────────────────── */}
        <Card
          className={`${
            isCritical
              ? 'border-red-300 dark:border-red-700'
              : 'border-emerald-200 dark:border-emerald-800'
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {isCritical ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-red-700 dark:text-red-400">Stok Kritis</span>
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-700 dark:text-emerald-400">
                    Stok Aman
                  </span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p
                className={`text-5xl font-bold tabular-nums ${
                  isCritical
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {item.stock}
              </p>
              <p className="text-sm text-slate-500 mt-1">{item.unit}</p>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isCritical
                      ? 'bg-red-500'
                      : stockRatio < 150
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(stockRatio, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 text-right">
                Min: {item.minThreshold} {item.unit}
              </p>
            </div>

            {/* Usage count */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">Total pemakaian</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                {item._count.usages}x
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Total request</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                {item._count.requests}x
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Detail Card ───────────────────────────────────────────────────── */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informasi Item</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
            <InfoRow label="Nama" value={item.name} />
            <InfoRow
              label="Kategori"
              value={
                <Badge className={CATEGORY_COLOR[item.category]}>
                  {CATEGORY_LABEL[item.category]}
                </Badge>
              }
            />
            <InfoRow label="Satuan" value={item.unit} />
            <InfoRow
              label="Lokasi Penyimpanan"
              value={
                item.location ?? (
                  <span className="italic text-slate-400">Tidak diatur</span>
                )
              }
            />
            <Separator className="my-0" />
            <InfoRow label="Cabang" value={`${item.branch.name} · ${item.branch.city}`} />
            {item.partnership && (
              <InfoRow
                label="Partnership"
                value={`${item.partnership.name} · ${item.partnership.city}`}
              />
            )}
            <Separator className="my-0" />
            <InfoRow
              label="Status"
              value={
                item.isActive ? (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0">
                    Aktif
                  </Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0">
                    Nonaktif
                  </Badge>
                )
              }
            />
            <InfoRow label="Ditambahkan" value={formatDate(item.createdAt)} />
            <InfoRow label="Terakhir Diupdate" value={formatDate(item.updatedAt)} />
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddStockDialog
        open={addStockOpen}
        onOpenChange={setAddStockOpen}
        item={item}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Item Inventori"
        description={
          item._count.usages > 0
            ? `Item "${item.name}" memiliki ${item._count.usages} riwayat pemakaian. Item akan dinonaktifkan, bukan dihapus permanen.`
            : `Yakin ingin menghapus item "${item.name}" secara permanen? Tindakan ini tidak dapat dibatalkan.`
        }
        confirmLabel={item._count.usages > 0 ? 'Nonaktifkan' : 'Hapus Permanen'}
        variant="destructive"
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
