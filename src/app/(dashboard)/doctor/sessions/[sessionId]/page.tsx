"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { SessionStatusBadge } from "@/components/shared/StatusBadge";
import { sessionApi } from "@/lib/api/endpoints/sessions";
import { formatDateTime } from "@/lib/utils";
import {
  FlaskConical, ClipboardList, FileText, BarChart2,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Rencana Terapi", href: "therapy-plan", icon: FlaskConical },
  { label: "Evaluasi", href: "evaluation", icon: BarChart2 },
  { label: "Catatan EMR", href: "emr-notes", icon: FileText },
  { label: "Full EMR Pasien", href: "full-emr", icon: ClipboardList },
];

export default function DoctorSessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const { data: session, isLoading } = useQuery({
    queryKey: ["sessions", sessionId],
    queryFn: async () =>
      (await sessionApi.detail(sessionId)).data.data,
    enabled: !!sessionId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-28" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!session) return null;

  const isLocked = session.status === "IN_PROGRESS" || session.status === "COMPLETED";

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Sesi #${session.infusKe ?? "—"} — ${session.encounter?.member?.fullName ?? "—"}`}
        description={formatDateTime(session.treatmentDate)}
      />

      {/* Info Ringkas */}
      <Card>
        <CardContent className="pt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Pasien", value: session.encounter?.member?.memberNo ?? "—" },
            { label: "Cabang", value: session.encounter?.branch?.name ?? "—" },
            { label: "Perawat", value: session.nurse?.profile?.fullName ?? "—" },
            {
              label: "Status",
              value: isLocked ? "Terkunci (tidak bisa edit therapy plan)" : "Dapat diedit",
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {value}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sub Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <button
            key={href}
            type="button"
            onClick={() =>
              router.push(`/dashboard/doctor/sessions/${sessionId}/${href}`)
            }
            className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2.5">
              <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
