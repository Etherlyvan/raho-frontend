'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Info } from 'lucide-react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EMRNoteForm } from '@/components/modules/doctor/EMRNoteForm';
import { EMRNoteList } from '@/components/modules/doctor/EMRNoteList';
import { sessionApi } from '@/lib/api/endpoints/sessions';
import type { TreatmentSessionDetail } from '@/types';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function NurseEMRNotesPage({ params }: PageProps) {
  const { sessionId } = use(params);

  const { data: session, isLoading } = useQuery({
    queryKey: ['session-detail', sessionId],
    queryFn: async () => {
      const res = await sessionApi.detail(sessionId);
      return res.data.data as TreatmentSessionDetail;
    },
  });

  /* Fix TS2367: hindari optional chaining langsung di komparasi */
  const sessionStatus = session?.status;
  const isInProgress  = sessionStatus === 'IN_PROGRESS';
  const patientName   = session?.encounter.member.fullName ?? '...';

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
            title="Catatan Operasional"
            description={`Sesi ${patientName} — catatan EMR tipe Operasional`}
          />
        </div>

        {/* ── Info konteks ── */}
        <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Sebagai perawat, catatan yang Anda buat bertipe{' '}
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
              OPERATIONALNOTE
            </span>
            {' '}dan terhubung ke sesi ini. Catatan ini dapat dibaca oleh dokter dan admin.
          </p>
        </div>

        {/* ── Form — hanya saat INPROGRESS ── */}
        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : isInProgress ? (
          /*
           * EMRNoteForm dari Sprint 6 menerima sessionId? atau encounterId?.
           * Saat sessionId diisi → typeOptions otomatis OPERATIONALNOTE + CLINICALNOTE
           * Tidak perlu prop mode/resourceId/allowedTypes.
           */
          <EMRNoteForm sessionId={sessionId} />
        ) : (
          session && (
            <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {session.status === 'COMPLETED'
                  ? 'Sesi telah selesai — catatan hanya dapat dibaca.'
                  : 'Input catatan hanya tersedia saat sesi berstatus INPROGRESS.'}
              </p>
            </div>
          )
        )}

        {/* ── Daftar Catatan ──
             EMRNoteList sudah fetch data sendiri via useQuery internal (sessionId prop).
             Tidak perlu passing notes array dari luar. ── */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Riwayat Catatan Sesi
          </h3>
          <EMRNoteList
            sessionId={sessionId}
            readOnly={!isInProgress}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
