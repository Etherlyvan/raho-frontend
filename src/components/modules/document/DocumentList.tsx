"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, ExternalLink, FileImage } from "lucide-react";
import { Button }        from "@/components/ui/button";
import { Badge }         from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { memberDocumentApi } from "@/lib/api/endpoints/memberDocuments";
import { formatDate, getApiErrorMessage } from "@/lib/utils";
import type { MemberDocument } from "@/types";

const DOC_LABELS: Record<string, string> = {
  IDENTITAS:      "Identitas",
  FOTO_PASIEN:    "Foto Pasien",
  KARTU_ASURANSI: "Asuransi",
  RESEP_DOKTER:   "Resep Dokter",
  HASIL_LAB:      "Hasil Lab",
  LAINNYA:        "Lainnya",
};

interface Props {
  documents: MemberDocument[];
  memberId:  string;
  canDelete?: boolean;
}

export function DocumentList({ documents, memberId, canDelete = true }: Props) {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<MemberDocument | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (doc: MemberDocument) =>
      memberDocumentApi.delete(memberId, doc.documentId),
    onSuccess: () => {
      toast.success("Dokumen berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["documents", memberId] });
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal menghapus dokumen")),
  });

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileImage className="h-10 w-10 text-slate-300 mb-3" />
        <p className="text-sm text-slate-500">Belum ada dokumen</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {documents.map((doc) => (
          <div
            key={doc.documentId}
            className="group relative rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Image */}
            <div className="aspect-square bg-slate-100 dark:bg-slate-800">
              <img
                src={doc.url}
                alt={doc.filename ?? "Dokumen"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "";
                }}
              />
            </div>

            {/* Info */}
            <div className="p-2">
              <Badge variant="secondary" className="text-xs mb-1">
                {DOC_LABELS[doc.type] ?? doc.type}
              </Badge>
              <p className="text-xs text-slate-500">{formatDate(doc.createdAt)}</p>
            </div>

            {/* Hover actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={() => window.open(doc.url, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              {canDelete && (
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => setDeleteTarget(doc)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Dokumen"
        description="Yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="destructive"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
