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
import { Eye, CheckCircle2, XCircle, MoreHorizontal, Download } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/DataTable'
import { InvoiceStatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmPaymentDialog } from '@/components/modules/invoice/ConfirmPaymentDialog'
import { RejectInvoiceDialog } from '@/components/modules/invoice/RejectInvoiceDialog'
import { invoiceApi } from '@/lib/api/endpoints/invoices'
import { formatDate, formatRupiah } from '@/lib/utils'
import type { Invoice } from '@/types'

interface Props {
  data: Invoice[]
  isLoading?: boolean
  basePath: string
}

export function InvoiceTable({ data, isLoading, basePath }: Props) {
  const router = useRouter()
  const [confirmTarget, setConfirmTarget] = useState<Invoice | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Invoice | null>(null)

  const columns: ColumnDef<Invoice>[] = [
    {
      id: 'pasien',
      header: 'Pasien',
      cell: ({ row }) => {
        const inv = row.original
        return (
          <div>
            <p className="font-medium text-sm text-slate-900 dark:text-white">
              {inv.member.fullName}
            </p>
            <p className="font-mono text-xs text-slate-500">{inv.member.memberNo}</p>
          </div>
        )
      },
    },
    {
      id: 'sesi',
      header: 'Sesi',
      cell: ({ row }) => {
        const s = row.original.session
        return (
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {s.infusKe != null ? `Infus ke-${s.infusKe}` : 'Sesi'}
            </p>
            <p className="text-xs text-slate-400">{formatDate(s.treatmentDate)}</p>
          </div>
        )
      },
    },
    {
      id: 'cabang',
      header: 'Cabang',
      cell: ({ row }) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {row.original.session.encounter.branch.name}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Total',
      cell: ({ row }) => (
        <span className="font-semibold text-sm text-slate-900 dark:text-white tabular-nums">
          {formatRupiah(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Dibuat',
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const invoice = row.original
        const canConfirm = invoice.status === 'PENDING' || invoice.status === 'OVERDUE'
        const canReject = invoice.status === 'PENDING' || invoice.status === 'OVERDUE'
        const isPaid = invoice.status === 'PAID'

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
                  router.push(`/dashboard/${basePath}/invoices/${invoice.invoiceId}`)
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                Detail
              </DropdownMenuItem>

              {isPaid && (
                <DropdownMenuItem
                  onClick={() => invoiceApi.downloadPdf(invoice.invoiceId)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Unduh PDF
                </DropdownMenuItem>
              )}

              {(canConfirm || canReject) && <DropdownMenuSeparator />}

              {canConfirm && (
                <DropdownMenuItem
                  className="text-emerald-600 focus:text-emerald-600 dark:text-emerald-400"
                  onClick={() => setConfirmTarget(invoice)}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Konfirmasi Bayar
                </DropdownMenuItem>
              )}

              {canReject && (
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 dark:text-red-400"
                  onClick={() => setRejectTarget(invoice)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Tolak Invoice
                </DropdownMenuItem>
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

      <ConfirmPaymentDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        invoiceId={confirmTarget?.invoiceId ?? ''}
        invoiceLabel={
          confirmTarget
            ? `${confirmTarget.member.fullName} · ${formatRupiah(confirmTarget.amount)}`
            : ''
        }
      />

      <RejectInvoiceDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        invoiceId={rejectTarget?.invoiceId ?? ''}
        invoiceLabel={
          rejectTarget
            ? `${rejectTarget.member.fullName} · ${formatRupiah(rejectTarget.amount)}`
            : ''
        }
      />
    </>
  )
}
