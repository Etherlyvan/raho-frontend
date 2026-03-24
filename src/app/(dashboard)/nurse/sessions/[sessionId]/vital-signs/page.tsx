'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, Trash2, Clock,
} from 'lucide-react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { VitalSignForm } from '@/components/modules/nurse/vital-sign/VitalSignForm';
import { VitalSignTimeline } from '@/components/modules/nurse/vital-sign/VitalSignTimeline';
import { vitalSignsApi } from '@/lib/api/endpoints/vitalSigns';
import { sessionApi } from '@/lib/api/endpoints/sessions';
import {
  formatDateTime, getApiErrorMessage,
} from '@/lib/utils';
import type { VitalSign } from '@/types';
import { useState } from 'react';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function VitalSignsPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<VitalSign | null>(null);

  /* ── Data Sesi (untuk cek status dan nama pasien) ── */
  const { data: session } = useQuery({
    queryKey: ['session-detail', sessionId],
    queryFn: async () => {
      const res = await sessionApi.detail(sessionId);
      return res.data.data;
    },
  });

  /* ── Data Tanda Vital ── */
  const { data: vitalSigns = [], isLoading } = useQuery({
    queryKey: ['vital-signs', sessionId],
    queryFn: async () => {
      const res = await vitalSignsApi.list(sessionId);
      return res.data.data;
    },
  });

  /* ── Hapus Tanda Vital ── */
  const deleteMutation = useMutation({
    mutationFn: (vsId: string) => vitalSignsApi.remove(sessionId, vsId),
    onSuccess: () => {
      toast.success('Record tanda vital berhasil dihapus.');
      queryClient.invalidateQueries({ queryKey: ['vital-signs', sessionId] });
      setDeleteTarget(null);
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, 'Gagal menghapus tanda vital')),
  });

  const isInProgress = session?.status === 'IN_PROGRESS';
  const patientName  = session?.encounter.member.fullName ?? '...';

  return (
    <RoleGuard roles={['NURSE']}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/dashboard/nurse/sessions/${sessionId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <PageHeader
            title="Tanda Vital"
            description={`Sesi ${patientName} — input berkali-kali selama INPROGRESS`}
          />
        </div>

        {/* Grafik Timeline */}
        <VitalSignTimeline vitalSigns={vitalSigns} />

        {/* Form Input — hanya saat INPROGRESS */}
        {isInProgress && <VitalSignForm sessionId={sessionId} />}

        {!isInProgress && session && (
          <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Input tanda vital hanya tersedia saat sesi berstatus{' '}
              <span className="font-medium text-teal-600 dark:text-teal-400">INPROGRESS</span>.
            </p>
          </div>
        )}

        {/* Daftar Record */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Riwayat Pengukuran
          </h3>

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))
          ) : vitalSigns.length === 0 ? (
            <EmptyState
              title="Belum ada tanda vital"
              description="Belum ada tanda vital yang dicatat untuk sesi ini."
            />
          ) : (
            [...vitalSigns]
              .sort((a, b) =>
                new Date(b.measuredAt ?? b.sessionVitalSignId).getTime() -
                new Date(a.measuredAt ?? a.sessionVitalSignId).getTime()
              )
              .map((vs) => (
                <VitalSignRow
                  key={vs.sessionVitalSignId}
                  vs={vs}
                  canDelete={isInProgress}
                  onDelete={() => setDeleteTarget(vs)}
                />
              ))
          )}
        </div>
      </div>

      {/* Confirm Dialog Hapus */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Record Tanda Vital"
        description="Yakin ingin menghapus record tanda vital ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="destructive"
        onConfirm={() =>
          deleteTarget && deleteMutation.mutate(deleteTarget.sessionVitalSignId)
        }
        isLoading={deleteMutation.isPending}
      />
    </RoleGuard>
  );
}

/* ─── Sub-komponen Row ──────────────────────────────────────────────────────── */

function VitalSignRow({
  vs, canDelete, onDelete,
}: {
  vs: VitalSign;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const metrics: { label: string; value: string | null; unit: string; color: string }[] = [
    {
      label: 'Nadi',
      value: vs.nadi !== null ? String(vs.nadi) : null,
      unit: 'bpm',
      color: 'text-teal-600 dark:text-teal-400',
    },
    {
      label: 'Tensi',
      value:
        vs.tensiSistolik !== null && vs.tensiDiastolik !== null
          ? `${vs.tensiSistolik}/${vs.tensiDiastolik}`
          : null,
      unit: 'mmHg',
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      label: 'PI',
      value: vs.pi !== null ? String(parseFloat(vs.pi)) : null,
      unit: '%',
      color: 'text-violet-600 dark:text-violet-400',
    },
  ];

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
      {/* Waktu */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
        <Clock className="h-3 w-3" />
        {vs.measuredAt ? formatDateTime(vs.measuredAt) : '—'}
      </div>

      {/* Nilai */}
      <div className="flex flex-wrap gap-4 flex-1">
        {metrics.map((m) => (
          <div key={m.label} className="text-center">
            <p className={`text-sm font-semibold ${m.color}`}>
              {m.value ?? '—'}
            </p>
            <p className="text-xs text-muted-foreground">
              {m.label} <span className="text-slate-400">{m.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Hapus */}
      {canDelete && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
