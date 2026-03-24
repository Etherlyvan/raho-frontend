"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { emrNotesApi } from "@/lib/api/endpoints/emrNotes";
import { getApiErrorMessage } from "@/lib/utils";
import type { EMRNoteType } from "@/types";

const emrNoteSchema = z.object({
  type: z.enum(["ASSESSMENT", "CLINICAL_NOTE", "OPERATIONAL_NOTE", "FOLLOW_UP"], {
    errorMap: () => ({ message: "Pilih tipe catatan" }),
  }),
  content: z.string().min(1, "Isi catatan tidak boleh kosong"),
});

type FormValues = z.infer<typeof emrNoteSchema>;

// Tipe yang tersedia per konteks
const ENCOUNTER_TYPES: { value: EMRNoteType; label: string }[] = [
  { value: "ASSESSMENT", label: "Assessment" },
  { value: "CLINICAL_NOTE", label: "Catatan Klinis" },
  { value: "FOLLOW_UP", label: "Follow-up" },
];

const SESSION_TYPES: { value: EMRNoteType; label: string }[] = [
  { value: "OPERATIONAL_NOTE", label: "Catatan Operasional" },
  { value: "CLINICAL_NOTE", label: "Catatan Klinis" },
];

interface Props {
  /** Salah satu harus diisi */
  encounterId?: string;
  sessionId?: string;
  onSuccess?: () => void;
}

export function EMRNoteForm({ encounterId, sessionId, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const isSessionContext = !!sessionId;
  const typeOptions = isSessionContext ? SESSION_TYPES : ENCOUNTER_TYPES;

  const form = useForm<FormValues>({
    resolver: zodResolver(emrNoteSchema),
    defaultValues: {
      type: typeOptions[0].value,
      content: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (isSessionContext) {
        return emrNotesApi.createSessionNote(sessionId!, {
          type: values.type,
          content: values.content,
        });
      }
      return emrNotesApi.createEncounterNote(encounterId!, {
        type: values.type,
        content: values.content,
      });
    },
    onSuccess: () => {
      toast.success("Catatan EMR berhasil ditambahkan");
      queryClient.invalidateQueries({
        queryKey: isSessionContext
          ? ["emr-notes", "session", sessionId]
          : ["emr-notes", "encounter", encounterId],
      });
      form.reset({ type: typeOptions[0].value, content: "" });
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Gagal menambahkan catatan EMR"));
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tipe Catatan <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe catatan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {typeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Isi Catatan <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tulis catatan EMR di sini..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Menyimpan..." : "Simpan Catatan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
