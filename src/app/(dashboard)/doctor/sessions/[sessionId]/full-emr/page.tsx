"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { FullEMRView } from "@/components/modules/doctor/FullEMRView";
import { sessionApi } from "@/lib/api/endpoints/sessions";

export default function DoctorFullEMRPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const { data: session, isLoading } = useQuery({
    queryKey: ["sessions", sessionId],
    queryFn: async () =>
      (await sessionApi.detail(sessionId)).data.data,
    enabled: !!sessionId,
  });

  if (isLoading) return <Skeleton className="h-48" />;

  const memberId = session?.encounter?.member?.memberId;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Full EMR Pasien"
        description={
          session
            ? `${session.encounter?.member?.fullName ?? "—"} · ${session.encounter?.member?.memberNo ?? "—"}`
            : ""
        }
       
      />
      {memberId ? (
        <FullEMRView memberId={memberId} />
      ) : (
        <p className="text-sm text-slate-400">Data pasien tidak ditemukan.</p>
      )}
    </div>
  );
}
