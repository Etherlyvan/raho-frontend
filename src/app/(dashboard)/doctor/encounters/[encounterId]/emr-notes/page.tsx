"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { EMRNoteList } from "@/components/modules/doctor/EMRNoteList";
import { encountersApi } from "@/lib/api/endpoints/encounters";

export default function DoctorEncounterEMRPage() {
  const { encounterId } = useParams<{ encounterId: string }>();

  const { data: encounter, isLoading } = useQuery({
    queryKey: ["encounters", encounterId],
    queryFn: async () =>
      (await encountersApi.detail(encounterId)).data.data,
    enabled: !!encounterId,
  });

  if (isLoading) return <Skeleton className="h-48" />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Catatan EMR — Encounter"
        description={encounter ? `${encounter.member.fullName} · ${encounter.member.memberNo}` : ""}
      />
      <EMRNoteList encounterId={encounterId} />
    </div>
  );
}
