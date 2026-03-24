"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import type { TherapyPlan } from "@/types";

const DOSE_DISPLAY: {
  key: keyof TherapyPlan;
  label: string;
  unit: string;
}[] = [
  { key: "hhoMl", label: "HHO", unit: "ml" },
  { key: "ifaMg", label: "IFA", unit: "mg" },
  { key: "h2Ml", label: "H₂", unit: "ml" },
  { key: "noMl", label: "NO", unit: "ml" },
  { key: "gasoMl", label: "GASO", unit: "ml" },
  { key: "o2Ml", label: "O₂", unit: "ml" },
];

interface Props {
  plan: TherapyPlan;
  /** Jika true, sembunyikan edit (saat sesi sudah mulai) */
  readOnly?: boolean;
}

export function TherapyPlanCard({ plan, readOnly = false }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm">Rencana Terapi</CardTitle>
          <div className="flex items-center gap-2">
            {readOnly && (
              <Badge
                variant="secondary"
                className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0"
              >
                Sesi Berlangsung — Tidak dapat diedit
              </Badge>
            )}
            <span className="text-xs text-slate-400">
              Direncanakan: {formatDateTime(plan.plannedAt)}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
            oleh {plan.planner.profile?.fullName ?? "—"}
        </p>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Dosis Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {DOSE_DISPLAY.map(({ key, label, unit }) => {
            const val = plan[key] as number | null;
            const isEmpty = val == null;
            return (
              <div
                key={key}
                className={`rounded-lg border p-2.5 text-center ${
                  isEmpty
                    ? "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
                    : "border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40"
                }`}
              >
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <p
                  className={`text-lg font-bold tabular-nums mt-0.5 ${
                    isEmpty
                      ? "text-slate-300 dark:text-slate-600"
                      : "text-sky-700 dark:text-sky-300"
                  }`}
                >
                  {isEmpty ? "—" : val}
                </p>
                <p className="text-xs text-slate-400">{unit}</p>
              </div>
            );
          })}
        </div>

        {/* Catatan */}
        {plan.notes && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2.5">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
              Catatan untuk Perawat
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              {plan.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
