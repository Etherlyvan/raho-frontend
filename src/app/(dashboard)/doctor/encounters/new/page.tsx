"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { MemberLookupInput } from "@/components/modules/member/MemberLookupInput";
import { encountersApi } from "@/lib/api/endpoints/encounters";
import { useAuthStore } from "@/store/auth.store";
import { getApiErrorMessage } from "@/lib/utils";
import type { EncounterType } from "@/types";

const schema = z.object({
  memberId: z.string().min(1, "Pilih pasien terlebih dahulu"),
  memberPackageId: z.string().min(1, "ID paket wajib diisi"),
  type: z.enum(["CONSULTATION", "TREATMENT"], {
    errorMap: () => ({ message: "Pilih tipe encounter" }),
  }),
  treatmentDate: z.string().optional(),
  consultationEncounterId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const TYPE_OPTIONS: { value: EncounterType; label: string; desc: string }[] = [
  { value: "CONSULTATION", label: "Konsultasi", desc: "Assessment awal pasien" },
  { value: "TREATMENT", label: "Treatment", desc: "Pelaksanaan terapi" },
];

export default function NewDoctorEncounterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      memberId: "",
      memberPackageId: "",
      type: "TREATMENT",
      treatmentDate: "",
      consultationEncounterId: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      encountersApi.create({
        memberId: values.memberId,
        doctorId: user!.userId,
        branchId: user!.branchId!,
        memberPackageId: values.memberPackageId,
        type: values.type,
        treatmentDate: values.treatmentDate || undefined,
        consultationEncounterId: values.consultationEncounterId || undefined,
      }),
    onSuccess: (res) => {
      toast.success("Encounter berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["encounters", "doctor"] });
      router.push(
        `/dashboard/doctor/encounters/${res.data.data.encounterId}`
      );
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Gagal membuat encounter"));
    },
  });

  return (
    <div className="space-y-5 max-w-xl">
      <PageHeader
        title="Buat Encounter Baru"
        description="Isi data encounter untuk pasien"
      />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
              className="space-y-5"
            >
              {/* Pilih Pasien */}
              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Pasien <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                    <MemberLookupInput
                        onSelect={(member) => field.onChange(member.memberId)}
                    />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipe Encounter */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tipe Encounter <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div>
                              <span className="font-medium">{opt.label}</span>
                              <span className="ml-2 text-xs text-slate-400">
                                {opt.desc}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ID Paket */}
              <FormField
                control={form.control}
                name="memberPackageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      ID Paket Member <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="memberPackageId dari paket aktif pasien"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tanggal Treatment */}
              <FormField
                control={form.control}
                name="treatmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Treatment</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Consultation Encounter ID (opsional) */}
              {form.watch("type") === "TREATMENT" && (
                <FormField
                  control={form.control}
                  name="consultationEncounterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Encounter Konsultasi (opsional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Jika merujuk dari konsultasi sebelumnya"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Membuat..." : "Buat Encounter"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/doctor/encounters")}
                  disabled={mutation.isPending}
                >
                  Batal
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
