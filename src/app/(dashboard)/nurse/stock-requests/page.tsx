'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ShoppingCart, Plus, Clock, CheckCircle2,
  XCircle, Package, ChevronDown, ChevronUp,
} from 'lucide-react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage, FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { InventoryItemSelect } from '@/components/modules/nurse/material/InventoryItemSelect';
import { stockRequestApi } from '@/lib/api/endpoints/stockRequests';
import { inventoryApi } from '@/lib/api/endpoints/inventory';
import { useAuthStore } from '@/store/auth.store';
import {
  formatDate, getApiErrorMessage,
} from '@/lib/utils';
import type {
  RequestStatus, StockRequest, InventoryItem,
} from '@/types';

/* ─── Status Config ─────────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: {
    label: 'Menunggu',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    icon: Clock,
  },
  APPROVED: {
    label: 'Disetujui',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Ditolak',
    color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    icon: XCircle,
  },
  FULFILLED: {
    label: 'Terpenuhi',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    icon: Package,
  },
};

const STATUS_FILTER_OPTIONS: { label: string; value: RequestStatus | 'ALL' }[] = [
  { label: 'Semua Status',  value: 'ALL'       },
  { label: 'Menunggu',      value: 'PENDING'   },
  { label: 'Disetujui',     value: 'APPROVED'  },
  { label: 'Ditolak',       value: 'REJECTED'  },
  { label: 'Terpenuhi',     value: 'FULFILLED' },
];

/* ─── Schema Form ───────────────────────────────────────────────────────────── */
const schema = z.object({
  inventoryItemId: z.string().min(1, 'Pilih item inventori'),
  quantity:        z.number({ invalid_type_error: 'Masukkan jumlah' }).positive('Harus > 0'),
  reason:          z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

/* ─── Page Component ────────────────────────────────────────────────────────── */

export default function NurseStockRequestsPage() {
  const user         = useAuthStore((s) => s.user);
  const queryClient  = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [showForm, setShowForm]         = useState(false);

  /* ── Fetch Stock Requests milik nurse ini ── */
  const { data, isLoading } = useQuery({
    queryKey: ['stock-requests', 'nurse', statusFilter],
    queryFn: async () => {
      const res = await stockRequestApi.list({
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        limit: 50,
      });
      return res.data.data as StockRequest[];
    },
    enabled: !!user,
  });

  /* ── Fetch inventory untuk combobox ── */
  const { data: inventoryItems } = useQuery({
    queryKey: ['inventory', 'list', user?.branchId],
    queryFn: async () => {
      const res = await inventoryApi.list({
        branchId: user?.branchId ?? '',
        isActive: true,
        limit: 100,
      });
      return res.data.data as InventoryItem[];
    },
    enabled: !!user?.branchId,
  });

  /* ── Form ── */
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      inventoryItemId: '',
      quantity: undefined as unknown as number,
      reason: '',
    },
  });

  const watchedItemId = form.watch('inventoryItemId');
  const selectedItem  = inventoryItems?.find(
    (i) => i.inventoryItemId === watchedItemId
  ) ?? null;

  /* ── Create Mutation ── */
  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      stockRequestApi.create({
        inventoryItemId: values.inventoryItemId,
        quantity:        values.quantity,
        reason:          values.reason || undefined,
      }),
    onSuccess: () => {
      toast.success('Permintaan stok berhasil dibuat. Admin akan meninjau permintaan Anda.');
      form.reset({ inventoryItemId: '', quantity: undefined as unknown as number, reason: '' });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['stock-requests', 'nurse'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'nurse'] });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, 'Gagal membuat permintaan stok')),
  });

  const requests = data ?? [];

  /* ── Summary badge counts ── */
  const pendingCount   = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount  = requests.filter((r) => r.status === 'APPROVED').length;

  return (
    <RoleGuard roles={['NURSE']}>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <PageHeader
            title="Permintaan Stok"
            description="Ajukan permintaan bahan atau alat ke Admin cabang."
          />
          <Button
            className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white border-0"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1.5" />
                Tutup Form
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1.5" />
                Buat Permintaan
              </>
            )}
          </Button>
        </div>

        {/* ── Summary Mini Badges ── */}
        {!isLoading && requests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pendingCount > 0 && (
              <Badge
                variant="outline"
                className="border-0 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              >
                {pendingCount} menunggu review
              </Badge>
            )}
            {approvedCount > 0 && (
              <Badge
                variant="outline"
                className="border-0 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              >
                {approvedCount} disetujui
              </Badge>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            Form Buat Permintaan Stok — Fix Gap 7
            POST /stock-requests
            ════════════════════════════════════════════════════════ */}
        {showForm && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-teal-500" />
                Buat Permintaan Stok Baru
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((v) => createMutation.mutate(v))}
                  className="space-y-4"
                >
                  {/* Item Inventori */}
                  <FormField
                    control={form.control}
                    name="inventoryItemId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Item yang Diminta <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <InventoryItemSelect
                            branchId={user?.branchId ?? ''}
                            value={field.value}
                            onChange={(item: InventoryItem | null) => {
                              field.onChange(item?.inventoryItemId ?? '');
                            }}
                          />
                        </FormControl>
                        {selectedItem && (
                          <FormDescription className="text-xs">
                            Stok saat ini:{' '}
                            <span
                              className={
                                selectedItem.stock <= selectedItem.minThreshold
                                  ? 'text-red-500 font-medium'
                                  : 'text-slate-600 dark:text-slate-400 font-medium'
                              }
                            >
                              {selectedItem.stock} {selectedItem.unit}
                            </span>
                            {selectedItem.stock <= selectedItem.minThreshold && (
                              <span className="text-red-500 ml-1">
                                — di bawah minimum threshold
                              </span>
                            )}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Jumlah */}
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Jumlah yang Diminta <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0.01}
                              placeholder="10"
                              className="text-sm"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ''
                                    ? undefined
                                    : e.target.valueAsNumber
                                )
                              }
                            />
                          </FormControl>
                          {selectedItem && (
                            <FormDescription className="text-xs">
                              Satuan: {selectedItem.unit}
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Alasan */}
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Alasan Permintaan</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Jelaskan alasan kebutuhan stok tambahan..."
                              className="resize-none h-20 text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Opsional — membantu Admin memproses lebih cepat
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={createMutation.isPending || !watchedItemId}
                      className="bg-teal-600 hover:bg-teal-700 text-white border-0"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1.5" />
                      {createMutation.isPending ? 'Mengirim...' : 'Kirim Permintaan'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { form.reset(); setShowForm(false); }}
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* ── Filter Status ── */}
        <div className="flex items-center gap-3">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as RequestStatus | 'ALL')}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            {requests.length} permintaan
          </span>
        </div>

        {/* ── Daftar Permintaan ── */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Belum ada permintaan"
            description={
              statusFilter !== 'ALL'
                ? `Tidak ada permintaan dengan status "${STATUS_CONFIG[statusFilter as RequestStatus]?.label}".`
                : 'Belum ada permintaan stok yang pernah Anda buat.'
            }
          />
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <StockRequestRow key={req.stockRequestId} request={req} />
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

/* ─── Sub-komponen Row ──────────────────────────────────────────────────────── */

function StockRequestRow({ request }: { request: StockRequest }) {
  const cfg = STATUS_CONFIG[request.status];
  const Icon = cfg.icon;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
      {/* Icon + Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="rounded-lg p-2 bg-slate-100 dark:bg-slate-800 shrink-0">
          <Package className="h-4 w-4 text-slate-500" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
            {request.item.name}
          </p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              {request.quantity} {request.item.unit}
            </span>
            {request.reason && (
              <span className="text-xs text-muted-foreground truncate max-w-48">
                {request.reason}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDate(request.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <Badge
        variant="outline"
        className={`shrink-0 border-0 text-xs flex items-center gap-1 ${cfg.color}`}
      >
        <Icon className="h-3 w-3" />
        {cfg.label}
      </Badge>
    </div>
  );
}
