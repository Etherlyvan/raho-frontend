"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { memberApi } from "@/lib/api/endpoints/members";
import { getApiErrorMessage } from "@/lib/utils";
import type { Member } from "@/types";

const memberSchema = z.object({
  fullName:         z.string().min(1, "Nama wajib diisi"),
  phone:            z.string().optional(),
  email:            z.string().email("Format email tidak valid").optional().or(z.literal("")),
  nik:              z.string().optional(),
  dateOfBirth:      z.string().optional(),
  tempatLahir:      z.string().optional(),
  jenisKelamin:     z.enum(["L", "P"]).optional(),
  address:          z.string().optional(),
  pekerjaan:        z.string().optional(),
  statusNikah:      z.string().optional(),
  emergencyContact: z.string().optional(),
  medicalHistory:   z.string().optional(),
  sumberInfoRaho:   z.string().optional(),
});
type FormValues = z.infer<typeof memberSchema>;

interface Props {
  mode: "create" | "edit";
  initialData?: Member;
  memberId?: string;
  onSuccess?: () => void;
}

export function MemberForm({ mode, initialData, memberId, onSuccess }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      fullName:         initialData?.fullName         ?? "",
      phone:            initialData?.phone            ?? "",
      email:            initialData?.email            ?? "",
      nik:              initialData?.nik              ?? "",
      dateOfBirth:      initialData?.dateOfBirth?.slice(0, 10) ?? "",
      tempatLahir:      initialData?.tempatLahir      ?? "",
      jenisKelamin:     initialData?.jenisKelamin     ?? undefined,
      address:          initialData?.address          ?? "",
      pekerjaan:        initialData?.pekerjaan        ?? "",
      statusNikah:      initialData?.statusNikah      ?? "",
      emergencyContact: initialData?.emergencyContact ?? "",
      medicalHistory:   initialData?.medicalHistory
        ? JSON.stringify(initialData.medicalHistory)
        : "",
      sumberInfoRaho:   initialData?.sumberInfoRaho   ?? "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => memberApi.create(values),
    onSuccess: () => {
      toast.success("Pasien berhasil didaftarkan");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      router.push("/admin/members");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal mendaftarkan pasien")),
  });

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => memberApi.update(memberId!, values),
    onSuccess: () => {
      toast.success("Data pasien berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["members", memberId] });
      onSuccess?.();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal memperbarui data pasien")),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const onSubmit = (v: FormValues) =>
    mode === "create" ? createMutation.mutate(v) : updateMutation.mutate(v);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* ─── Data Diri ─────────────────────────────────────── */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Data Diri
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <FormField control={form.control} name="fullName" render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input placeholder="Budi Santoso" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>No. Telepon</FormLabel>
                <FormControl><Input placeholder="08xxxxxxxxxx" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="budi@email.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="nik" render={({ field }) => (
              <FormItem>
                <FormLabel>NIK</FormLabel>
                <FormControl><Input placeholder="16 digit NIK" maxLength={16} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Lahir</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="tempatLahir" render={({ field }) => (
              <FormItem>
                <FormLabel>Tempat Lahir</FormLabel>
                <FormControl><Input placeholder="Jakarta" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="jenisKelamin" render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Kelamin</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Pilih jenis kelamin" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="statusNikah" render={({ field }) => (
              <FormItem>
                <FormLabel>Status Pernikahan</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
                    <SelectItem value="Menikah">Menikah</SelectItem>
                    <SelectItem value="Cerai">Cerai</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

          </div>
        </section>

        {/* ─── Alamat & Kontak ───────────────────────────────── */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Alamat & Kontak
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Alamat</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder="Jl. Raya No. 1, Kelurahan..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="pekerjaan" render={({ field }) => (
              <FormItem>
                <FormLabel>Pekerjaan</FormLabel>
                <FormControl><Input placeholder="Karyawan swasta" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="emergencyContact" render={({ field }) => (
              <FormItem>
                <FormLabel>Kontak Darurat</FormLabel>
                <FormControl>
                  <Input placeholder="Nama - 08xxx - Hubungan (Ibu, Suami, dll.)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

          </div>
        </section>

        {/* ─── Informasi Medis ───────────────────────────────── */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Informasi Medis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <FormField control={form.control} name="medicalHistory" render={({ field }) => (
              <FormItem>
                <FormLabel>Riwayat Penyakit</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder="Hipertensi, Diabetes, dll." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="sumberInfoRaho" render={({ field }) => (
              <FormItem>
                <FormLabel>Sumber Informasi RAHO</FormLabel>
                <FormControl>
                  <Input placeholder="Referensi teman, Instagram, dll." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

          </div>
        </section>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? mode === "create" ? "Mendaftarkan..." : "Menyimpan..."
              : mode === "create" ? "Daftarkan Pasien" : "Simpan Perubahan"}
          </Button>
          <Button type="button" variant="outline" onClick={router.back} disabled={isPending}>
            Batal
          </Button>
        </div>

      </form>
    </Form>
  );
}
