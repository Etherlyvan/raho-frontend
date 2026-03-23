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
import { Eye, MoreHorizontal, Calendar } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/DataTable'
import { SessionStatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, formatDateTime } from '@/lib/utils'
import type { TreatmentSession } from '@/types'

const PELAKSANAAN_LABEL: Record<string, string> = {
  KLINIK: 'Klinik',
  HOMECARE: 'Homecare',
}

interface Props {
  data: TreatmentSession[]
  isLoading?: boolean
  basePath: string  // e.g. 'admin'
}

export function SessionTable({ data, isLoading, basePath }: Props) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<TreatmentSession>[] = [
    {
      id: 'pasien',
      header: 'Pasien',
      cell: ({ row }) => {
        const s = row.original
        return (
          <div>
            <p className="font-medium text-sm text-slate-900 dark:text-white">
              {s.encounter.member.fullName}
            </p>
            <p className="font-mono text-xs text-slate-500">{s.encounter.member.memberNo}</p>
          </div>
        )
      },
    },
    {
      id: 'infusKe',
      header: 'Infus Ke',
      cell: ({ row }) => {
        const n = row.original.infusKe
        return (
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
            {n ?? '-'}
          </span>
        )
      },
    },
    {
      accessorKey: 'pelaksanaan',
      header: 'Tipe',
      cell: ({ row }) => {
        const v = row.original.pelaksanaan
        if (!v) return <span className="text-slate-400 text-sm">-</span>
        return (
          <Badge
            className={
              v === 'HOMECARE'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0 text-xs'
                : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-0 text-xs'
            }
          >
            {PELAKSANAAN_LABEL[v]}
          </Badge>
        )
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <SessionStatusBadge status={row.original.status} />,
    },
    {
      id: 'nurse',
      header: 'Perawat',
      cell: ({ row }) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {row.original.nurse?.profile?.fullName ?? (
            <span className="italic text-slate-400">Belum ditentukan</span>
          )}
        </span>
      ),
    },
    {
      id: 'cabang',
      header: 'Cabang',
      cell: ({ row }) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {row.original.encounter.branch.name}
        </span>
      ),
    },
    {
      accessorKey: 'treatmentDate',
      header: 'Tgl Treatment',
      cell: ({ row }) => (
        <span className="text-sm text-slate-500 whitespace-nowrap">
          {formatDate(row.original.treatmentDate)}
        </span>
      ),
    },
    {
      id: 'invoice',
      header: 'Invoice',
      cell: ({ row }) => {
        const inv = row.original.invoice
        if (!inv) return <span className="text-slate-400 text-xs">-</span>
        const color: Record<string, string> = {
          PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
          PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
          OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
          REJECTED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        }
        return (
          <Badge className={`border-0 text-xs ${color[inv.status] ?? ''}`}>
            {inv.status}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const session = row.original
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
                  router.push(
                    `/dashboard/${basePath}/sessions/${session.treatmentSessionId}`,
                  )
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                Detail Sesi
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/dashboard/${basePath}/encounters/${session.encounterId}`,
                  )
                }
              >
                <Calendar className="mr-2 h-4 w-4" />
                Lihat Encounter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
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
