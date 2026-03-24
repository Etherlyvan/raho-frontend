"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { DiagnosisList } from "@/components/modules/doctor/DiagnosisList";
import { encountersApi } from "@/lib/api/endpoints/encounters";

export default function DoctorDiagnosisPage() {
  const { encounterId } = useParams<{ encounterId: string }>();

  const { data: encounter, isLoading } = useQuery({
    queryKey: ["encounters", encounterId],
    queryFn: async () =>
      (await encountersApi.detail(encounterId)).data.data,
    enabled: !!encounterId,
  });

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Diagnosis"
        description={encounter ? `Encounter — ${encounter.member.fullName}` : ""}
      />
      <DiagnosisList encounterId={encounterId} />
    </div>
  );
}
