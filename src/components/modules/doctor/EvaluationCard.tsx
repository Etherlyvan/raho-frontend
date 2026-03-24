"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import type { SessionEvaluation, EvaluationProgress } from "@/types";
import { ArrowRight } from "lucide-react";

const PROGRESS_STYLE: Record<EvaluationProgress, string> = {
  IMPROVING: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0",
  STABLE: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-0",
  DECLINING: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-0",
};
const PROGRESS_LABEL: Record<EvaluationProgress, string> = {
  IMPROVING: "Membaik",
  STABLE: "Stabil",
  DECLINING: "Memburuk",
};

interface Props {
  evaluation: SessionEvaluation;
}

export function EvaluationCard({ evaluation }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm">Evaluasi Dokter</CardTitle>
          <div className="flex items-center gap-2">
            {evaluation.progress && (
              <Badge className={`text-xs ${PROGRESS_STYLE[evaluation.progress]}`}>
                {PROGRESS_LABEL[evaluation.progress]}
              </Badge>
            )}
            <span className="text-xs text-slate-400">
              {formatDateTime(evaluation.updatedAt)}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          oleh {evaluation.doctor.profile.fullName ?? "—"}
        </p>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {evaluation.condition && (
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
              Kondisi Pasien
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {evaluation.condition}
            </p>
          </div>
        )}

        {evaluation.recommendation && (
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
              Rekomendasi
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {evaluation.recommendation}
            </p>
          </div>
        )}

        {evaluation.planChanges?.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">
              Perubahan Rencana Terapi ({evaluation.planChanges.length})
            </p>
            <div className="space-y-2">
              {evaluation.planChanges.map((change, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 font-mono">
                      {change.field}
                    </span>
                    <span className="text-xs text-slate-500">{change.from}</span>
                    <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {change.to}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 italic">
                    Alasan: {change.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
