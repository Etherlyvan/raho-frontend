'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, PackageCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { inventoryApi } from '@/lib/api/endpoints/inventory';
import type { InventoryAlert } from '@/types';

const CATEGORY_COLOR: Record<string, string> = {
  MEDICINE:    'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  DEVICE:      'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  CONSUMABLE:  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const MAX_VISIBLE = 5;

export function CriticalStockWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'alerts', 'nurse-widget'],
    queryFn: async () => {
      const res = await inventoryApi.alerts();
      return res.data.data;
    },
    refetchInterval: 5 * 60 * 1000, // polling 5 menit
  });

  const alerts: InventoryAlert[] = data?.items ?? [];
  const visible = alerts.slice(0, MAX_VISIBLE);
  const overflow = alerts.length - MAX_VISIBLE;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          Stok Kritis
          {!isLoading && alerts.length > 0 && (
            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-bold">
              {alerts.length}
            </span>
          )}
        </CardTitle>
        <CardAction>
          <Button variant="ghost" size="xs" asChild>
            <Link href="/dashboard/nurse/inventory">
              Lihat Semua
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-0 space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))
        ) : alerts.length === 0 ? (
          <EmptyState
            icon={PackageCheck}
            title="Stok aman"
            description="Semua item di atas minimum threshold."
          />
        ) : (
          <>
            {visible.map((item) => (
              <AlertRow key={item.inventoryItemId} item={item} />
            ))}

            {overflow > 0 && (
              <p className="text-xs text-center text-muted-foreground pt-1">
                +{overflow} item lainnya —{' '}
                <Link
                  href="/dashboard/nurse/inventory"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  lihat semua
                </Link>
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Sub-komponen Row ──────────────────────────────────────────────────────────

function AlertRow({ item }: { item: InventoryAlert }) {
  const stockPct = item.minThreshold > 0
    ? Math.min((item.stock / item.minThreshold) * 100, 100)
    : 0;

  return (
    <div className="rounded-md border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-3 py-2 space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
          {item.name}
        </p>
        <Badge
          variant="outline"
          className={`shrink-0 border-0 text-xs ${CATEGORY_COLOR[item.category] ?? ''}`}
        >
          {item.category}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        {/* Progress bar stok vs threshold */}
        <div className="flex-1 h-1.5 rounded-full bg-red-200 dark:bg-red-900 overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full transition-all"
            style={{ width: `${stockPct}%` }}
          />
        </div>
        <span className="text-xs text-red-600 dark:text-red-400 whitespace-nowrap shrink-0">
          {item.stock} / {item.minThreshold} {item.unit}
        </span>
      </div>
    </div>
  );
}
