'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { PatientDashboardCards } from '@/components/modules/patient/PatientDashboardCards';
import { ActivePackageList, ActivePackageListSkeleton } from '@/components/modules/patient/ActivePackageList';
import { dashboardApi } from '@/lib/api/endpoints/dashboard';
import { formatDate, formatRupiah, INVOICE_STATUS_LABELS } from '@/lib/utils';
import type { InvoiceStatus } from '@/types';
import { NextSessionCard } from '@/components/modules/patient/NextSessionCard';
// ---------------------------------------------------------------------------
// Konstanta warna status invoice
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
// Page component
// ---------------------------------------------------------------------------

export default function PatientDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'patient'],
    queryFn: async () => (await dashboardApi.patient()).data.data,
    refetchInterval: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Pantau paket treatment, jadwal sesi, dan tagihan Anda."
      />

      {/* ----------------------------------------------------------------- */}
      {/* Loading state                                                       */}
      {/* ----------------------------------------------------------------- */}
      {isLoading && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-32 rounded" />
            <ActivePackageListSkeleton />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Error state                                                         */}
      {/* ----------------------------------------------------------------- */}
      {isError && (
        <ErrorMessage message="Gagal memuat data dashboard. Silakan muat ulang halaman." />
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Content                                                             */}
      {/* ----------------------------------------------------------------- */}
      {data && !isLoading && (
        <>
          {/* Summary cards */}
          <PatientDashboardCards data={data} />
            {data.summary.nextSession && (
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Sesi Berikutnya
                </h2>
                <NextSessionCard session={data.summary.nextSession} />
            </section>
            )}
          {/* ── Paket Aktif ─────────────────────────────────────────────── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Paket Aktif
              </h2>
              <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
                <Link href="/dashboard/patient/packages">
                  Lihat semua <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <ActivePackageList packages={data.activePackages} />
          </section>

          {/* ── Invoice Terbaru ──────────────────────────────────────────── */}
          {data.recentInvoices.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Invoice Terbaru
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-xs gap-1"
                >
                  <Link href="/dashboard/patient/invoices">
                    Lihat semua <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.recentInvoices.map((inv) => (
                      <li key={inv.invoiceId}>
                        <Link
                          href={`/dashboard/patient/invoices/${inv.invoiceId}`}
                          className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                        >
                          {/* Kiri: icon + nominal + tanggal */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="shrink-0 rounded-lg p-2 bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                              <Receipt className="h-3.5 w-3.5 text-slate-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {formatRupiah(inv.amount)}
                              </p>
                              <p className="text-xs text-slate-400">
                                {formatDate(inv.createdAt)}
                              </p>
                            </div>
                          </div>

                          {/* Kanan: badge status */}
                          <Badge
                            className={`shrink-0 text-xs ${INVOICE_STATUS_COLOR[inv.status]}`}
                          >
                            {INVOICE_STATUS_LABELS[inv.status]}
                          </Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>
          )}
        </>
      )}
    </div>
  );
}
