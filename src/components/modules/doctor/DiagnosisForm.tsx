"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { diagnosisApi } from "@/lib/api/endpoints/diagnoses";
import { getApiErrorMessage } from "@/lib/utils";
import type { Diagnosis, ICDClassification } from "@/types";

const diagnosisSchema = z.object({
  icdCode: z.string().min(1, "Kode ICD wajib diisi"),
  icdDescription: z.string().min(1, "Deskripsi ICD wajib diisi"),
  classification: z.enum(["primer", "sekunder", "tersier"], {
    errorMap: () => ({ message: "Pilih klasifikasi diagnosis" }),
  }),
  anamnesis: z.string().optional(),
  physicalExam: z.string().optional(),
  supportingExam: z.string().optional(),
  differentialDiagnosis: z.string().optional(),
  workingDiagnosis: z.string().optional(),
});

type FormValues = z.infer<typeof diagnosisSchema>;

const CLASSIFICATION_OPTIONS: { value: ICDClassification; label: string }[] = [
  { value: "primer", label: "Primer (Diagnosis Utama)" },
  { value: "sekunder", label: "Sekunder (Komorbiditas)" },
  { value: "tersier", label: "Tersier (Komplikasi)" },
];

interface Props {
  encounterId: string;
  existing?: Diagnosis;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DiagnosisForm({ encounterId, existing, onSuccess, onCancel }: Props) {
  const queryClient = useQueryClient();
  const isEdit = !!existing;

  const form = useForm<FormValues>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: {
      icdCode: existing?.icdCode ?? "",
      icdDescription: existing?.icdDescription ?? "",
      classification: (existing?.classification as ICDClassification) ?? undefined,
      anamnesis: existing?.anamnesis ?? "",
      physicalExam: existing?.physicalExam ?? "",
      supportingExam: existing?.supportingExam ?? "",
      differentialDiagnosis: existing?.differentialDiagnosis ?? "",
      workingDiagnosis: existing?.workingDiagnosis ?? "",
    },
  });

  useEffect(() => {
    if (existing) {
      form.reset({
        icdCode: existing.icdCode,
        icdDescription: existing.icdDescription,
        classification: existing.classification as ICDClassification,
        anamnesis: existing.anamnesis ?? "",
        physicalExam: existing.physicalExam ?? "",
        supportingExam: existing.supportingExam ?? "",
        differentialDiagnosis: existing.differentialDiagnosis ?? "",
        workingDiagnosis: existing.workingDiagnosis ?? "",
      });
    }
  }, [existing, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit
        ? diagnosisApi.update(encounterId, existing!.diagnosisId, values)
        : diagnosisApi.create(encounterId, values),
    onSuccess: () => {
      toast.success(isEdit ? "Diagnosis berhasil diperbarui" : "Diagnosis berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["diagnoses", encounterId] });
      queryClient.invalidateQueries({ queryKey: ["encounters", encounterId] });
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Gagal menyimpan diagnosis"));
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-5"
      >
        {/* ICD + Klasifikasi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="icdCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Kode ICD <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: J45.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="icdDescription"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>
                  Deskripsi ICD <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Mild intermittent asthma" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="classification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Klasifikasi <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih klasifikasi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CLASSIFICATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 5 Seksi Klinis */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Data Klinis
          </h3>

          {[
            { name: "anamnesis" as const, label: "Anamnesis", placeholder: "Keluhan utama dan riwayat penyakit pasien..." },
            { name: "physicalExam" as const, label: "Pemeriksaan Fisik", placeholder: "Hasil pemeriksaan fisik..." },
            { name: "supportingExam" as const, label: "Pemeriksaan Penunjang", placeholder: "Hasil lab, rontgen, dll..." },
            { name: "differentialDiagnosis" as const, label: "Diagnosis Banding", placeholder: "Kemungkinan diagnosis lain..." },
            { name: "workingDiagnosis" as const, label: "Diagnosis Kerja", placeholder: "Kesimpulan diagnosis akhir..." },
          ].map(({ name, label, placeholder }) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={placeholder} rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? "Menyimpan..."
              : isEdit
              ? "Simpan Perubahan"
              : "Tambah Diagnosis"}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
              Batal
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
