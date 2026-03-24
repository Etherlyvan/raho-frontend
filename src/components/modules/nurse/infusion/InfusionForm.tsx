'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, Pencil } from 'lucide-react';
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage, FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DeviationAlert, hasDeviationFrom } from './DeviationAlert';
import { infusionApi } from '@/lib/api/endpoints/infusion';
import { getApiErrorMessage } from '@/lib/utils';
import type { InfusionExecution, TherapyPlan, JenisBotol } from '@/types';

/* ─── Schema ───────────────────────────────────────────────────────────────── */
const schema = z.object({
  ifaMgActual:           z.number({ invalid_type_error: 'Masukkan angka' }).nonnegative().optional(),
  hhoMlActual:           z.number({ invalid_type_error: 'Masukkan angka' }).nonnegative().optional(),
  h2MlActual:            z.number({ invalid_type_error: 'Masukkan angka' }).nonnegative().optional(),
  noMlActual:            z.number({ invalid_type_error: 'Masukkan angka' }).nonnegative().optional(),
  gasoMlActual:          z.number({ invalid_type_error: 'Masukkan angka' }).nonnegative().optional(),
  o2MlActual:            z.number({ invalid_type_error: 'Masukkan angka' }).nonnegative().optional(),
  tglProduksiCairan:     z.string().optional(),
  jenisBotol:            z.enum(['IFA', 'EDTA']).optional(),
  jenisCairan:           z.string().optional(),
  volumeCarrierMl:       z.number({ invalid_type_error: 'Masukkan angka' }).int().positive().optional(),
  jumlahPenggunaanJarum: z.number({ invalid_type_error: 'Masukkan angka' }).int().positive().optional(),
  deviationNote:         z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

/* ─── Helper konversi default values dari existing execution ────────────────── */
function executionToDefaults(exec: InfusionExecution | null): FormValues {
  if (!exec) {
    return {
      ifaMgActual: undefined,
      hhoMlActual: undefined,
      h2MlActual: undefined,
      noMlActual: undefined,
      gasoMlActual: undefined,
      o2MlActual: undefined,
      tglProduksiCairan: '',
      jenisBotol: undefined,
      jenisCairan: '',
      volumeCarrierMl: undefined,
      jumlahPenggunaanJarum: undefined,
      deviationNote: '',
    };
  }
  return {
    ifaMgActual:           exec.ifaMgActual           ?? undefined,
    hhoMlActual:           exec.hhoMlActual           ?? undefined,
    h2MlActual:            exec.h2MlActual            ?? undefined,
    noMlActual:            exec.noMlActual            ?? undefined,
    gasoMlActual:          exec.gasoMlActual          ?? undefined,
    o2MlActual:            exec.o2MlActual            ?? undefined,
    tglProduksiCairan:     exec.tglProduksiCairan
      ? exec.tglProduksiCairan.split('T')[0]
      : '',
    jenisBotol:            (exec.jenisBotol as JenisBotol) ?? undefined,
    jenisCairan:           exec.jenisCairan            ?? '',
    volumeCarrierMl:       exec.volumeCarrierMl        ?? undefined,
    jumlahPenggunaanJarum: exec.jumlahPenggunaanJarum  ?? undefined,
    deviationNote:         exec.deviationNote          ?? '',
  };
}

/* ─── Dosis Field Config ────────────────────────────────────────────────────── */
const DOSIS_FIELDS: {
  name: keyof FormValues;
  label: string;
  unit: string;
  planKey: keyof TherapyPlan;
  placeholder: string;
}[] = [
  { name: 'ifaMgActual',  label: 'IFA',  unit: 'mg', planKey: 'ifaMg',  placeholder: '0' },
  { name: 'hhoMlActual',  label: 'HHO',  unit: 'mL', planKey: 'hhoMl',  placeholder: '0' },
  { name: 'h2MlActual',   label: 'H₂',   unit: 'mL', planKey: 'h2Ml',   placeholder: '0' },
  { name: 'noMlActual',   label: 'NO',   unit: 'mL', planKey: 'noMl',   placeholder: '0' },
  { name: 'gasoMlActual', label: 'GasO', unit: 'mL', planKey: 'gasoMl', placeholder: '0' },
  { name: 'o2MlActual',   label: 'O₂',   unit: 'mL', planKey: 'o2Ml',   placeholder: '0' },
];

/* ─── Komponen ──────────────────────────────────────────────────────────────── */

interface Props {
  sessionId: string;
  /** null = belum ada → mode CREATE (POST) */
  existing: InfusionExecution | null;
  /** Untuk perbandingan deviasi real-time */
  therapyPlan: TherapyPlan | null;
}

export function InfusionForm({ sessionId, existing, therapyPlan }: Props) {
  const queryClient = useQueryClient();
  const isEdit      = !!existing;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: executionToDefaults(existing),
  });

  /* Sync ulang jika existing berubah (setelah create pertama kali) */
  useEffect(() => {
    form.reset(executionToDefaults(existing));
  }, [existing?.infusionExecutionId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Watch untuk DeviationAlert ── */
  const watchedValues = form.watch();
  const deviation     = hasDeviationFrom(watchedValues, therapyPlan);
  const deviationNote = form.watch('deviationNote') ?? '';

  /* ── Mutation ── */
  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        ...values,
        tglProduksiCairan: values.tglProduksiCairan
          ? new Date(values.tglProduksiCairan).toISOString()
          : undefined,
        deviationNote: values.deviationNote || undefined,
      };
      return isEdit
        ? infusionApi.update(sessionId, payload)
        : infusionApi.create(sessionId, payload);
    },
    onSuccess: () => {
      toast.success(
        isEdit
          ? 'Data infus berhasil diperbarui.'
          : 'Data infus aktual berhasil disimpan.'
      );
      queryClient.invalidateQueries({ queryKey: ['infusion', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['session-detail', sessionId] });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, 'Gagal menyimpan data infus')),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-5"
      >
        {/* ── Deviation Alert (real-time) ── */}
        <DeviationAlert
          hasDeviation={deviation}
          deviationNoteValue={deviationNote}
        />

        {/* ── Dosis Aktual ── */}
        <Card size="sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Dosis Aktual</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {DOSIS_FIELDS.map(({ name, label, unit, planKey, placeholder }) => {
                const planVal = therapyPlan
                  ? (therapyPlan[planKey] as number | null)
                  : null;
                return (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => {
                      const actualVal = field.value as number | undefined;
                      const isDiff =
                        planVal !== null &&
                        planVal !== undefined &&
                        actualVal !== undefined &&
                        actualVal !== planVal;

                      return (
                        <FormItem>
                          <FormLabel className="text-xs">
                            {label}{' '}
                            <span className="text-muted-foreground font-normal">
                              ({unit})
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder={
                                planVal !== null && planVal !== undefined
                                  ? String(planVal)
                                  : placeholder
                              }
                              className={
                                isDiff
                                  ? 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30 focus-visible:ring-amber-400'
                                  : ''
                              }
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
                          {planVal !== null && planVal !== undefined && (
                            <FormDescription className="text-xs">
                              Rencana: {planVal} {unit}
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Detail Fisik Infus ── */}
        <Card size="sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Detail Fisik Infus</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Jenis Botol */}
              <FormField
                control={form.control}
                name="jenisBotol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Jenis Botol</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis botol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IFA">IFA</SelectItem>
                        <SelectItem value="EDTA">EDTA</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Jenis Cairan */}
              <FormField
                control={form.control}
                name="jenisCairan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Jenis Cairan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: NaCl 0.9%"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tgl Produksi Cairan */}
              <FormField
                control={form.control}
                name="tglProduksiCairan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Tgl Produksi Cairan</FormLabel>
                    <FormControl>
                      <Input type="date" className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Volume Carrier */}
              <FormField
                control={form.control}
                name="volumeCarrierMl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Volume Carrier{' '}
                      <span className="text-muted-foreground font-normal">(mL)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="250"
                        className="text-sm"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? undefined
                              : parseInt(e.target.value, 10)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Jumlah Penggunaan Jarum */}
              <FormField
                control={form.control}
                name="jumlahPenggunaanJarum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Penggunaan Jarum (×)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="1"
                        className="text-sm"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? undefined
                              : parseInt(e.target.value, 10)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Catatan Deviasi — wajib jika ada deviasi ── */}
        <FormField
          control={form.control}
          name="deviationNote"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-sm ${deviation ? 'text-amber-700 dark:text-amber-400' : ''}`}>
                Catatan Deviasi
                {deviation && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    deviation
                      ? 'Jelaskan alasan penyimpangan dosis dari rencana dokter...'
                      : 'Opsional — isi jika ada catatan tambahan terkait pelaksanaan infus'
                  }
                  className={`resize-none h-24 ${
                    deviation && !deviationNote.trim()
                      ? 'border-red-400 dark:border-red-600 focus-visible:ring-red-400'
                      : deviation && deviationNote.trim()
                      ? 'border-amber-400 dark:border-amber-600 focus-visible:ring-amber-400'
                      : ''
                  }`}
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs">
                {deviation
                  ? 'Wajib diisi karena terdapat perbedaan antara dosis aktual dan rencana terapi.'
                  : 'Diisi jika ada keterangan tambahan pelaksanaan.'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Submit ── */}
        <div className="flex items-center gap-3 pt-1">
          <Button
            type="submit"
            size="sm"
            disabled={mutation.isPending || (deviation && !deviationNote.trim())}
            className={
              isEdit
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-0'
                : 'bg-teal-600 hover:bg-teal-700 text-white border-0'
            }
          >
            {isEdit ? (
              <Pencil className="h-4 w-4 mr-1.5" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            {mutation.isPending
              ? 'Menyimpan...'
              : isEdit
              ? 'Perbarui Data Infus'
              : 'Simpan Data Infus'}
          </Button>

          {deviation && !deviationNote.trim() && (
            <p className="text-xs text-red-600 dark:text-red-400">
              Isi catatan deviasi untuk dapat menyimpan.
            </p>
          )}
        </div>
      </form>
    </Form>
  );
}
