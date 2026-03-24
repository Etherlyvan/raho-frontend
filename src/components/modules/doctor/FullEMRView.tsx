"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { emrNotesApi } from "@/lib/api/endpoints/emrNotes";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { EMREntry } from "@/types";
import {
  Stethoscope, FlaskConical, FileText, ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";

// ─── Sub-components ───────────────────────────────────────

function EMRNoteChip({ type, content }: { type: string; content: string }) {
  const style: Record<string, string> = {
    ASSESSMENT: "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300",
    CLINICAL_NOTE: "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300",
    OPERATIONAL_NOTE: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
    FOLLOW_UP: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
  };
  const label: Record<string, string> = {
    ASSESSMENT: "Assessment",
    CLINICAL_NOTE: "Klinis",
    OPERATIONAL_NOTE: "Operasional",
    FOLLOW_UP: "Follow-up",
  };

  return (
    <div className={`rounded-md border px-3 py-2 ${style[type] ?? "bg-slate-50 border-slate-200"}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-0.5">
        {label[type] ?? type}
      </p>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

function SessionBlock({
  session,
}: {
  session: EMREntry["sessions"][number];
}) {
  const [expanded, setExpanded] = useState(false);

  const statusColor: Record<string, string> = {
    PLANNED: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    INPROGRESS: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    POSTPONED: "bg-slate-100 text-slate-500",
  };
  const statusLabel: Record<string, string> = {
    PLANNED: "Dijadwalkan",
    INPROGRESS: "Berlangsung",
    COMPLETED: "Selesai",
    POSTPONED: "Ditunda",
  };

  return (
    <div className="ml-4 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
      <button
        type="button"
        className="flex items-center gap-2 w-full text-left group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 -ml-5 shrink-0" />
        <span className="text-xs text-slate-500">
          {formatDate(session.sessionDate, "dd MMM yyyy")}
        </span>
        <Badge
          className={`text-xs border-0 ${statusColor[session.status] ?? ""}`}
        >
          {statusLabel[session.status] ?? session.status}
        </Badge>
        {session.notes && (
          <span className="text-xs text-slate-400 truncate flex-1">
            {session.notes}
          </span>
        )}
        <span className="text-slate-400 ml-auto shrink-0">
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </span>
      </button>

        {expanded && session.notes && (
            <div className="mt-2 ml-1">
                <EMRNoteChip type="OPERATIONAL_NOTE" content={session.notes} />
            </div>
        )}
    </div>
  );
}

function EncounterBlock({ entry }: { entry: EMREntry }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative">
      {/* Timeline Dot */}
      <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-500 border-2 border-white dark:border-slate-900" />

      <div className="ml-6">
        {/* Encounter Header */}
        <button
          type="button"
          className="flex items-center gap-3 w-full text-left mb-2 group"
          onClick={() => setCollapsed(!collapsed)}
        >
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {entry.type === "TREATMENT" ? (
                <span className="inline-flex items-center gap-1.5">
                  <FlaskConical className="h-3.5 w-3.5 text-sky-500" />
                  Encounter Treatment
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-violet-500" />
                  Konsultasi
                </span>
              )}
            </p>
            <p className="text-xs text-slate-400">
              {formatDate(entry.encounterDate)} · Dr.{" "}
              {entry.doctor.fullName}
            </p>
          </div>
          {entry.diagnosis && (
            <Badge
              variant="secondary"
              className="text-xs ml-auto shrink-0 max-w-48 truncate"
            >
              {entry.diagnosis}
            </Badge>
          )}
          <span className="text-slate-400 shrink-0">
            {collapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </span>
        </button>

        {!collapsed && (
          <div className="space-y-3">
            {/* EMR Notes Encounter */}
            {entry.emrNotes?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Catatan Encounter
                </p>
                {entry.emrNotes.map((note) => (
                  <EMRNoteChip
                    key={note.noteId}
                    type={note.type}
                    content={note.content}
                  />
                ))}
              </div>
            )}

            {/* Sessions */}
            {entry.sessions?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  Sesi ({entry.sessions.length})
                </p>
                <div className="space-y-2">
                  {entry.sessions.map((s) => (
                    <SessionBlock key={s.sessionId} session={s} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────

interface Props {
  memberId: string;
}

export function FullEMRView({ memberId }: Props) {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["emr", "full", memberId],
    queryFn: async () =>
      (await emrNotesApi.fullEmr(memberId)).data.data,
    enabled: !!memberId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (!entries?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm text-slate-400">Belum ada riwayat EMR untuk pasien ini</p>
      </div>
    );
  }

  // Sort DESC by encounterDate
  const sorted = [...entries].sort(
    (a, b) =>
      new Date(b.encounterDate).getTime() - new Date(a.encounterDate).getTime()
  );

  return (
    <div className="relative">
      {/* Vertical Timeline Line */}
      <div className="absolute left-1.5 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />

      <div className="space-y-6">
        {sorted.map((entry) => (
          <EncounterBlock key={entry.encounterId} entry={entry} />
        ))}
      </div>
    </div>
  );
}
