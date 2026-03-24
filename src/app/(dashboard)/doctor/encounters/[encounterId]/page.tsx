"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { EncounterStatusBadge } from "@/components/shared/StatusBadge";
import { encountersApi } from "@/lib/api/endpoints/encounters";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  ClipboardList, Stethoscope, FileText, Activity,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Assessment", href: "assessment", icon: ClipboardList },
  { label: "Diagnosis", href: "diagnosis", icon: Stethoscope },
  { label: "Catatan EMR", href: "emr-notes", icon: FileText },
];

export default function DoctorEncounterDetailPage() {
  const { encounterId } = useParams<{ encounterId: string }>();
  const router = useRouter();

  const { data: encounter, isLoading } = useQuery({
    queryKey: ["encounters", encounterId],
    queryFn: async () =>
      (await encountersApi.detail(encounterId)).data.data,
    enabled: !!encounterId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-36" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (!encounter) return null;

  return (
    <div className="space-y-5">
    <PageHeader
        title={`Encounter — ${encounter.member.fullName}`}
        description="..."
        >
        <EncounterStatusBadge status={encounter.status} />
    </PageHeader>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Tipe", value: encounter.type === "TREATMENT" ? "Treatment" : "Konsultasi" },
            { label: "Cabang", value: encounter.branch.name },
            { label: "Sesi", value: `${encounter._count?.sessions ?? 0} sesi` },
            { label: "Diagnosis", value: `${encounter._count?.diagnoses ?? 0} diagnosis` },
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

      {/* Assessment Status */}
      {encounter.assessment && (
        <div className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-emerald-500" />
          <span className="text-slate-600 dark:text-slate-400">
            Assessment:{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {encounter.assessment.eligibility === "ELIGIBLE"
                ? "Layak"
                : encounter.assessment.eligibility === "NOT_ELIGIBLE"
                ? "Tidak Layak"
                : "Bersyarat"}
            </span>
          </span>
          {encounter.treatmentPlan?.protocol && (
            <Badge variant="secondary" className="text-xs">
              {encounter.treatmentPlan.protocol}
            </Badge>
          )}
        </div>
      )}

      {/* Sub-page Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <button
            key={href}
            type="button"
            onClick={() =>
              router.push(
                `/dashboard/doctor/encounters/${encounterId}/${href}`
              )
            }
            className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2">
              <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
