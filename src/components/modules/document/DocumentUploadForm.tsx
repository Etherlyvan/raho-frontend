"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, X, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label }  from "@/components/ui/label";
import { DocumentTypeSelect } from "@/components/modules/document/DocumentTypeSelect";
import { memberDocumentApi } from "@/lib/api/endpoints/memberDocuments";
import { cn, getApiErrorMessage } from "@/lib/utils";
import type { DocumentType } from "@/types";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface Props {
  memberId:  string;
  onSuccess: () => void;
}

export function DocumentUploadForm({ memberId, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const inputRef    = useRef<HTMLInputElement>(null);

  const [file,    setFile]    = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [type,    setType]    = useState<DocumentType | "">("");
  const [drag,    setDrag]    = useState(false);

  const handleFile = (f: File) => {
    if (!ACCEPTED.includes(f.type)) {
      toast.error("Format tidak valid. Gunakan JPG, PNG, atau WEBP");
      return;
    }
    if (f.size > MAX_SIZE) {
      toast.error("Ukuran file maks 5MB");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleClear = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const mutation = useMutation({
    mutationFn: () => {
      if (!file || !type) throw new Error("File dan jenis dokumen wajib dipilih");
      return memberDocumentApi.upload(memberId, file, type);
    },
    onSuccess: () => {
      toast.success("Dokumen berhasil diupload");
      queryClient.invalidateQueries({ queryKey: ["documents", memberId] });
      handleClear();
      setType("");
      onSuccess();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal upload dokumen")),
  });

  return (
    <div className="space-y-4">
      {/* Type Select */}
      <div className="space-y-1.5">
        <Label>Jenis Dokumen <span className="text-red-500">*</span></Label>
        <DocumentTypeSelect value={type} onChange={setType} />
      </div>

      {/* Drop Zone */}
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors",
            drag
              ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30"
              : "border-slate-300 dark:border-slate-600 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50",
          )}
        >
          <Upload className="h-8 w-8 text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Drag & drop file di sini
          </p>
          <p className="text-xs text-slate-500 mt-1">atau klik untuk pilih file</p>
          <p className="text-xs text-slate-400 mt-2">JPG, PNG, WEBP · Maks 5MB</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      ) : (
        /* Preview */
        <div className="relative rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <img
            src={preview!}
            alt="Preview"
            className="w-full max-h-48 object-cover"
          />
          <div className="absolute top-2 right-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-7 w-7"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <FileImage className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{file.name}</span>
              <span className="shrink-0 text-slate-400">
                ({(file.size / 1024).toFixed(0)} KB)
              </span>
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        disabled={!file || !type || mutation.isPending}
        onClick={() => mutation.mutate()}
        className="w-full"
      >
        {mutation.isPending ? "Mengupload..." : "Upload Dokumen"}
      </Button>
    </div>
  );
}
