"use client";

import { useEffect } from "react";
import { useForm }   from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input }    from "@/components/ui/input";
import { Button }   from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { profileApi } from "@/lib/api/endpoints/profile";
import { useAuthStore } from "@/store/auth.store";
import { getApiErrorMessage } from "@/lib/utils";

const profileSchema = z.object({
  fullName:     z.string().min(2, "Nama minimal 2 karakter"),
  phone:        z.string().optional(),
  jenisProfesi: z.enum(["DOKTER", "NAKES"]).optional(),
  strNumber:    z.string().optional(),
  speciality:   z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.userId],
    queryFn:  () => profileApi.get(user!.userId).then((r) => r.data.data),
    enabled:  !!user?.userId,
  });

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", phone: "", strNumber: "", speciality: "" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName:     profile.fullName,
        phone:        profile.phone ?? "",
        jenisProfesi: profile.jenisProfesi ?? undefined,
        strNumber:    profile.strNumber ?? "",
        speciality:   profile.speciality ?? "",
      });
    }
  }, [profile, form]);

  const updateMutation = useMutation({
    mutationFn: (values: ProfileValues) =>
      profileApi.update(user!.userId, values),
    onSuccess: () => {
      toast.success("Profil berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["profile", user?.userId] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Gagal memperbarui profil")),
  });

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Informasi Profil</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => updateMutation.mutate(v))} className="space-y-4">
            <FormField control={form.control} name="fullName" render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input {...field} disabled={isLoading} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Telepon</FormLabel>
                <FormControl><Input {...field} type="tel" placeholder="08xx..." /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {user?.role === "DOCTOR" || user?.role === "NURSE" ? (
              <>
                <FormField control={form.control} name="jenisProfesi" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Profesi</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Pilih profesi" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="DOKTER">Dokter</SelectItem>
                        <SelectItem value="NAKES">Tenaga Kesehatan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="strNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor STR</FormLabel>
                    <FormControl><Input {...field} placeholder="Nomor STR" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="speciality" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spesialisasi</FormLabel>
                    <FormControl><Input {...field} placeholder="Contoh: Estetika Medis" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </>
            ) : null}
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={updateMutation.isPending || isLoading}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
