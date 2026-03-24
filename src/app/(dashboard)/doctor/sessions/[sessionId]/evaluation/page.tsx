"use client";

import { useParams, useRouter } from "next/navigation"; // ← tambah useRouter
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil } from "lucide-react"; // ← Pencil, bukan Plus
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { EvaluationCard } from "@/components/modules/doctor/EvaluationCard";
import { EvaluationForm } from "@/components/modules/doctor/EvaluationForm";
import { evaluationApi } from "@/lib/api/endpoints/evaluation";

export default function DoctorEvaluationPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter(); // ← inisialisasi router
  const [editMode, setEditMode] = useState(false);

  const { data: evaluation, isLoading } = useQuery({
    queryKey: ["evaluation", sessionId],
    queryFn: async () => {
      try {
        return (await evaluationApi.get(sessionId)).data.data;
      } catch {
        return null;
      }
    },
    enabled: !!sessionId,
  });

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Evaluasi Dokter"
        description="Penilaian kondisi dan progress pasien pasca sesi"
      >
        {evaluation && !editMode ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditMode(true)}
          >
            <Pencil className="mr-1.5 h-4 w-4" />
            Edit Evaluasi
          </Button>
        ) : null}
      </PageHeader>

      {evaluation && !editMode ? (
        <EvaluationCard evaluation={evaluation} />
      ) : (
        <div className="max-w-2xl">
          <EvaluationForm
            sessionId={sessionId}
            existing={evaluation}
            onSuccess={() => setEditMode(false)}
          />
          {editMode && (
            <Button
              type="button"
              variant="outline"
              className="mt-3"
              onClick={() => setEditMode(false)}
            >
              Batal
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
