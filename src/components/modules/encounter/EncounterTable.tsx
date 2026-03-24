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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Eye, MoreHorizontal, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EncounterStatusBadge } from '@/components/shared/StatusBadge'
import { encountersApi } from '@/lib/api/endpoints/encounters'
import { formatDate, getApiErrorMessage } from '@/lib/utils'
import type { Encounter, EncounterType } from '@/types'

const TYPE_LABEL: Record<EncounterType, string> = {
  CONSULTATION: 'Konsultasi',
  TREATMENT: 'Treatment',
}

const TYPE_COLOR: Record<EncounterType, string> = {
  CONSULTATION: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  TREATMENT: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
}

interface Props {
  data: Encounter[]; // <- array satu level
  isLoading?: boolean;
  basePath: string;
}

export function EncounterTable({ data, isLoading, basePath }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [cancelTarget, setCancelTarget] = useState<Encounter | null>(null)

  const cancelMutation = useMutation({
    mutationFn: (encounterId: string) =>
      encountersApi.updateStatus(encounterId, { status: 'CANCELLED' }),
    onSuccess: () => {
      toast.success('Encounter berhasil dibatalkan')
      queryClient.invalidateQueries({ queryKey: ['encounters'] })
      setCancelTarget(null)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal membatalkan encounter')),
  })

  const columns: ColumnDef<Encounter>[] = [
    {
      id: 'pasien',
      header: 'Pasien',
      cell: ({ row }) => {
        const e = row.original
        return (
          <div>
            <p className="font-medium text-sm text-slate-900 dark:text-white">
              {e.member.fullName}
            </p>
            <p className="font-mono text-xs text-slate-500">{e.member.memberNo}</p>
          </div>
        )
      },
    },
    {
      id: 'tipe',
      header: 'Tipe',
      cell: ({ row }) => (
        <Badge
          className={`font-medium border-0 text-xs ${TYPE_COLOR[row.original.type]}`}
        >
          {TYPE_LABEL[row.original.type]}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <EncounterStatusBadge status={row.original.status} />,
    },
    {
      id: 'dokter',
      header: 'Dokter',
      cell: ({ row }) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {row.original.doctor.profile?.fullName ?? '-'}
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
      id: 'paket',
      header: 'Paket',
      cell: ({ row }) => {
        const pkg = row.original.memberPackage
        return (
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {pkg.packageName ?? pkg.packageType}{' '}
            <span className="text-xs text-slate-400">
              ({pkg.usedSessions}/{pkg.totalSessions})
            </span>
          </span>
        )
      },
    },
    {
      id: 'sesi',
      header: 'Sesi',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
          {row.original._count.sessions}
        </span>
      ),
    },
    {
      accessorKey: 'treatmentDate',
      header: 'Tgl Treatment',
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {formatDate(row.original.treatmentDate)}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const encounter = row.original
        const canCancel =
          encounter.status === 'PLANNED' || encounter.status === 'ONGOING'
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
                  router.push(`/${basePath}/encounters/${encounter.encounterId}`)
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                Detail
              </DropdownMenuItem>
              {canCancel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => setCancelTarget(encounter)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Batalkan
                  </DropdownMenuItem>
                </>
              )}
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
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Batalkan Encounter"
        description={`Yakin ingin membatalkan encounter pasien ${cancelTarget?.member.fullName}? Tindakan ini tidak dapat diurungkan.`}
        confirmLabel="Ya, Batalkan"
        variant="destructive"
        onConfirm={() =>
          cancelTarget && cancelMutation.mutate(cancelTarget.encounterId)
        }
        isLoading={cancelMutation.isPending}
      />
    </>
  )
}
