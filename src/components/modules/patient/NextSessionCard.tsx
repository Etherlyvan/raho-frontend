'use client';

import { CalendarDays, MapPin, Clock, Syringe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { PatientNextSession, PelaksanaanType } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PELAKSANAAN_LABEL: Record<PelaksanaanType, string> = {
  KLINIK: 'Di Klinik',
  HOMECARE: 'Home Care',
};

const PELAKSANAAN_COLOR: Record<PelaksanaanType, string> = {
  KLINIK:
    'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-0 text-xs',
  HOMECARE:
    'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border-0 text-xs',
};

// ---------------------------------------------------------------------------
// Sub-component: Countdown
// ---------------------------------------------------------------------------

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil(
    (new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function Countdown({ dateStr }: { dateStr: string }) {
  const days = daysUntil(dateStr);

  if (days < 0) {
    return (
      <span className="text-xs text-slate-400 dark:text-slate-500">
        Jadwal lewat
      </span>
    );
  }
  if (days === 0) {
    return (
      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        Hari ini
      </span>
    );
  }
  if (days === 1) {
    return (
      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
        Besok
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
      {days} hari lagi
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props {
  session: PatientNextSession;
}

export function NextSessionCard({ session }: Props) {
  const { encounter } = session;

  return (
    <Card className="border-sky-200 dark:border-sky-800 bg-sky-50/40 dark:bg-sky-950/20">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          {/* Kiri: icon + detail sesi */}
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-lg p-2.5 bg-sky-100 dark:bg-sky-950">
              <Syringe className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>

            <div className="space-y-1.5 min-w-0">
              {/* Judul sesi + tipe pelaksanaan */}
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Sesi Infus ke-{session.infusKe ?? '?'}
                </p>
                {session.pelaksanaan && (
                  <Badge className={PELAKSANAAN_COLOR[session.pelaksanaan]}>
                    {PELAKSANAAN_LABEL[session.pelaksanaan]}
                  </Badge>
                )}
              </div>

              {/* Tanggal */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {formatDate(session.treatmentDate, 'EEEE, dd MMM yyyy')}
                </span>
              </div>

              {/* Cabang */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {encounter.branch.name} — {encounter.branch.city}
                </span>
              </div>

              {/* Nama paket */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {encounter.memberPackage.packageName ??
                    encounter.memberPackage.packageType}
                </span>
              </div>
            </div>
          </div>

          {/* Kanan: countdown label */}
          <div className="shrink-0 text-right pt-0.5">
            <Countdown dateStr={session.treatmentDate} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
