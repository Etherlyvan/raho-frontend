"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input }  from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { userApi }   from "@/lib/api/endpoints/users";
import { branchApi } from "@/lib/api/endpoints/branches";
import { getApiErrorMessage } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { StaffUser } from "@/types";

// ─── Schema ───────────────────────────────────────────────────

const createSchema = z.object({
  email:         z.string().email("Format email tidak valid"),
  password:      z
    .string()
    .min(8, "Minimal 8 karakter")
    .regex(/[A-Z]/, "Harus ada huruf kapital")
    .regex(/[0-9]/, "Harus ada angka"),
  role:          z.enum(["MASTER_ADMIN", "ADMIN", "DOCTOR", "NURSE"]),
  branchId:      z.string().optional(),
  fullName:      z.string().min(1, "Nama lengkap wajib diisi"),
  phone:         z.string().optional(),
  jenisProfesi:  z.enum(["DOKTER", "NAKES"]).optional(),
  strNumber:     z.string().optional(),
  speciality:    z.string().optional(),
});

const editSchema = z.object({
  fullName:      z.string().min(1, "Nama lengkap wajib diisi"),
  phone:         z.string().optional(),
  branchId:      z.string().optional(),
  jenisProfesi:  z.enum(["DOKTER", "NAKES"]).optional(),
  strNumber:     z.string().optional(),
  speciality:    z.string().optional(),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues   = z.infer<typeof editSchema>;

// ─── Props ────────────────────────────────────────────────────

interface Props {
  mode:         "create" | "edit";
  initialData?: StaffUser;
  userId?:      string;
  basePath:     string;
}

const ROLES_NEEDING_BRANCH = ["ADMIN", "DOCTOR", "NURSE"] as const;
const ROLES_WITH_PROFESI   = ["DOCTOR", "NURSE"] as const;

export function UserForm({ mode, initialData, userId, basePath }: Props) {
  const router      = useRouter();
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  // Ambil daftar cabang untuk dropdown
  const { data: branchData } = useQuery({
    queryKey: ["branches", "all"],
    queryFn:  async () => {
      const res = await branchApi.list({ isActive: true, limit: 100 });
      return res.data.data;
    },
  });

  // ─── Create form ──────────────────────────────────────────

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      email: "", password: "", role: "ADMIN",
      fullName: "", phone: "",
    },
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      fullName:     initialData?.profile?.fullName     ?? "",
      phone:        initialData?.profile?.phone        ?? "",
      branchId:     initialData?.branch?.branchId      ?? "",
      jenisProfesi: initialData?.profile?.jenisProfesi ?? undefined,
      strNumber:    initialData?.profile?.strNumber    ?? "",
      speciality:   initialData?.profile?.speciality   ?? "",
    },
  });

  // ─── Mutations ────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (v: CreateValues) => userApi.create(v),
    onSuccess: () => {
      toast.success("Staff berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      router.push(`${basePath}/users`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal membuat staff")),
  });

  const updateMutation = useMutation({
    mutationFn: (v: EditValues) => userApi.update(userId!, v),
    onSuccess: () => {
      toast.success("Data staff berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
      router.push(`${basePath}/users/${userId}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal memperbarui staff")),
  });

  // ─── Watch role untuk conditional field ──────────────────

  const watchedRole = createForm.watch("role");
  const needsBranch = ROLES_NEEDING_BRANCH.includes(watchedRole as typeof ROLES_NEEDING_BRANCH[number]);
  const needsProfesi = ROLES_WITH_PROFESI.includes(watchedRole as typeof ROLES_WITH_PROFESI[number]);

  // ─── Render ───────────────────────────────────────────────

  if (mode === "create") {
    return (
      <Form {...createForm}>
        <form
          onSubmit={createForm.handleSubmit((v) => createMutation.mutate(v))}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField control={createForm.control} name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input placeholder="Dr. Budi Santoso" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={createForm.control} name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input type="email" placeholder="budi@raho.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={createForm.control} name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input type="password" placeholder="Min. 8 karakter, kapital & angka" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={createForm.control} name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. Telepon</FormLabel>
                  <FormControl><Input placeholder="08xxxxxxxxxx" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={createForm.control} name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih role" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {hasRole("SUPER_ADMIN") && (
                        <SelectItem value="MASTER_ADMIN">Master Admin</SelectItem>
                      )}
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="DOCTOR">Dokter</SelectItem>
                      <SelectItem value="NURSE">Perawat</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cabang — muncul jika role butuh cabang */}
            {needsBranch && (
              <FormField control={createForm.control} name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cabang <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Pilih cabang" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {branchData?.map((b) => (
                          <SelectItem key={b.branchId} value={b.branchId}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Jenis Profesi — muncul untuk Dokter/Perawat */}
            {needsProfesi && (
              <>
                <FormField control={createForm.control} name="jenisProfesi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Profesi</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih profesi" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="DOKTER">Dokter</SelectItem>
                          <SelectItem value="NAKES">Tenaga Kesehatan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={createForm.control} name="strNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. STR</FormLabel>
                      <FormControl><Input placeholder="Nomor STR" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={createForm.control} name="speciality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spesialisasi</FormLabel>
                      <FormControl><Input placeholder="Kedokteran Umum" {...field} /></FormControl>
                      <FormDescription>Opsional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Menyimpan..." : "Buat Akun Staff"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Batal
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  // ─── Edit mode ────────────────────────────────────────────

  const editRole = initialData?.role.name;
  const editNeedsBranch  = editRole && ROLES_NEEDING_BRANCH.includes(editRole as typeof ROLES_NEEDING_BRANCH[number]);
  const editNeedsProfesi = editRole && ROLES_WITH_PROFESI.includes(editRole as typeof ROLES_WITH_PROFESI[number]);

  return (
    <Form {...editForm}>
      <form
        onSubmit={editForm.handleSubmit((v) => updateMutation.mutate(v))}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField control={editForm.control} name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={editForm.control} name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. Telepon</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {editNeedsBranch && (
            <FormField control={editForm.control} name="branchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cabang</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih cabang" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {branchData?.map((b) => (
                        <SelectItem key={b.branchId} value={b.branchId}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {editNeedsProfesi && (
            <>
              <FormField control={editForm.control} name="strNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. STR</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={editForm.control} name="speciality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spesialisasi</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
        </div>
      </form>
    </Form>
  );
}
