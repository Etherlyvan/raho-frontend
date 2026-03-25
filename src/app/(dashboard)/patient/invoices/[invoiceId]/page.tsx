'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { PatientInvoiceDetailCard } from '@/components/modules/patient/PatientInvoiceDetailCard';
import { invoicesApi } from '@/lib/api/endpoints/invoices';

// ---------------------------------------------------------------------------
// Loading skeleton: cerminkan layout detail tanpa spinner full-page
// ---------------------------------------------------------------------------

function InvoiceDetailSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header card */}
      <Skeleton className="h-36 rounded-xl" />
      {/* Info pasien & sesi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      {/* Rincian item */}
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function PatientInvoiceDetailPage() {
  const router = useRouter();
  const params = useParams<{ invoiceId: string }>();
  const invoiceId = params.invoiceId;

  const { data: invoice, isLoading, isError } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const res = await invoicesApi.detail(invoiceId);
      return res.data.data;
    },
    enabled: !!invoiceId,
    retry: 1,
    staleTime: 2 * 60 * 1000,
  });

  return (
    <div className="space-y-6">
      {/* ── Header + tombol kembali ──────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Detail Invoice"
          description="Rincian tagihan sesi treatment Anda."
        />
      </div>

      {/* ── Loading state ────────────────────────────────────────────────── */}
      {isLoading && <InvoiceDetailSkeleton />}

      {/* ── Error state ──────────────────────────────────────────────────── */}
      {isError && (
        <ErrorMessage message="Invoice tidak ditemukan atau Anda tidak memiliki akses ke invoice ini." />
      )}

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {invoice && !isLoading && (
        <PatientInvoiceDetailCard invoice={invoice} />
      )}
    </div>
  );
}
