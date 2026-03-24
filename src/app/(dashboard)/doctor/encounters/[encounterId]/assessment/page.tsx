"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { AssessmentForm } from "@/components/modules/doctor/AssessmentForm";
import { encountersApi } from "@/lib/api/endpoints/encounters";

export default function DoctorAssessmentPage() {
  const { encounterId } = useParams<{ encounterId: string }>();

  const { data: encounter, isLoading } = useQuery({
    queryKey: ["encounters", encounterId],
    queryFn: async () =>
      (await encountersApi.detail(encounterId)).data.data,
    enabled: !!encounterId,
  });

  if (isLoading) return <Skeleton className="h-96" />;
  if (!encounter) return null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Assessment & Treatment Plan"
        description={`Encounter — ${encounter.member.fullName}`}
      />
      <AssessmentForm encounter={encounter} />
    </div>
  );
}
