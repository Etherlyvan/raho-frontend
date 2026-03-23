"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input }  from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { userApi } from "@/lib/api/endpoints/users";
import { getApiErrorMessage } from "@/lib/utils";

const schema = z.object({
  newPassword: z
    .string()
    .min(8, "Minimal 8 karakter")
    .regex(/[A-Z]/, "Harus ada huruf kapital")
    .regex(/[0-9]/, "Harus ada angka"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path:    ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open:       boolean;
  onOpenChange: (open: boolean) => void;
  userId:     string;
  userName:   string;
}

export function ResetPasswordDialog({ open, onOpenChange, userId, userName }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      userApi.resetPassword(userId, { newPassword: values.newPassword }),
    onSuccess: () => {
      toast.success(`Password ${userName} berhasil direset`);
      form.reset();
      onOpenChange(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal reset password")),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Reset password untuk akun <strong>{userName}</strong>.
            Password lama akan langsung tidak berlaku.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4 mt-2"
          >
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Baru</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Min. 8 karakter, ada huruf kapital & angka" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Ulangi password baru" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Mereset..." : "Reset Password"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { form.reset(); onOpenChange(false); }}
                disabled={mutation.isPending}
              >
                Batal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
