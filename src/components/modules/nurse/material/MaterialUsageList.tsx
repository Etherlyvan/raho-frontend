'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2, Package, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { materialUsagesApi } from '@/lib/api/endpoints/materialUsages';
import { inventoryApi } from '@/lib/api/endpoints/inventory';
import { formatDateTime, getApiErrorMessage } from '@/lib/utils';
import type { MaterialUsage, InventoryCategory } from '@/types';
import { useQueryClient as useQC } from '@tanstack/react-query';

const CATEGORY_LABEL: Record<InventoryCategory, string> = {
  MEDICINE:   'Obat',
  DEVICE:     'Alat',
  CONSUMABLE: 'Habis Pakai',
};

const CATEGORY_COLOR: Record<InventoryCategory, string> = {
  MEDICINE:   'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  DEVICE:     'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  CONSUMABLE: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

interface Props {
  sessionId: string;
  branchId:  string;
  data:      MaterialUsage[];
  isLoading: boolean;
  canDelete: boolean;  // true hanya saat INPROGRESS
}

export function MaterialUsageList({
  sessionId,
  branchId,
  data,
  isLoading,
  canDelete,
}: Props) {
  const queryClient              = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<MaterialUsage | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (muId: string) =>
      materialUsagesApi.remove(sessionId, muId),
    onSuccess: () => {
      toast.success('Pemakaian bahan dihapus. Stok telah dikembalikan.');
      queryClient.invalidateQueries({ queryKey: ['material-usages', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'list', branchId] });
      queryClient.invalidateQueries({ queryKey: ['session-detail', sessionId] });
      setDeleteTarget(null);
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, 'Gagal menghapus pemakaian bahan')),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Belum ada pemakaian"
        description="Belum ada bahan atau alat yang dicatat untuk sesi ini."
      />
    );
  }

  /* Hitung total per kategori untuk summary */
  const byCategory = data.reduce<Record<string, number>>(
    (acc, m) => {
      acc[m.item.category] = (acc[m.item.category] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <>
      {/* ── Summary Bar ── */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <span className="text-xs text-muted-foreground">
          {data.length} item tercatat
        </span>
        {Object.entries(byCategory).map(([cat, count]) => (
          <Badge
            key={cat}
            variant="outline"
            className={`border-0 text-xs ${CATEGORY_COLOR[cat as InventoryCategory] ?? ''}`}
          >
            {CATEGORY_LABEL[cat as InventoryCategory] ?? cat}: {count}
          </Badge>
        ))}
      </div>

      {/* ── List ── */}
      <div className="space-y-2">
        {data.map((usage) => (
          <MaterialUsageRow
            key={usage.materialUsageId}
            usage={usage}
            canDelete={canDelete}
            onDelete={() => setDeleteTarget(usage)}
          />
        ))}
      </div>

      {/* ── Confirm Dialog Hapus ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Pemakaian Bahan"
        description={
          `Yakin ingin menghapus pemakaian "${deleteTarget?.item.name}" ` +
          `(${deleteTarget?.quantity} ${deleteTarget?.unit})? ` +
          `Stok akan dikembalikan secara otomatis.`
        }
        confirmLabel="Hapus & Kembalikan Stok"
        variant="destructive"
        onConfirm={() =>
          deleteTarget &&
          deleteMutation.mutate(deleteTarget.materialUsageId)
        }
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

/* ─── Sub-komponen Row ──────────────────────────────────────────────────────── */

function MaterialUsageRow({
  usage,
  canDelete,
  onDelete,
}: {
  usage: MaterialUsage;
  canDelete: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
      {/* Icon + Info Item */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="rounded-lg p-2 bg-slate-100 dark:bg-slate-800 shrink-0">
          <Package className="h-4 w-4 text-slate-500" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {usage.item.name}
            </p>
            <Badge
              variant="outline"
              className={`shrink-0 border-0 text-xs h-4 ${CATEGORY_COLOR[usage.item.category]}`}
            >
              {CATEGORY_LABEL[usage.item.category]}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {/* Jumlah */}
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              {usage.quantity} {usage.unit}
            </span>
            {/* Sisa stok item */}
            <span className="text-xs text-muted-foreground">
              Sisa stok: {usage.item.stock} {usage.item.unit}
            </span>
            {/* Dicatat oleh */}
            {usage.inputByUser.profile?.fullName && (
              <span className="text-xs text-muted-foreground">
                oleh {usage.inputByUser.profile.fullName}
              </span>
            )}
            {/* Waktu */}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDateTime(usage.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Hapus */}
      {canDelete && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 shrink-0"
          onClick={onDelete}
          title="Hapus pemakaian & kembalikan stok"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
