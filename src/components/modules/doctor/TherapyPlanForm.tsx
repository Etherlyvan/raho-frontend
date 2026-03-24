"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Form, FormControl, FormField, FormItem, FormLabel,
  FormMessage, FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { therapyPlanApi } from "@/lib/api/endpoints/therapyPlan";
import { getApiErrorMessage } from "@/lib/utils";
import type { TherapyPlan } from "@/types";

const therapySchema = z.object({
  hhoMl: z.coerce.number().nonnegative("HHO tidak boleh negatif"),
  ifaMg: z.coerce.number().nonnegative().optional().or(z.literal("")),
  h2Ml: z.coerce.number().nonnegative().optional().or(z.literal("")),
  noMl: z.coerce.number().nonnegative().optional().or(z.literal("")),
  gasoMl: z.coerce.number().nonnegative().optional().or(z.literal("")),
  o2Ml: z.coerce.number().nonnegative().optional().or(z.literal("")),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof therapySchema>;

const DOSE_FIELDS: {
  name: keyof Omit<FormValues, "notes">;
  label: string;
  unit: string;
  required?: boolean;
}[] = [
  { name: "hhoMl", label: "HHO", unit: "ml", required: true },
  { name: "ifaMg", label: "IFA", unit: "mg" },
  { name: "h2Ml", label: "H₂", unit: "ml" },
  { name: "noMl", label: "NO", unit: "ml" },
  { name: "gasoMl", label: "GASO", unit: "ml" },
  { name: "o2Ml", label: "O₂", unit: "ml" },
];

interface Props {
  sessionId: string;
  existing?: TherapyPlan | null;
  onSuccess?: () => void;
}

export function TherapyPlanForm({ sessionId, existing, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const isEdit = !!existing;

  const form = useForm<FormValues>({
    resolver: zodResolver(therapySchema),
    defaultValues: {
      hhoMl: existing?.hhoMl ?? 0,
      ifaMg: existing?.ifaMg ?? "",
      h2Ml: existing?.h2Ml ?? "",
      noMl: existing?.noMl ?? "",
      gasoMl: existing?.gasoMl ?? "",
      o2Ml: existing?.o2Ml ?? "",
      notes: existing?.notes ?? "",
    },
  });

  useEffect(() => {
    if (existing) {
      form.reset({
        hhoMl: existing.hhoMl,
        ifaMg: existing.ifaMg ?? "",
        h2Ml: existing.h2Ml ?? "",
        noMl: existing.noMl ?? "",
        gasoMl: existing.gasoMl ?? "",
        o2Ml: existing.o2Ml ?? "",
        notes: existing.notes ?? "",
      });
    }
  }, [existing, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        hhoMl: values.hhoMl,
        ifaMg: values.ifaMg !== "" ? Number(values.ifaMg) : null,
        h2Ml: values.h2Ml !== "" ? Number(values.h2Ml) : null,
        noMl: values.noMl !== "" ? Number(values.noMl) : null,
        gasoMl: values.gasoMl !== "" ? Number(values.gasoMl) : null,
        o2Ml: values.o2Ml !== "" ? Number(values.o2Ml) : null,
        notes: values.notes || undefined,
      };
      return isEdit
        ? therapyPlanApi.update(sessionId, payload)
        : therapyPlanApi.create(sessionId, payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Rencana terapi diperbarui" : "Rencana terapi berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["therapy-plan", sessionId] });
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Gagal menyimpan rencana terapi"));
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-5"
      >
        {/* 6 Dosis Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {DOSE_FIELDS.map(({ name, label, unit, required }) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        placeholder="0"
                        {...field}
                        value={field.value ?? ""}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                        {unit}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        {/* Notes untuk Perawat */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan untuk Perawat</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Instruksi atau catatan khusus pelaksanaan terapi..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Catatan ini akan ditampilkan kepada perawat saat pelaksanaan sesi.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? "Menyimpan..."
              : isEdit
              ? "Perbarui Rencana Terapi"
              : "Buat Rencana Terapi"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
