'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Upload, X, ImageIcon, ShieldAlert } from 'lucide-react';
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage, FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sessionPhotoApi } from '@/lib/api/endpoints/photos';
import { getApiErrorMessage } from '@/lib/utils';

/* ─── Konstanta ────────────────────────────────────────────────────────────── */
const ACCEPTED_TYPES  = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES  = 5 * 1024 * 1024; // 5 MB
const MAX_SIZE_LABEL  = '5 MB';

/* ─── Schema ───────────────────────────────────────────────────────────────── */
const schema = z.object({
  caption:  z.string().optional(),
  takenAt:  z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

/* ─── Props ────────────────────────────────────────────────────────────────── */
interface Props {
  sessionId:        string;
  isConsentToPhoto: boolean;
}

/**
 * PhotoUploadForm — Upload foto sesi.
 *
 * Alur upload:
 *  1. Perawat pilih file (jpg/png/webp, maks 5 MB)
 *  2. FE buat object URL untuk preview lokal
 *  3. Pada submit, kirim JSON body ke BE:
 *       { photoUrl, fileName, fileSizeBytes, caption, takenAt }
 *     Di production, photoUrl = URL hasil upload ke cloud storage (S3/GCS).
 *     Untuk development, photoUrl menggunakan object URL sementara.
 *
 * BLOKIR jika isConsentToPhoto === false.
 */
export function PhotoUploadForm({ sessionId, isConsentToPhoto }: Props) {
  const queryClient       = useQueryClient();
  const fileInputRef      = useRef<HTMLInputElement>(null);
  const [preview, setPreview]       = useState<string | null>(null);
  const [fileData, setFileData]     = useState<{
    name: string;
    size: number;
    objectUrl: string;
  } | null>(null);
  const [fileError, setFileError]   = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { caption: '', takenAt: '' },
  });

  /* ── Handler pilih file ── */
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Format tidak didukung. Gunakan JPG, PNG, atau WebP.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setFileError(`Ukuran file melebihi ${MAX_SIZE_LABEL}.`);
      return;
    }

    /* Revoke URL sebelumnya untuk cegah memory leak */
    if (fileData?.objectUrl) URL.revokeObjectURL(fileData.objectUrl);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setFileData({ name: file.name, size: file.size, objectUrl });
  }

  function handleRemoveFile() {
    if (fileData?.objectUrl) URL.revokeObjectURL(fileData.objectUrl);
    setPreview(null);
    setFileData(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  /* ── Mutation ── */
  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (!fileData) throw new Error('Pilih file terlebih dahulu.');
      return sessionPhotoApi.create(sessionId, {
        /*
         * Di production: ganti fileData.objectUrl dengan URL
         * hasil upload ke cloud storage (S3/GCS/etc.) yang
         * dilakukan sebelum memanggil mutasi ini.
         */
        photoUrl:      fileData.objectUrl,
        fileName:      fileData.name,
        fileSizeBytes: fileData.size,
        caption:       values.caption   || undefined,
        takenAt:       values.takenAt
          ? new Date(values.takenAt).toISOString()
          : undefined,
      });
    },
    onSuccess: () => {
      toast.success('Foto sesi berhasil diunggah.');
      form.reset({ caption: '', takenAt: '' });
      handleRemoveFile();
      queryClient.invalidateQueries({ queryKey: ['session-photos', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['session-detail', sessionId] });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, 'Gagal mengunggah foto')),
  });

  /* ── Blokir jika consent tidak ada ── */
  if (!isConsentToPhoto) {
    return (
      <div className="rounded-lg border border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-5 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Upload Foto Diblokir
          </p>
          <p className="text-xs text-red-600 dark:text-red-500 mt-1">
            Pasien belum memberikan persetujuan pengambilan foto
            (<span className="font-mono">isConsentToPhoto = false</span>).
            Persetujuan dapat diperbarui oleh Admin melalui menu data pasien.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card size="sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Upload Foto Sesi</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* ── Dropzone / File Picker ── */}
        {!preview ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            className="cursor-pointer rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 bg-slate-50 dark:bg-slate-900 transition-colors p-8 flex flex-col items-center gap-3 text-center"
          >
            <div className="rounded-full bg-teal-50 dark:bg-teal-950 p-3">
              <Upload className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Klik atau seret file ke sini
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                JPG, PNG, WebP · Maks. {MAX_SIZE_LABEL}
              </p>
            </div>
          </div>
        ) : (
          /* ── Preview ── */
          <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview foto sesi"
              className="w-full max-h-64 object-contain"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-2 right-2 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-red-500"
              onClick={handleRemoveFile}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            <div className="px-3 py-2 text-xs text-muted-foreground border-t border-slate-100 dark:border-slate-800">
              {fileData?.name} ·{' '}
              {fileData ? (fileData.size / 1024).toFixed(1) : 0} KB
            </div>
          </div>
        )}

        {/* Hidden input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* File error */}
        {fileError && (
          <p className="text-xs text-red-500">{fileError}</p>
        )}

        {/* ── Metadata Form ── */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Caption */}
              <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Keterangan Foto</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contoh: Kondisi area infus sebelum tindakan..."
                        className="resize-none h-20 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Opsional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Waktu Pengambilan */}
              <FormField
                control={form.control}
                name="takenAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Waktu Pengambilan</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Opsional — default: waktu upload
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={mutation.isPending || !fileData || !!fileError}
              className="bg-teal-600 hover:bg-teal-700 text-white border-0"
            >
              <ImageIcon className="h-4 w-4 mr-1.5" />
              {mutation.isPending ? 'Mengunggah...' : 'Unggah Foto'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
