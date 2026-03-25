'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader }   from '@/components/shared/PageHeader';
import { Pagination }   from '@/components/shared/Pagination';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { InvoiceTable } from '@/components/modules/invoice/InvoiceTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { invoicesApi }    from '@/lib/api/endpoints/invoices';
import { useAuthStore }   from '@/store/auth.store';
import { INVOICE_STATUS_LABELS } from '@/lib/utils';
import type { Invoice, InvoiceStatus, PaginatedResponse } from '@/types';

// ─── Filter type ─────────────────────────────────────────────────────────────

type StatusFilter = InvoiceStatus | 'ALL';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL',      label: 'Semua Status' },
  { value: 'PENDING',  label: INVOICE_STATUS_LABELS['PENDING']  },
  { value: 'PAID',     label: INVOICE_STATUS_LABELS['PAID']     },
  { value: 'OVERDUE',  label: INVOICE_STATUS_LABELS['OVERDUE']  },
  { value: 'REJECTED', label: INVOICE_STATUS_LABELS['REJECTED'] },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminInvoicesPage() {
  const user = useAuthStore((s) => s.user);

  const [page,   setPage]   = useState(1);
  const [status, setStatus] = useState<StatusFilter>('ALL');

  const { data, isLoading, isError } = useQuery<PaginatedResponse<Invoice>>({
    queryKey: ['invoices', page, status, user?.branchId],
    queryFn: async () => {
      const res = await invoicesApi.list({
        status:   status !== 'ALL' ? status : undefined,
        branchId: user?.branchId ?? undefined,
        page,
        limit:    15,
      } as Record<string, unknown>);
      return res.data as unknown as PaginatedResponse<Invoice>; // ← cast
    },
    enabled: !!user,
    placeholderData: (prev) => prev,
  });

  function handleStatusChange(value: string) {
    setStatus(value as StatusFilter);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice"
        description="Daftar seluruh invoice treatment pasien di cabang ini."
      />

      {/* ── Filter ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {isError && (
        <ErrorMessage message="Gagal memuat data invoice. Silakan muat ulang halaman." />
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <InvoiceTable
        data={data?.data ?? []}
        isLoading={isLoading}
        basePath="/admin"
      />

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      {data?.meta && (
        <Pagination
          meta={data.meta}
          page={page}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
