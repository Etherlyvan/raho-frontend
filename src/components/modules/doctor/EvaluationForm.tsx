"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { evaluationApi } from "@/lib/api/endpoints/evaluation";
import { getApiErrorMessage } from "@/lib/utils";
import type { SessionEvaluation, EvaluationProgress } from "@/types";

const planChangeSchema = z.object({
  field: z.string().min(1, "Field wajib diisi"),
  from: z.string().min(1, "Nilai sebelumnya wajib diisi"),
  to: z.string().min(1, "Nilai baru wajib diisi"),
  reason: z.string().min(1, "Alasan perubahan wajib diisi"),
});

const evaluationSchema = z.object({
  condition: z.string().optional(),
  progress: z.enum(["IMPROVING", "STABLE", "DECLINING"]).optional(),
  recommendation: z.string().optional(),
  planChanges: z.array(planChangeSchema).default([]),
});

type FormValues = z.infer<typeof evaluationSchema>;

const PROGRESS_OPTIONS: { value: EvaluationProgress; label: string; color: string }[] = [
  { value: "IMPROVING", label: "Membaik", color: "text-emerald-600" },
  { value: "STABLE", label: "Stabil", color: "text-sky-600" },
  { value: "DECLINING", label: "Memburuk", color: "text-red-600" },
];

interface Props {
  sessionId: string;
  existing?: SessionEvaluation | null;
  onSuccess?: () => void;
}

export function EvaluationForm({ sessionId, existing, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const isEdit = !!existing;

  const form = useForm<FormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      condition: existing?.condition ?? "",
      progress: (existing?.progress as EvaluationProgress) ?? undefined,
      recommendation: existing?.recommendation ?? "",
      planChanges: existing?.planChanges ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "planChanges",
  });

  useEffect(() => {
    if (existing) {
      form.reset({
        condition: existing.condition ?? "",
        progress: existing.progress as EvaluationProgress,
        recommendation: existing.recommendation ?? "",
        planChanges: existing.planChanges ?? [],
      });
    }
  }, [existing, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        condition: values.condition || undefined,
        progress: values.progress,
        recommendation: values.recommendation || undefined,
        planChanges: values.planChanges.length > 0 ? values.planChanges : undefined,
      };
      return isEdit
        ? evaluationApi.update(sessionId, payload)
        : evaluationApi.create(sessionId, payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Evaluasi berhasil diperbarui" : "Evaluasi berhasil disimpan");
      queryClient.invalidateQueries({ queryKey: ["evaluation", sessionId] });
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Gagal menyimpan evaluasi"));
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-6"
      >
        {/* Kondisi & Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Kondisi Pasien</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Deskripsi kondisi pasien setelah sesi..."
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Progress</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih progress" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PROGRESS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className={`font-medium ${opt.color}`}>{opt.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recommendation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rekomendasi</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Rekomendasi tindak lanjut..."
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Perubahan Plan — Dynamic List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Perubahan Rencana Terapi
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Catat setiap perubahan dari rencana terapi sebelumnya
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ field: "", from: "", to: "", reason: "" })
              }
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Tambah Perubahan
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
              Tidak ada perubahan rencana. Klik &quot;Tambah Perubahan&quot; jika ada.
            </p>
          )}

          {fields.map((fieldItem, index) => (
            <div
              key={fieldItem.id}
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3 relative"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Perubahan #{index + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-600"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name={`planChanges.${index}.field`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Field <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: hhoMl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`planChanges.${index}.from`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Dari <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nilai sebelumnya" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`planChanges.${index}.to`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Menjadi <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nilai baru" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`planChanges.${index}.reason`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Alasan Perubahan <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Jelaskan alasan perubahan ini..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? "Menyimpan..."
              : isEdit
              ? "Perbarui Evaluasi"
              : "Simpan Evaluasi"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
