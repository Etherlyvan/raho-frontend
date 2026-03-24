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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { encountersApi } from "@/lib/api/endpoints/encounters";
import { getApiErrorMessage } from "@/lib/utils";
import type { Encounter, EligibilityStatus } from "@/types";

const assessmentSchema = z.object({
  eligibility: z.enum(["ELIGIBLE", "NOT_ELIGIBLE", "CONDITIONAL"], {
    errorMap: () => ({ message: "Pilih status kelayakan" }),
  }),
  targetOutcome: z.string().optional(),
  notes: z.string().optional(),
  protocol: z.string().min(1, "Protokol treatment wajib diisi"),
  frequency: z.string().optional(),
  totalSessions: z.coerce.number().positive().optional().or(z.literal("")),
  duration: z.string().optional(),
  specialNotes: z.string().optional(),
});

type FormValues = z.infer<typeof assessmentSchema>;

const ELIGIBILITY_OPTIONS: { value: EligibilityStatus; label: string; desc: string }[] = [
  { value: "ELIGIBLE", label: "Layak", desc: "Pasien memenuhi syarat untuk treatment" },
  { value: "NOT_ELIGIBLE", label: "Tidak Layak", desc: "Pasien tidak memenuhi syarat" },
  { value: "CONDITIONAL", label: "Bersyarat", desc: "Layak dengan syarat tertentu" },
];

interface Props {
  encounter: Encounter;
  onSuccess?: () => void;
}

export function AssessmentForm({ encounter, onSuccess }: Props) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      eligibility: (encounter.assessment?.eligibility as EligibilityStatus) ?? undefined,
      targetOutcome: encounter.assessment?.targetOutcome ?? "",
      notes: encounter.assessment?.notes ?? "",
      protocol: encounter.treatmentPlan?.protocol ?? "",
      frequency: encounter.treatmentPlan?.frequency ?? "",
      totalSessions: encounter.treatmentPlan?.totalSessions ?? "",
      duration: encounter.treatmentPlan?.duration ?? "",
      specialNotes: encounter.treatmentPlan?.specialNotes ?? "",
    },
  });

  useEffect(() => {
    if (encounter.assessment) {
      form.reset({
        eligibility: encounter.assessment.eligibility as EligibilityStatus,
        targetOutcome: encounter.assessment.targetOutcome ?? "",
        notes: encounter.assessment.notes ?? "",
        protocol: encounter.treatmentPlan?.protocol ?? "",
        frequency: encounter.treatmentPlan?.frequency ?? "",
        totalSessions: encounter.treatmentPlan?.totalSessions ?? "",
        duration: encounter.treatmentPlan?.duration ?? "",
        specialNotes: encounter.treatmentPlan?.specialNotes ?? "",
      });
    }
  }, [encounter, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      encountersApi.upsertAssessment(encounter.encounterId, {
        eligibility: values.eligibility,
        targetOutcome: values.targetOutcome || undefined,
        notes: values.notes || undefined,
        treatmentPlan: {
          protocol: values.protocol,
          frequency: values.frequency || undefined,
          totalSessions: values.totalSessions ? Number(values.totalSessions) : undefined,
          duration: values.duration || undefined,
          specialNotes: values.specialNotes || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Assessment berhasil disimpan");
      queryClient.invalidateQueries({ queryKey: ["encounters", encounter.encounterId] });
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Gagal menyimpan assessment"));
    },
  });

  return (
    <Card className="max-w-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Assessment & Treatment Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-6"
          >
            {/* Assessment */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Assessment
              </h3>

              {/* Eligibility */}
              <FormField
                control={form.control}
                name="eligibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status Kelayakan <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status kelayakan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ELIGIBILITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div>
                              <span className="font-medium">{opt.label}</span>
                              <span className="ml-2 text-xs text-slate-400">{opt.desc}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Target Outcome */}
              <FormField
                control={form.control}
                name="targetOutcome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Outcome</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deskripsikan target outcome yang diharapkan..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Assessment Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan Assessment</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Catatan tambahan terkait assessment..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Treatment Plan */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Treatment Plan
              </h3>

              <FormField
                control={form.control}
                name="protocol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Protokol Treatment <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: IFA + HHO Standard Protocol" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frekuensi</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: 2x seminggu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalSessions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Sesi</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} placeholder="Contoh: 10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durasi Per Sesi</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: 90 menit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan Khusus untuk Perawat</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Instruksi khusus yang perlu diperhatikan perawat..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Catatan ini akan terlihat oleh perawat saat pelaksanaan sesi.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Menyimpan..." : "Simpan Assessment"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
