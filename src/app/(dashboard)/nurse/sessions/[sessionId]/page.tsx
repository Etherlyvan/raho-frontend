'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ArrowLeft, Activity, Droplets, Package,
  Camera, FileText, Play, CheckCircle2, AlertTriangle,
  Plus, Trash2, ChevronRight,
} from 'lucide-react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/shared/PageHeader';
import { SessionStatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TherapyPlanCard } from '@/components/modules/doctor/TherapyPlanCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage, FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { sessionApi } from '@/lib/api/endpoints/sessions';
import { formatDate, formatDateTime, formatRupiah, getApiErrorMessage } from '@/lib/utils';
import type { TreatmentSessionDetail, CompleteSessionPayload } from '@/types';

/* ─── Zod schema untuk Complete Session ────────────────────────────────────── */
const invoiceItemSchema = z.object({
  name:     z.string().min(1, 'Nama item wajib diisi'),
  quantity: z.number({ invalid_type_error: 'Masukkan angka' }).positive('Harus > 0'),
  price:    z.number({ invalid_type_error: 'Masukkan angka' }).nonnegative('Tidak boleh negatif'),
});

const completeSchema = z.object({
  keluhanSesudah:    z.string().optional(),
  berhasilInfus:     z.enum(['true', 'false'], { required_error: 'Wajib dipilih' }),
  healingCrisis:     z.string().optional(),
  nextTreatmentDate: z.string().optional(),
  invoiceAmount:     z.number({ invalid_type_error: 'Masukkan angka' }).positive('Jumlah harus > 0'),
  invoiceItems:      z.array(invoiceItemSchema).min(1, 'Minimal satu item invoice'),
  invoiceNotes:      z.string().optional(),
});

type CompleteFormValues = z.infer<typeof completeSchema>;

/* ─── Navigasi Sub-halaman ──────────────────────────────────────────────────── */
interface NavCard {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  count?: number;
  filled?: boolean;
  iconClass: string;
}

function buildNavCards(
  sessionId: string,
  session: TreatmentSessionDetail | null
): NavCard[] {
  const base = `/dashboard/nurse/sessions/${sessionId}`;
  return [
    {
      key: 'vital',
      label: 'Tanda Vital',
      description: 'Nadi, PI, tekanan darah',
      icon: Activity,
      href: `${base}/vital-signs`,
      count: session?._count.vitalSigns ?? 0,
      iconClass: 'text-teal-500',
    },
    {
      key: 'infus',
      label: 'Pelaksanaan Infus',
      description: 'Dosis aktual & deviasi',
      icon: Droplets,
      href: `${base}/infusion`,
      filled: !!session?.infusionExecution,
      iconClass: 'text-blue-500',
    },
    {
      key: 'material',
      label: 'Pemakaian Material',
      description: 'Bahan & alat terpakai',
      icon: Package,
      href: `${base}/materials`,
      count: session?._count.materialUsages ?? 0,
      iconClass: 'text-amber-500',
    },
    {
      key: 'foto',
      label: 'Foto Sesi',
      description: 'Before & after (perlu consent)',
      icon: Camera,
      href: `${base}/photos`,
      count: session?._count.photos ?? 0,
      iconClass: 'text-rose-500',
    },
    {
      key: 'emr',
      label: 'Catatan Operasional',
      description: 'Catatan EMR perawat',
      icon: FileText,
      href: `${base}/emr-notes`,
      count: session?._count.emrNotes ?? 0,
      iconClass: 'text-violet-500',
    },
  ];
}

/* ─── Page Component ────────────────────────────────────────────────────────── */

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function NurseSessionHubPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showStartDialog,    setShowStartDialog]    = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  /* ── Fetch Detail Sesi ── */
  const { data: session, isLoading, isError } = useQuery({
    queryKey: ['session-detail', sessionId],
    queryFn: async () => {
      const res = await sessionApi.detail(sessionId);
      return res.data.data as TreatmentSessionDetail;
    },
  });

  /* ── Start Mutation ── */
  const startMutation = useMutation({
    mutationFn: () => sessionApi.start(sessionId),
    onSuccess: () => {
      toast.success('Sesi berhasil dimulai.');
      queryClient.invalidateQueries({ queryKey: ['session-detail', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'nurse'] });
      setShowStartDialog(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal memulai sesi')),
  });

  /* ── Complete Form ── */
  const completeForm = useForm<CompleteFormValues>({
    resolver: zodResolver(completeSchema),
    defaultValues: {
      keluhanSesudah: '',
      berhasilInfus:  undefined,
      healingCrisis:  '',
      nextTreatmentDate: '',
      invoiceAmount:  undefined as unknown as number,
      invoiceItems:   [{ name: '', quantity: 1, price: 0 }],
      invoiceNotes:   '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: completeForm.control,
    name: 'invoiceItems',
  });

  /* ── Complete Mutation ── */
  const completeMutation = useMutation({
    mutationFn: (values: CompleteFormValues) => {
      const payload: CompleteSessionPayload = {
        keluhanSesudah:    values.keluhanSesudah || undefined,
        berhasilInfus:     values.berhasilInfus === 'true',
        healingCrisis:     values.healingCrisis || undefined,
        nextTreatmentDate: values.nextTreatmentDate || undefined,
        invoiceAmount:     values.invoiceAmount,
        invoiceItems:      values.invoiceItems,
        invoiceNotes:      values.invoiceNotes || undefined,
      };
      return sessionApi.complete(sessionId, payload);
    },
    onSuccess: () => {
      toast.success('Sesi berhasil diselesaikan. Invoice telah dibuat otomatis.');
      queryClient.invalidateQueries({ queryKey: ['session-detail', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'nurse'] });
      setShowCompleteDialog(false);
      router.push('/dashboard/nurse/sessions');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal menyelesaikan sesi')),
  });

  /* ── Invoice amount auto-sum ── */
  const watchedItems = completeForm.watch('invoiceItems');
  const autoTotal    = watchedItems.reduce(
    (sum, item) => sum + (item.quantity ?? 0) * (item.price ?? 0),
    0
  );

  /* ── Guard: sesi tidak ditemukan ── */
  if (!isLoading && isError) {
    return (
      <div className="p-6 text-center text-muted-foreground text-sm">
        Sesi tidak ditemukan atau Anda tidak memiliki akses.
      </div>
    );
  }

  const hasTherapyPlan = !!session?.therapyPlan;
  const navCards       = buildNavCards(sessionId, session ?? null);

  return (
    <RoleGuard roles={['NURSE']}>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/dashboard/nurse/sessions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
            ) : (
              <PageHeader
                title={session?.encounter.member.fullName ?? '—'}
                description={`Sesi Treatment · ${session ? formatDate(session.treatmentDate) : '—'} · ${session?.encounter.branch.name ?? '—'}`}
              />
            )}
          </div>
          {session && <SessionStatusBadge status={session.status} />}
        </div>

        {/* ── Warning: Therapy Plan Belum Ada ── */}
        {!isLoading && !hasTherapyPlan && session?.status === 'PLANNED' && (
          <div className="rounded-lg border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Rencana Terapi Belum Tersedia
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                Dokter belum membuat therapy plan. Sesi tidak dapat dimulai sebelum rencana terapi tersedia.
              </p>
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        {session && (
          <div className="flex flex-wrap gap-3">
            {session.status === 'PLANNED' && (
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white border-0"
                disabled={!hasTherapyPlan}
                onClick={() => setShowStartDialog(true)}
              >
                <Play className="h-4 w-4 mr-1.5" />
                Mulai Sesi
              </Button>
            )}
            {session.status === 'IN_PROGRESS' && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                onClick={() => setShowCompleteDialog(true)}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Selesaikan Sesi
              </Button>
            )}
          </div>
        )}

        {/* ── Navigasi Sub-halaman ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {navCards.map((card) => (
            <Link key={card.key} href={card.href}>
              <Card
                size="sm"
                className="cursor-pointer hover:border-teal-200 dark:hover:border-teal-800 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-colors"
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`rounded-lg p-2 bg-slate-100 dark:bg-slate-800`}>
                    <card.icon className={`h-4 w-4 ${card.iconClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {card.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {card.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isLoading ? (
                      <Skeleton className="h-5 w-8 rounded-full" />
                    ) : card.filled !== undefined ? (
                      <Badge
                        variant="outline"
                        className={`text-xs border-0 ${
                          card.filled
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {card.filled ? 'Terisi' : 'Kosong'}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs border-0 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      >
                        {card.count ?? 0}
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* ── Therapy Plan (read-only) ── */}
        {session?.therapyPlan ? (
          <TherapyPlanCard plan={session.therapyPlan} />
        ) : (
          !isLoading && (
            <Card size="sm">
              <CardContent className="p-4 text-sm text-center text-muted-foreground">
                Rencana terapi belum dibuat oleh dokter.
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Dialog: Mulai Sesi
          ══════════════════════════════════════════════════════════════════════ */}
      <ConfirmDialog
        open={showStartDialog}
        onOpenChange={setShowStartDialog}
        title="Mulai Sesi Treatment"
        description={`Yakin ingin memulai sesi untuk ${session?.encounter.member.fullName ?? 'pasien ini'}? Pastikan pasien sudah siap dan therapy plan sudah diperiksa.`}
        confirmLabel="Mulai Sekarang"
        variant="default"
        onConfirm={() => startMutation.mutate()}
        isLoading={startMutation.isPending}
      />

      {/* ══════════════════════════════════════════════════════════════════════
          Dialog: Selesaikan Sesi
          ══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selesaikan Sesi Treatment</DialogTitle>
            <DialogDescription>
              Isi ringkasan hasil sesi dan data invoice. Invoice akan dibuat otomatis setelah konfirmasi.
            </DialogDescription>
          </DialogHeader>

          <Form {...completeForm}>
            <form
              id="complete-session-form"
              onSubmit={completeForm.handleSubmit((v) => completeMutation.mutate(v))}
              className="space-y-5"
            >
              {/* Berhasil Infus */}
              <FormField
                control={completeForm.control}
                name="berhasilInfus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Berhasil Infus <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih hasil infus" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">✅ Berhasil</SelectItem>
                        <SelectItem value="false">❌ Tidak Berhasil</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Keluhan Sesudah */}
                <FormField
                  control={completeForm.control}
                  name="keluhanSesudah"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keluhan Sesudah Sesi</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Kondisi dan keluhan pasien setelah sesi..."
                          className="resize-none h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Healing Crisis */}
                <FormField
                  control={completeForm.control}
                  name="healingCrisis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Healing Crisis</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Catat jika ada reaksi healing crisis..."
                          className="resize-none h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Jadwal Berikutnya */}
              <FormField
                control={completeForm.control}
                name="nextTreatmentDate"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel>Jadwal Sesi Berikutnya</FormLabel>
                    <FormControl>
                      <Input type="date" className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ── Invoice Items ── */}
              <div className="space-y-3 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Item Invoice <span className="text-red-500">*</span>
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => append({ name: '', quantity: 1, price: 0 })}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Tambah Item
                  </Button>
                </div>

                <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-1">
                  <span className="col-span-5">Nama Item</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-3 text-right">Harga Satuan</span>
                  <span className="col-span-1" />
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                    <FormField
                      control={completeForm.control}
                      name={`invoiceItems.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="col-span-5">
                          <FormControl>
                            <Input placeholder="Nama item/jasa" className="text-sm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={completeForm.control}
                      name={`invoiceItems.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              placeholder="1"
                              className="text-sm text-center"
                              {...field}
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={completeForm.control}
                      name={`invoiceItems.${index}.price`}
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              placeholder="0"
                              className="text-sm text-right"
                              {...field}
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="col-span-1 flex justify-center pt-1">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Auto total */}
                <div className="flex justify-end pt-1 border-t border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-muted-foreground">
                    Subtotal:{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatRupiah(autoTotal)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Invoice Amount (final — bisa override auto-total) */}
              <FormField
                control={completeForm.control}
                name="invoiceAmount"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel>
                      Total Invoice <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder={String(autoTotal)}
                        className="text-sm"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Otomatis dari subtotal item. Ubah jika ada penyesuaian.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Invoice Notes */}
              <FormField
                control={completeForm.control}
                name="invoiceNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan Invoice</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Catatan tambahan untuk invoice (opsional)..."
                        className="resize-none h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <DialogFooter showCloseButton>
            <Button
              type="submit"
              form="complete-session-form"
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
              disabled={completeMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              {completeMutation.isPending ? 'Menyimpan...' : 'Selesaikan & Buat Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  );
}
