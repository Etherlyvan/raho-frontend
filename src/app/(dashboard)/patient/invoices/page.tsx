'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader }          from '@/components/shared/PageHeader';
import { ErrorMessage }        from '@/components/shared/ErrorMessage';
import { EmptyState }          from '@/components/shared/EmptyState';
import { Pagination }          from '@/components/shared/Pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PatientInvoiceTable } from '@/components/modules/patient/PatientInvoiceTable';
import { invoicesApi }         from '@/lib/api/endpoints/invoices';
import { usePatientMemberId }  from '@/hooks/usePatientMemberId';
import { INVOICE_STATUS_LABELS } from '@/lib/utils';
import type { Invoice, InvoiceStatus, PaginatedResponse } from '@/types';

const STATUS_OPTIONS = [
  { value: 'all',      label: 'Semua Status' },
  { value: 'PENDING',  label: INVOICE_STATUS_LABELS['PENDING']  },
  { value: 'PAID',     label: INVOICE_STATUS_LABELS['PAID']     },
  { value: 'OVERDUE',  label: INVOICE_STATUS_LABELS['OVERDUE']  },
  { value: 'REJECTED', label: INVOICE_STATUS_LABELS['REJECTED'] },
];

const LIMIT = 10;

export default function PatientInvoicesPage() {
  const memberId = usePatientMemberId();
  const [page, setPage]               = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading, isError } = useQuery<PaginatedResponse<Invoice>>({
    queryKey: ['patient', 'invoices', memberId, page, statusFilter],
    queryFn: async () => {
      const res = await invoicesApi.listByMember(memberId!, {
        status: statusFilter !== 'all' ? (statusFilter as InvoiceStatus) : undefined,
        page,
        limit: LIMIT,
      });
      // ✅ Cast diperlukan karena endpoint dideklarasikan dengan generic yang salah
      //    (Invoice[] instead of Invoice). Cast ini aman karena runtime data benar.
      return res.data as unknown as PaginatedResponse<Invoice>;
    },
    enabled: !!memberId,
    placeholderData: (prev) => prev,
  });

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  const isEmpty = !isLoading && (data?.data.length ?? 0) === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice Saya"
        description="Riwayat tagihan dari setiap sesi treatment Anda."
      />

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={handleStatusChange}>
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

      {/* Error */}
      {isError && (
        <ErrorMessage message="Gagal memuat invoice. Silakan muat ulang halaman." />
      )}

      {/* Empty */}
      {isEmpty && (
        <EmptyState
          title="Tidak ada invoice"
          description={
            statusFilter !== 'all'
              ? `Tidak ada invoice dengan status "${INVOICE_STATUS_LABELS[statusFilter as InvoiceStatus]}".`
              : 'Belum ada invoice tercatat untuk akun Anda.'
          }
        />
      )}

      {/* Table */}
      {!isEmpty && (
        <PatientInvoiceTable
          data={data?.data ?? []}
          isLoading={isLoading || !memberId}
        />
      )}

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <Pagination
          meta={data.meta}
          page={page}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
