"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DiagnosisForm } from "./DiagnosisForm";
import { diagnosisApi } from "@/lib/api/endpoints/diagnoses";
import { getApiErrorMessage } from "@/lib/utils";
import type { Diagnosis, ICDClassification } from "@/types";

const CLASS_STYLE: Record<ICDClassification, string> = {
  primer: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border-0",
  sekunder: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-0",
  tersier: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0",
};
const CLASS_LABEL: Record<ICDClassification, string> = {
  primer: "Primer",
  sekunder: "Sekunder",
  tersier: "Tersier",
};

function DiagnosisRow({
  diagnosis,
  encounterId,
  readOnly,
}: {
  diagnosis: Diagnosis;
  encounterId: string;
  readOnly: boolean;
}) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => diagnosisApi.remove(encounterId, diagnosis.diagnosisId),
    onSuccess: () => {
      toast.success("Diagnosis berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["diagnoses", encounterId] });
      queryClient.invalidateQueries({ queryKey: ["encounters", encounterId] });
      setDeleteOpen(false);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Gagal menghapus diagnosis"));
    },
  });

  const hasClinical =
    diagnosis.anamnesis ||
    diagnosis.physicalExam ||
    diagnosis.supportingExam ||
    diagnosis.differentialDiagnosis ||
    diagnosis.workingDiagnosis;

  return (
    <>
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        {/* Header Row */}
        <div className="flex items-start justify-between p-4">
          <div className="flex items-start gap-3 min-w-0">
            <Badge className={`text-xs shrink-0 mt-0.5 ${CLASS_STYLE[diagnosis.classification as ICDClassification]}`}>
              {CLASS_LABEL[diagnosis.classification as ICDClassification] ?? diagnosis.classification}
            </Badge>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-900 dark:text-white">
                {diagnosis.icdCode}{" "}
                <span className="font-normal text-slate-600 dark:text-slate-400">
                  — {diagnosis.icdDescription}
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                oleh {diagnosis.createdBy.profile.fullName ?? "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {hasClinical && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
            {!readOnly && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-600"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Expandable Clinical Data */}
        {expanded && hasClinical && (
          <div className="border-t border-slate-100 dark:border-slate-800 px-4 pb-4 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Anamnesis", value: diagnosis.anamnesis },
              { label: "Pemeriksaan Fisik", value: diagnosis.physicalExam },
              { label: "Pemeriksaan Penunjang", value: diagnosis.supportingExam },
              { label: "Diagnosis Banding", value: diagnosis.differentialDiagnosis },
              { label: "Diagnosis Kerja", value: diagnosis.workingDiagnosis },
            ]
              .filter((f) => f.value)
              .map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {value}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Diagnosis</DialogTitle>
          </DialogHeader>
          <DiagnosisForm
            encounterId={encounterId}
            existing={diagnosis}
            onSuccess={() => setEditOpen(false)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Diagnosis"
        description={`Yakin ingin menghapus diagnosis ${diagnosis.icdCode} — ${diagnosis.icdDescription}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

interface Props {
  encounterId: string;
  readOnly?: boolean;
}

export function DiagnosisList({ encounterId, readOnly = false }: Props) {
  const [addOpen, setAddOpen] = useState(false);

  const { data: diagnoses, isLoading } = useQuery({
    queryKey: ["diagnoses", encounterId],
    queryFn: async () => (await diagnosisApi.list(encounterId)).data.data,
  });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Daftar Diagnosis ({diagnoses?.length ?? 0})
        </p>
        {!readOnly && (
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah Diagnosis
          </Button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : !diagnoses?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-slate-400">Belum ada diagnosis untuk encounter ini</p>
            {!readOnly && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => setAddOpen(true)}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Tambah Diagnosis Pertama
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {diagnoses.map((d) => (
            <DiagnosisRow
              key={d.diagnosisId}
              diagnosis={d}
              encounterId={encounterId}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Diagnosis</DialogTitle>
          </DialogHeader>
          <DiagnosisForm
            encounterId={encounterId}
            onSuccess={() => setAddOpen(false)}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
