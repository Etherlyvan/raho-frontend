"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { EMRNoteForm } from "./EMRNoteForm";
import { emrNotesApi } from "@/lib/api/endpoints/emrNotes";
import { formatDateTime } from "@/lib/utils";
import type { EMRNote, EMRNoteType } from "@/types";

const NOTE_TYPE_STYLE: Record<EMRNoteType, string> = {
  ASSESSMENT:
    "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border-0",
  CLINICAL_NOTE:
    "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-0",
  OPERATIONAL_NOTE:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0",
  FOLLOW_UP:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0",
};
const NOTE_TYPE_LABEL: Record<EMRNoteType, string> = {
  ASSESSMENT: "Assessment",
  CLINICAL_NOTE: "Klinis",
  OPERATIONAL_NOTE: "Operasional",
  FOLLOW_UP: "Follow-up",
};

function NoteItem({ note }: { note: EMRNote }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3.5 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <Badge className={`text-xs shrink-0 ${NOTE_TYPE_STYLE[note.type]}`}>
          {NOTE_TYPE_LABEL[note.type] ?? note.type}
        </Badge>
        <div className="text-right">
          <p className="text-xs text-slate-500">
            {note.author.profile.fullName ?? "—"}
          </p>
          <p className="text-xs text-slate-400">
            {formatDateTime(note.createdAt)}
          </p>
        </div>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
        {note.content}
      </p>
    </div>
  );
}

interface Props {
  encounterId?: string;
  sessionId?: string;
  /** Sembunyikan tombol tambah (misal untuk role non-dokter) */
  readOnly?: boolean;
}

export function EMRNoteList({ encounterId, sessionId, readOnly = false }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const isSessionContext = !!sessionId;

  const { data: notes, isLoading } = useQuery({
    queryKey: isSessionContext
      ? ["emr-notes", "session", sessionId]
      : ["emr-notes", "encounter", encounterId],
    queryFn: async () => {
      const res = isSessionContext
        ? await emrNotesApi.listBySession(sessionId!)
        : await emrNotesApi.listByEncounter(encounterId!);
      return res.data.data;
    },
    enabled: !!(encounterId || sessionId),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Catatan EMR ({notes?.length ?? 0})
        </p>
        {!readOnly && (
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah Catatan
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : !notes?.length ? (
        <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-sm text-slate-400">Belum ada catatan EMR</p>
          {!readOnly && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Tambah Catatan Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <NoteItem key={note.noteId} note={note} />
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Catatan EMR</DialogTitle>
          </DialogHeader>
          <EMRNoteForm
            encounterId={encounterId}
            sessionId={sessionId}
            onSuccess={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
