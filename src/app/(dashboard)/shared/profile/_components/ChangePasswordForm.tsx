"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import type { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authApi } from "@/lib/api/endpoints/auth";
import { getApiErrorMessage } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────

const schema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword:     z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path:    ["confirmPassword"],
  });

type Values = z.infer<typeof schema>;

// ─── Password Input Sub-component ─────────────────────────────

interface PasswordInputProps<T extends FieldValues> {
  field:    ControllerRenderProps<T, Path<T>>;
  disabled?: boolean;
}

function PasswordInput<T extends FieldValues>({ field, disabled }: PasswordInputProps<T>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        {...field}
        type={show ? "text" : "password"}
        disabled={disabled}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((p) => !p)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export function ChangePasswordForm() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword:     "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: Values) => authApi.changePassword(values),
    onSuccess: () => {
      toast.success("Password berhasil diubah");
      form.reset();
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Gagal mengubah password")),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ubah Password</CardTitle>
        <CardDescription>Password baru minimal 8 karakter</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Saat Ini</FormLabel>
                  <FormControl>
                    <PasswordInput<Values> field={field} disabled={mutation.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Baru</FormLabel>
                  <FormControl>
                    <PasswordInput<Values> field={field} disabled={mutation.isPending} />
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
                  <FormLabel>Konfirmasi Password Baru</FormLabel>
                  <FormControl>
                    <PasswordInput<Values> field={field} disabled={mutation.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Ubah Password
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
