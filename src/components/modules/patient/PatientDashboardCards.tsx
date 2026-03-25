'use client';

import { Package, CalendarDays, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import type { PatientDashboard } from '@/types';

// ---------------------------------------------------------------------------
// Sub-component: StatCard
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: React.ElementType;
  accent: string;
}

function StatCard({ label, value, sub, icon: Icon, accent }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className={`shrink-0 rounded-lg p-2 ${accent}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              {label}
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {value}
            </p>
            {sub && (
              <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function PatientDashboardCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props {
  data: PatientDashboard;
  isLoading?: boolean;
}

export function PatientDashboardCards({ data, isLoading }: Props) {
  if (isLoading) return <PatientDashboardCardsSkeleton />;

  const { summary } = data;
  const next = summary.nextSession;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Paket Aktif */}
      <StatCard
        label="Paket Aktif"
        value={summary.activePackageCount}
        sub={
          summary.activePackageCount > 0
            ? `${summary.activePackageCount} paket berjalan`
            : 'Tidak ada paket aktif'
        }
        icon={Package}
        accent="bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
      />

      {/* Sesi Berikutnya */}
      <StatCard
        label="Sesi Berikutnya"
        value={next ? formatDate(next.treatmentDate) : '—'}
        sub={
          next
            ? `${next.encounter.branch.name} · Infus ke-${next.infusKe ?? '?'}`
            : 'Belum ada jadwal'
        }
        icon={CalendarDays}
        accent="bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400"
      />

      {/* Invoice Menunggu */}
      <StatCard
        label="Invoice Menunggu"
        value={summary.pendingInvoiceCount}
        sub={
          summary.pendingInvoiceCount > 0 ? 'perlu perhatian' : 'semua tagihan lunas'
        }
        icon={Receipt}
        accent={
          summary.pendingInvoiceCount > 0
            ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
        }
      />
    </div>
  );
}
