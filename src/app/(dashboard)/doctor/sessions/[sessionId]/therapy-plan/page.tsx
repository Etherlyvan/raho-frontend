"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { TherapyPlanCard } from "@/components/modules/doctor/TherapyPlanCard";
import { TherapyPlanForm } from "@/components/modules/doctor/TherapyPlanForm";
import { therapyPlanApi } from "@/lib/api/endpoints/therapyPlan";
import { sessionApi } from "@/lib/api/endpoints/sessions";
import { Pencil } from "lucide-react";

export default function DoctorTherapyPlanPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [editMode, setEditMode] = useState(false);

  const { data: session } = useQuery({
    queryKey: ["sessions", sessionId],
    queryFn: async () => (await sessionApi.detail(sessionId)).data.data,
    enabled: !!sessionId,
  });

  const { data: plan, isLoading } = useQuery({
    queryKey: ["therapy-plan", sessionId],
    queryFn: async () => {
      try {
        return (await therapyPlanApi.get(sessionId)).data.data;
      } catch {
        return null;
      }
    },
    enabled: !!sessionId,
  });

  const isLocked =
    session?.status === "IN_PROGRESS" || session?.status === "COMPLETED";

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-5">
      <PageHeader title="Rencana Terapi" description="...">
            {plan && !isLocked && !editMode ? (
                <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit Rencana
                </Button>
            ) : null}
        </PageHeader>

      {plan && !editMode ? (
        <TherapyPlanCard plan={plan} readOnly={isLocked} />
      ) : (
        <div className="max-w-xl">
          <TherapyPlanForm
            sessionId={sessionId}
            existing={plan}
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
