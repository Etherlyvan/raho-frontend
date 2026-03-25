'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { toast } from 'sonner';
import { Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { invoicesApi } from '@/lib/api/endpoints/invoices';
import {
  formatDate,
  formatRupiah,
  INVOICE_STATUS_LABELS,
  getApiErrorMessage,
} from '@/lib/utils';
import type { Invoice, InvoiceStatus } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INVOICE_STATUS_COLOR: Record<InvoiceStatus, string> = {
  PENDING:
    'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0',
  PAID:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0',
  OVERDUE:
    'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-0',
  REJECTED:
    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0',
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props {
  data: Invoice[];
  isLoading?: boolean;
}

export function PatientInvoiceTable({ data, isLoading }: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function handleDownloadPdf(invoiceId: string): Promise<void> {
    setDownloadingId(invoiceId);
    try {
      const res = await invoicesApi.pdf(invoiceId);
      triggerBlobDownload(res.data, `invoice-${invoiceId.slice(0, 8)}.pdf`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Gagal mengunduh PDF invoice'));
    } finally {
      setDownloadingId(null);
    }
  }

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Tanggal',
      cell: ({ row }) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'sesi',
      header: 'Sesi',
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-slate-600 dark:text-slate-400">
          Infus ke-{row.original.session.infusKe ?? '—'}
        </span>
      ),
    },
    {
      id: 'paket',
      header: 'Paket',
      cell: ({ row }) => {
        // path yang benar: session.encounter.memberPackage
        const pkg = row.original.session.encounter.memberPackage;
        return (
          <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[140px] block">
            {pkg.packageName ?? pkg.packageType}
          </span>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Nominal',
      cell: ({ row }) => (
        <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
          {formatRupiah(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={`text-xs ${INVOICE_STATUS_COLOR[row.original.status]}`}>
          {INVOICE_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      id: 'paidAt',
      header: 'Tgl Bayar',
      cell: ({ row }) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {row.original.paidAt ? formatDate(row.original.paidAt) : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const inv = row.original;
        const isDownloading = downloadingId === inv.invoiceId;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              onClick={() =>
                router.push(`/dashboard/patient/invoices/${inv.invoiceId}`)
              }
              title="Lihat detail invoice"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              disabled={isDownloading}
              onClick={() => handleDownloadPdf(inv.invoiceId)}
              title="Unduh PDF"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return <DataTable table={table} isLoading={isLoading} />;
}
