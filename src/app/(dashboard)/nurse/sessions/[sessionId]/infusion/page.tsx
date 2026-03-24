'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Info } from 'lucide-react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { InfusionForm } from '@/components/modules/nurse/infusion/InfusionForm';
import { InfusionPlanCompare } from '@/components/modules/nurse/infusion/InfusionPlanCompare';
import { sessionApi } from '@/lib/api/endpoints/sessions';
import { infusionApi } from '@/lib/api/endpoints/infusion';
import { formatDateTime } from '@/lib/utils';
import type { TreatmentSessionDetail, InfusionExecution } from '@/types';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function InfusionPage({ params }: PageProps) {
  const { sessionId } = use(params);

  /* ── Fetch Detail Sesi (butuh therapyPlan + status + nama pasien) ── */
  const {
    data: session,
    isLoading: sessionLoading,
  } = useQuery({
    queryKey: ['session-detail', sessionId],
    queryFn: async () => {
      const res = await sessionApi.detail(sessionId);
      return res.data.data as TreatmentSessionDetail;
    },
  });

  /* ── Fetch Infusion Execution ── */
  const {
    data: execution,
    isLoading: infusionLoading,
    isError: infusionNotFound,
  } = useQuery({
    queryKey: ['infusion', sessionId],
    queryFn: async () => {
      const res = await infusionApi.get(sessionId);
      return res.data.data as InfusionExecution;
    },
    retry: (count, err: any) => {
      // 404 berarti belum ada data → bukan error sejati
      if (err?.response?.status === 404) return false;
      return count < 2;
    },
  });

  const isLoading     = sessionLoading || infusionLoading;
  const isInProgress  = session?.status === 'IN_PROGRESS';
  const therapyPlan   = session?.therapyPlan ?? null;
  const patientName   = session?.encounter.member.fullName ?? '...';
  // execution null jika 404 (belum ada)
  const existingExec  = infusionNotFound ? null : (execution ?? null);

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
            title="Pelaksanaan Infus Aktual"
            description={`Sesi ${patientName} — catat dosis yang benar-benar diberikan`}
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : (
          <>
            {/* ── Tidak ada therapy plan ── */}
            {!therapyPlan && (
              <div className="rounded-lg border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-4 flex items-start gap-3">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Dokter belum membuat rencana terapi. Anda tetap dapat mengisi data aktual,
                  namun perbandingan tidak akan tersedia.
                </p>
              </div>
            )}

            {/* ── Perbandingan Plan vs Aktual (hanya jika execution sudah ada) ── */}
            {existingExec && (
              <InfusionPlanCompare
                plan={therapyPlan}
                execution={existingExec}
              />
            )}

            {/* ── Status: Sesi tidak INPROGRESS ── */}
            {!isInProgress && session && (
              <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 p-4 text-center space-y-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {session.status === 'COMPLETED'
                    ? 'Sesi telah selesai — data infus hanya dapat dibaca.'
                    : 'Input data infus hanya tersedia saat sesi berstatus INPROGRESS.'}
                </p>
                {existingExec?.filledAt && (
                  <p className="text-xs text-muted-foreground">
                    Terakhir diperbarui: {formatDateTime(existingExec.filledAt)}
                    {existingExec.filler.profile?.fullName
                      ? ` oleh ${existingExec.filler.profile.fullName}`
                      : ''}
                  </p>
                )}
              </div>
            )}

            {/* ── Form Input / Edit — hanya saat INPROGRESS ── */}
            {isInProgress && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 px-0.5">
                  {existingExec
                    ? 'Perbarui Data Infus Aktual'
                    : 'Input Data Infus Aktual'}
                </h3>
                <InfusionForm
                  sessionId={sessionId}
                  existing={existingExec}
                  therapyPlan={therapyPlan}
                />
              </div>
            )}

            {/* ── Tampilan read-only jika COMPLETED dan ada data ── */}
            {!isInProgress && existingExec && !therapyPlan && (
              <InfusionPlanCompare
                plan={therapyPlan}
                execution={existingExec}
              />
            )}
          </>
        )}
      </div>
    </RoleGuard>
  );
}
