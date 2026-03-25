'use client';

import { Package, CalendarDays, MapPin, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/shared/EmptyState';
import type { PatientActivePackage, PackageType } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PACKAGE_TYPE_LABEL: Record<PackageType, string> = {
  BASIC: 'Basic',
  BOOSTER: 'Booster',
};

const PACKAGE_TYPE_COLOR: Record<PackageType, string> = {
  BASIC:
    'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-0 text-xs',
  BOOSTER:
    'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border-0 text-xs',
};

/** Sisa hari hingga kadaluarsa */
function daysUntil(dateStr: string): number {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

// ---------------------------------------------------------------------------
// Sub-component: PackageCard
// ---------------------------------------------------------------------------

interface PackageCardProps {
  pkg: PatientActivePackage;
}

function PackageCard({ pkg }: PackageCardProps) {
  const progress =
    pkg.totalSessions > 0
      ? Math.min((pkg.usedSessions / pkg.totalSessions) * 100, 100)
      : 0;

  const daysLeft = pkg.expiredAt ? daysUntil(pkg.expiredAt) : null;
  const isNearExpiry = daysLeft !== null && daysLeft <= 7;
  const isExpired = daysLeft !== null && daysLeft <= 0;

  return (
    <Card className={isNearExpiry ? 'border-amber-300 dark:border-amber-700' : ''}>
      <CardContent className="pt-5 pb-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Package className="h-4 w-4 text-slate-400 shrink-0" />
            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
              {pkg.packageName ?? PACKAGE_TYPE_LABEL[pkg.packageType]}
            </p>
          </div>
          <Badge className={`shrink-0 ${PACKAGE_TYPE_COLOR[pkg.packageType]}`}>
            {PACKAGE_TYPE_LABEL[pkg.packageType]}
          </Badge>
        </div>

        {/* Progress bar sesi */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Sesi terpakai
            </span>
            <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
              {pkg.usedSessions}
              <span className="font-normal text-slate-400">
                /{pkg.totalSessions}
              </span>
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all bg-rose-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">
            <span className="font-medium text-slate-600 dark:text-slate-300">
              {pkg.remainingSessions}
            </span>{' '}
            sesi tersisa
          </p>
        </div>

        {/* Meta: cabang & expiry */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0" />
            {pkg.branch.name}
          </span>

          {pkg.expiredAt && (
            <span
              className={`flex items-center gap-1 shrink-0 ${
                isExpired
                  ? 'text-red-600 dark:text-red-400 font-medium'
                  : isNearExpiry
                    ? 'text-amber-600 dark:text-amber-400 font-medium'
                    : ''
              }`}
            >
              {isNearExpiry && (
                <AlertCircle className="h-3 w-3 shrink-0" />
              )}
              {!isNearExpiry && <CalendarDays className="h-3 w-3 shrink-0" />}
              {isExpired
                ? 'Kadaluarsa'
                : `Exp. ${formatDate(pkg.expiredAt)}`}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

export function ActivePackageListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-xl" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props {
  packages: PatientActivePackage[];
  isLoading?: boolean;
}

export function ActivePackageList({ packages, isLoading }: Props) {
  if (isLoading) return <ActivePackageListSkeleton />;

  if (packages.length === 0) {
    return (
      <EmptyState
        title="Tidak ada paket aktif"
        description="Anda belum memiliki paket treatment yang aktif. Hubungi klinik untuk informasi lebih lanjut."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {packages.map((pkg) => (
        <PackageCard key={pkg.memberPackageId} pkg={pkg} />
      ))}
    </div>
  );
}
