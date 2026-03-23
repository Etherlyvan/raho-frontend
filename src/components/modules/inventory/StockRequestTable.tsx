'use client'
import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/DataTable'
import { StockRequestActions } from '@/components/modules/inventory/StockRequestActions'
import { formatDate } from '@/lib/utils'
import type { StockRequest, RequestStatus } from '@/types'

// ── Status Badge ──────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<RequestStatus, string> = {
  PENDING:
    'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0 text-xs',
  APPROVED:
    'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-0 text-xs',
  REJECTED:
    'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-0 text-xs',
  FULFILLED:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0 text-xs',
}

const STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  FULFILLED: 'Terpenuhi',
}

// ── Props & Component ─────────────────────────────────────────────────────────

interface Props {
  data: StockRequest[]
  isLoading?: boolean
  // true → tampilkan tombol aksi Admin (approve/reject/fulfill)
  showActions?: boolean
}

export function StockRequestTable({
  data,
  isLoading,
  showActions = true,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<StockRequest>[] = [
    {
      id: 'item',
      header: 'Item',
      cell: ({ row }) => {
        const req = row.original
        return (
          <div>
            <p className="font-medium text-sm text-slate-900 dark:text-white">
              {req.item.name}
            </p>
            <p className="text-xs text-slate-500 capitalize">
              {req.item.category.toLowerCase()} · {req.item.branch.name}
            </p>
          </div>
        )
      },
    },
    {
      id: 'requester',
      header: 'Pemohon',
      cell: ({ row }) => {
        const req = row.original
        return (
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {req.requester.profile?.fullName ?? req.requester.staffCode ?? '-'}
            </p>
            <p className="text-xs text-slate-400">{req.requester.role.name}</p>
          </div>
        )
      },
    },
    {
      accessorKey: 'quantity',
      header: 'Jumlah',
      cell: ({ row }) => (
        <span className="text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">
          {row.original.quantity} {row.original.item.unit}
        </span>
      ),
    },
    {
      id: 'stok',
      header: 'Stok Saat Ini',
      cell: ({ row }) => {
        const item = row.original.item
        const isCritical = item.stock <= item.minThreshold
        return (
          <span
            className={`text-sm tabular-nums font-medium ${
              isCritical
                ? 'text-red-600 dark:text-red-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.stock} / {item.minThreshold} min
          </span>
        )
      },
    },
    {
      accessorKey: 'reason',
      header: 'Alasan',
      cell: ({ row }) => (
        <span className="text-sm text-slate-500 line-clamp-2">
          {row.original.reason ?? (
            <span className="italic text-slate-400">-</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={STATUS_STYLE[row.original.status]}>
          {STATUS_LABEL[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Tanggal',
      cell: ({ row }) => (
        <span className="text-sm text-slate-500 whitespace-nowrap">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    ...(showActions
      ? [
          {
            id: 'actions',
            cell: ({ row }: { row: { original: StockRequest } }) => (
              <StockRequestActions request={row.original} />
            ),
          } as ColumnDef<StockRequest>,
        ]
      : []),
  ]

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return <DataTable table={table} isLoading={isLoading} />
}
