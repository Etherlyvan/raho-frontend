"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input }    from "@/components/ui/input";
import { Button }   from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { branchApi } from "@/lib/api/endpoints/branches";
import { getApiErrorMessage } from "@/lib/utils";
import type { Branch } from "@/types";

// ─── Schema ───────────────────────────────────────────────────

const branchSchema = z.object({
  name:           z.string().min(1, "Nama cabang wajib diisi"),
  address:        z.string().min(1, "Alamat wajib diisi"),
  city:           z.string().min(1, "Kota wajib diisi"),
  phone:          z.string().optional(),
  tipe:           z.enum(["KLINIK", "HOMECARE"]),
  operatingHours: z.string().optional(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

// ─── Props ────────────────────────────────────────────────────

interface Props {
  mode:        "create" | "edit";
  initialData?: Branch;
  branchId?:   string;
}

export function BranchForm({ mode, initialData, branchId }: Props) {
  const router      = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name:           initialData?.name           ?? "",
      address:        initialData?.address        ?? "",
      city:           initialData?.city           ?? "",
      phone:          initialData?.phone          ?? "",
      tipe:           initialData?.tipe           ?? "KLINIK",
      operatingHours: initialData?.operatingHours ?? "",
    },
  });

  // ─── Mutations ────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (values: BranchFormValues) => branchApi.create(values),
    onSuccess: () => {
      toast.success("Cabang berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      router.push("/superadmin/branches");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal membuat cabang")),
  });

  const updateMutation = useMutation({
    mutationFn: (values: BranchFormValues) =>
      branchApi.update(branchId!, values),
    onSuccess: () => {
      toast.success("Cabang berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      queryClient.invalidateQueries({ queryKey: ["branches", branchId] });
      router.push(`/superadmin/branches/${branchId}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal memperbarui cabang")),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: BranchFormValues) => {
    if (mode === "create") createMutation.mutate(values);
    else updateMutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Nama */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Cabang <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Klinik RAHO Jakarta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Kota */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kota <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Jakarta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipe */}
          <FormField
            control={form.control}
            name="tipe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipe Cabang <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="KLINIK">Klinik</SelectItem>
                    <SelectItem value="HOMECARE">Homecare</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* No. Telepon */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. Telepon</FormLabel>
                <FormControl>
                  <Input placeholder="021-12345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Jam Operasional */}
          <FormField
            control={form.control}
            name="operatingHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jam Operasional</FormLabel>
                <FormControl>
                  <Input placeholder="08:00 - 17:00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Alamat */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Jl. Raya Utama No. 1, Kelurahan..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? mode === "create" ? "Menyimpan..." : "Memperbarui..."
              : mode === "create" ? "Buat Cabang" : "Simpan Perubahan"
            }
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Batal
          </Button>
        </div>
      </form>
    </Form>
  );
}
