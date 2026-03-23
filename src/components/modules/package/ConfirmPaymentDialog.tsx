"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button }   from "@/components/ui/button";
import { memberPackageApi } from "@/lib/api/endpoints/memberPackages";
import { getApiErrorMessage } from "@/lib/utils";
import type { PackageType } from "@/types";

const schema = z.object({
  paidAt: z.string().min(1, "Tanggal bayar wajib diisi"),
  notes:  z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  memberId:     string;
  packageId:    string;
  packageType:  PackageType;
}

export function ConfirmPaymentDialog({ open, onOpenChange, memberId, packageId, packageType }: Props) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      paidAt: new Date().toISOString().split("T")[0],
      notes:  "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      memberPackageApi.confirmPayment(memberId, packageId, {
        paidAt: new Date(values.paidAt).toISOString(),
        notes:  values.notes || undefined,
      }),
    onSuccess: () => {
      toast.success("Pembayaran berhasil dikonfirmasi");
      queryClient.invalidateQueries({ queryKey: ["packages", memberId] });
      form.reset();
      onOpenChange(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal konfirmasi pembayaran")),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
          <DialogDescription>
            Konfirmasi pembayaran paket <strong>{packageType}</strong>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4 mt-2"
          >
            <FormField control={form.control} name="paidAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Pembayaran <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Metode bayar, nomor referensi, dll." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Mengkonfirmasi..." : "Konfirmasi"}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
