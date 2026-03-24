'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Clock, Play, CheckCircle2, ArrowRight, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SessionStatusBadge } from '@/components/shared/StatusBadge';
import { sessionApi } from '@/lib/api/endpoints/sessions';
import { formatDateTime, getApiErrorMessage } from '@/lib/utils';
import type { NurseScheduleItem } from '@/types';

interface Props {
  sessions: NurseScheduleItem[];
  isLoading: boolean;
}

export function ActiveSessionList({ sessions, isLoading }: Props) {
  const queryClient = useQueryClient();
  const [startTarget, setStartTarget] = useState<NurseScheduleItem | null>(null);

  const startMutation = useMutation({
    mutationFn: (sessionId: string) => sessionApi.start(sessionId),
    onSuccess: (_, sessionId) => {
      toast.success('Sesi berhasil dimulai. Anda dapat mengisi tanda vital dan infus sekarang.');
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'nurse'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setStartTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal memulai sesi')),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Jadwal Hari Ini</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-500" />
            Jadwal Hari Ini
          </CardTitle>
          <CardAction>
            <Button variant="ghost" size="xs" asChild>
              <Link href="/dashboard/nurse/sessions">
                Lihat Semua
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="pt-0 space-y-2">
          {sessions.length === 0 ? (
            <EmptyState
              title="Tidak ada sesi hari ini"
              description="Belum ada sesi terjadwal atau semua sesi sudah selesai."
            />
          ) : (
            sessions.map((session) => (
              <SessionRow
                key={session.treatmentSessionId}
                session={session}
                onStartRequest={setStartTarget}
              />
            ))
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!startTarget}
        onOpenChange={(open) => !open && setStartTarget(null)}
        title="Mulai Sesi Treatment"
        description={
          `Yakin ingin memulai sesi untuk ${startTarget?.encounter.member.fullName ?? 'pasien ini'}? ` +
          `Pastikan therapy plan dari dokter sudah tersedia sebelum memulai.`
        }
        confirmLabel="Mulai Sesi"
        variant="default"
        onConfirm={() =>
          startTarget && startMutation.mutate(startTarget.treatmentSessionId)
        }
        isLoading={startMutation.isPending}
      />
    </>
  );
}

// ─── Sub-komponen Row ──────────────────────────────────────────────────────────

interface SessionRowProps {
  session: NurseScheduleItem;
  onStartRequest: (session: NurseScheduleItem) => void;
}

function SessionRow({ session, onStartRequest }: SessionRowProps) {
  const basePath = '/dashboard/nurse';
  const isInProgress = session.status === 'IN_PROGRESS';
  const isPlanned = session.status === 'PLANNED';

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors ${
        isInProgress
          ? 'border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/30'
          : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      {/* Info Pasien */}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
          {session.encounter.member.fullName}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="font-mono text-xs text-slate-400">
            {session.encounter.member.memberNo}
          </span>
          <span className="text-xs text-slate-400">
            {session.encounter.branch.name}
          </span>
          {session.infusKe !== null && (
            <Badge
              variant="outline"
              className="text-xs border-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 h-4"
            >
              Infus ke-{session.infusKe}
            </Badge>
          )}
          {session.startedAt && (
            <span className="text-xs text-teal-600 dark:text-teal-400">
              Mulai: {formatDateTime(session.startedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Status + Aksi */}
      <div className="flex items-center gap-2 shrink-0">
        <SessionStatusBadge status={session.status} />

        {isPlanned && (
          <Button
            size="xs"
            className="bg-teal-600 hover:bg-teal-700 text-white border-0"
            onClick={() => onStartRequest(session)}
          >
            <Play className="h-3 w-3 mr-1" />
            Mulai
          </Button>
        )}

        {isInProgress && (
          <Button size="xs" variant="outline" asChild>
            <Link href={`${basePath}/sessions/${session.treatmentSessionId}`}>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Lanjutkan
            </Link>
          </Button>
        )}

        {session.status === 'COMPLETED' && (
          <Button size="xs" variant="ghost" asChild>
            <Link href={`${basePath}/sessions/${session.treatmentSessionId}`}>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        )}

        {session.status === 'POSTPONED' && (
          <Button size="xs" variant="ghost" className="text-amber-600" asChild>
            <Link href={`${basePath}/sessions/${session.treatmentSessionId}`}>
              <AlertCircle className="h-3 w-3" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
