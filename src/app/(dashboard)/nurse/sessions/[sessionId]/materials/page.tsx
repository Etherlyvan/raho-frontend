'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MaterialUsageForm } from '@/components/modules/nurse/material/MaterialUsageForm';
import { MaterialUsageList } from '@/components/modules/nurse/material/MaterialUsageList';
import { sessionApi } from '@/lib/api/endpoints/sessions';
import { materialUsagesApi } from '@/lib/api/endpoints/materialUsages';
import { useAuthStore } from '@/store/auth.store';
import type { TreatmentSessionDetail, MaterialUsage } from '@/types';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function MaterialsPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const user          = useAuthStore((s) => s.user);

  /* ── Fetch Detail Sesi ── */
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session-detail', sessionId],
    queryFn: async () => {
      const res = await sessionApi.detail(sessionId);
      return res.data.data as TreatmentSessionDetail;
    },
  });

  /* ── Fetch Material Usages ── */
  const { data: usages = [], isLoading: usagesLoading } = useQuery({
    queryKey: ['material-usages', sessionId],
    queryFn: async () => {
      const res = await materialUsagesApi.list(sessionId);
      return res.data.data as MaterialUsage[];
    },
  });

  const isLoading    = sessionLoading || usagesLoading;
  const isInProgress = session?.status === 'IN_PROGRESS';
  const patientName  = session?.encounter.member.fullName ?? '...';

  /*
   * branchId: ambil dari sesi agar selalu sesuai cabang tempat sesi berlangsung.
   * Fallback ke user.branchId jika sesi belum ter-fetch.
   */
  const branchId =
    session?.encounter.branch.branchId ?? user?.branchId ?? '';

  return (
    <RoleGuard roles={['NURSE']}>
      <div className="space-y-5">
        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/dashboard/nurse/sessions/${sessionId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <PageHeader
            title="Pemakaian Material"
            description={`Sesi ${patientName} — bahan & alat yang terpakai selama sesi`}
          />
        </div>

        {/* ── Warning Stok Kritis ── */}
        {!isLoading && session && (
          <StockWarningBanner branchId={branchId} />
        )}

        {/* ── Form Input — hanya saat INPROGRESS ── */}
        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : isInProgress ? (
          <MaterialUsageForm
            sessionId={sessionId}
            branchId={branchId}
          />
        ) : (
          session && (
            <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {session.status === 'COMPLETED'
                  ? 'Sesi telah selesai — data pemakaian hanya dapat dibaca.'
                  : 'Input pemakaian material hanya tersedia saat sesi berstatus INPROGRESS.'}
              </p>
            </div>
          )
        )}

        {/* ── Daftar Pemakaian ── */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Material Terpakai
          </h3>

          <MaterialUsageList
            sessionId={sessionId}
            branchId={branchId}
            data={usages}
            isLoading={isLoading}
            canDelete={isInProgress}
          />
        </div>
      </div>
    </RoleGuard>
  );
}

/* ─── Banner Stok Kritis (tampil jika ada alert di cabang) ─────────────────── */

function StockWarningBanner({ branchId }: { branchId: string }) {
  const { data } = useQuery({
    queryKey: ['inventory', 'alerts', branchId],
    queryFn: async () => {
      const { inventoryApi } = await import('@/lib/api/endpoints/inventory');
      const res = await inventoryApi.alerts();
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!branchId,
  });

  const count = data?.total ?? 0;
  if (count === 0) return null;

  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex items-center gap-3">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
      <p className="text-sm text-amber-700 dark:text-amber-400">
        <span className="font-medium">{count} item stok kritis</span> di cabang ini.
        Pastikan ketersediaan bahan sebelum melanjutkan.{' '}
        <Link
          href="/dashboard/nurse/inventory"
          className="underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200"
        >
          Lihat detail
        </Link>
      </p>
    </div>
  );
}
