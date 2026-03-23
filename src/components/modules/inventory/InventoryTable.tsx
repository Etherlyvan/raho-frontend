'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import {
  MoreHorizontal,
  Eye,
  PackagePlus,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { AddStockDialog } from '@/components/modules/inventory/AddStockDialog'
import { inventoryApi } from '@/lib/api/endpoints/inventory'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/utils'
import type { InventoryItem, InventoryCategory } from '@/types'

// ── Category Badge ─────────────────────────────────────────────────────────────

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

function StockProgress({ stock, threshold }: { stock: number; threshold: number }) {
  const isCritical = stock <= threshold
  const ratio = threshold > 0 ? Math.min((stock / threshold) * 100, 200) : 100
  // Progress bar capped di 200% agar visual proporsional
  const displayRatio = Math.min(ratio, 100)

  return (
    <div className="min-w-[120px]">
      <div className="flex items-center justify-between mb-1 gap-2">
        <span
          className={`text-sm font-semibold tabular-nums ${
            isCritical
              ? 'text-red-600 dark:text-red-400'
              : 'text-slate-800 dark:text-slate-200'
          }`}
        >
          {stock}
        </span>
        {isCritical && (
          <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
        )}
      </div>
      <Progress
        value={displayRatio}
        className={`h-1.5 ${
          isCritical
            ? '[&>div]:bg-red-500'
            : stock < threshold * 1.5
            ? '[&>div]:bg-amber-500'
            : '[&>div]:bg-emerald-500'
        }`}
      />
      <p className="text-xs text-slate-400 mt-0.5">min: {threshold}</p>
    </div>
  )
}

// ── Props & Component ─────────────────────────────────────────────────────────

interface Props {
  data: InventoryItem[]
  isLoading?: boolean
  basePath?: string
}

export function InventoryTable({ data, isLoading, basePath = 'admin' }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [addStockTarget, setAddStockTarget] = useState<InventoryItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => inventoryApi.remove(itemId),
    onSuccess: (res) => {
      const msg =
        res.data.data === null
          ? 'Item berhasil dihapus permanen'
          : 'Item dinonaktifkan (memiliki riwayat pemakaian)'
      toast.success(msg)
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      setDeleteTarget(null)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal menghapus item')),
  })

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Item',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div>
            <p className="font-medium text-sm text-slate-900 dark:text-white">
              {item.name}
            </p>
            {!item.isActive && (
              <span className="text-xs text-slate-400 italic">Nonaktif</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
      cell: ({ row }) => (
        <Badge className={CATEGORY_STYLE[row.original.category]}>
          {CATEGORY_LABEL[row.original.category]}
        </Badge>
      ),
    },
    {
      id: 'stock',
      header: 'Stok',
      cell: ({ row }) => (
        <StockProgress
          stock={row.original.stock}
          threshold={row.original.minThreshold}
        />
      ),
    },
    {
      accessorKey: 'unit',
      header: 'Satuan',
      cell: ({ row }) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {row.original.unit}
        </span>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Lokasi',
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {row.original.location ?? (
            <span className="italic text-slate-400">-</span>
          )}
        </span>
      ),
    },
    {
      id: 'cabang',
      header: 'Cabang',
      cell: ({ row }) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {row.original.branch.name}
        </span>
      ),
    },
    {
      id: 'usage',
      header: 'Pemakaian',
      cell: ({ row }) => (
        <span className="text-xs text-slate-500 tabular-nums">
          {row.original._count.usages}x
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/${basePath}/inventory/${item.inventoryItemId}`)
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                Detail
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/${basePath}/inventory/${item.inventoryItemId}/edit`,
                  )
                }
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAddStockTarget(item)}>
                <PackagePlus className="mr-2 h-4 w-4" />
                Tambah Stok
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 dark:text-red-400"
                onClick={() => setDeleteTarget(item)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <>
      <DataTable table={table} isLoading={isLoading} />

      {/* Add Stock Dialog */}
      <AddStockDialog
        open={!!addStockTarget}
        onOpenChange={(open) => !open && setAddStockTarget(null)}
        item={addStockTarget}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Item Inventori"
        description={
            deleteTarget
                ? (deleteTarget._count?.usages ?? 0) > 0
                ? `Item "${deleteTarget.name}" memiliki ${deleteTarget._count?.usages ?? 0} riwayat pemakaian. Item akan dinonaktifkan, bukan dihapus permanen.`
                : `Yakin ingin menghapus item "${deleteTarget.name}" secara permanen? Tindakan ini tidak dapat dibatalkan.`
                : ''
        }
        confirmLabel={
            (deleteTarget?._count?.usages ?? 0) > 0 ? 'Nonaktifkan' : 'Hapus Permanen'
        }
        variant="destructive"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.inventoryItemId)}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}
