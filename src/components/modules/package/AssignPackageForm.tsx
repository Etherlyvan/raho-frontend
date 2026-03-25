"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button }   from "@/components/ui/button";
import { memberPackageApi } from "@/lib/api/endpoints/memberPackages";
import { getApiErrorMessage } from "@/lib/utils";

const schema = z.object({
  type:      z.enum(["BASIC", "BOOSTER"]),
  startDate: z.string().optional(),
  notes:     z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  memberId:  string;
  onSuccess: () => void;
}

export function AssignPackageForm({ memberId, onSuccess }: Props) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type:      "BASIC",
      startDate: new Date().toISOString().split("T")[0],
      notes:     "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      memberPackageApi.assign(memberId, {
        type:      values.type,
        startDate: values.startDate
          ? new Date(values.startDate).toISOString()
          : undefined,
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      toast.success("Paket berhasil di-assign");
      queryClient.invalidateQueries({ queryKey: ["packages", memberId] });
      form.reset();
      onSuccess();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal assign paket")),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-4"
      >
        <FormField control={form.control} name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Paket <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="BASIC">BASIC</SelectItem>
                  <SelectItem value="BOOSTER">BOOSTER</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal Mulai</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormDescription>Kosongkan jika mulai hari ini</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan</FormLabel>
              <FormControl><Textarea rows={2} placeholder="Catatan tambahan..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-3">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Menyimpan..." : "Assign Paket"}
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
