"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { EMRNoteList } from "@/components/modules/doctor/EMRNoteList";

export default function DoctorSessionEMRPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Catatan EMR — Sesi"
        description="Catatan operasional dan klinis per sesi"
      />
      <EMRNoteList sessionId={sessionId} />
    </div>
  );
}
