"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  useReactTable, getCoreRowModel, type ColumnDef,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { SessionStatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/shared/Pagination";
import { sessionApi } from "@/lib/api/endpoints/sessions";
import { useAuthStore } from "@/store/auth.store";
import { formatDate, SESSION_STATUS_LABELS } from "@/lib/utils";
import type { TreatmentSession, SessionStatus } from "@/types";

export default function DoctorSessionsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<SessionStatus | "ALL">("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["sessions", "doctor", page, dateFrom, dateTo, statusFilter],
    queryFn: async () =>
      (
        await sessionApi.list({
          page,
          limit: 15,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        })
      ).data,
    enabled: !!user,
  });

  const columns: ColumnDef<TreatmentSession>[] = [
    {
      accessorKey: "treatmentDate",
      header: "Tanggal",
      cell: (row) => (
        <span className="text-sm tabular-nums">
          {formatDate(row.row.original.treatmentDate, "dd MMM yyyy, HH:mm")}
        </span>
      ),
    },
    {
      id: "member",
      header: "Pasien",
      cell: (row) => {
        const s = row.row.original;
        return (
          <div>
            <p className="font-medium text-sm text-slate-900 dark:text-white">
              {s.encounter?.member?.fullName ?? "—"}
            </p>
            <p className="text-xs text-slate-400 font-mono">
              {s.encounter?.member?.memberNo ?? "—"}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "infusKe",
      header: "Infus Ke",
      cell: (row) => (
        <span className="text-sm tabular-nums text-slate-600 dark:text-slate-400">
          {row.row.original.infusKe != null ? `#${row.row.original.infusKe}` : "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <SessionStatusBadge status={row.row.original.status} />
          {row.row.original.status === "IN_PROGRESS" && (
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </div>
      ),
    },
    {
        id: "branch",
        header: "Cabang",
        cell: (row) => (
            <span className="text-sm text-slate-500">
            {row.row.original.encounter?.branch?.name ?? "—"}
            </span>
        ),
    },
  ];

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sesi Treatment"
        description="Daftar sesi yang melibatkan Anda sebagai dokter"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="w-44"
          placeholder="Dari tanggal"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="w-44"
          placeholder="Sampai tanggal"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as SessionStatus | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            {(Object.keys(SESSION_STATUS_LABELS) as SessionStatus[]).map(
              (s) => (
                <SelectItem key={s} value={s}>
                  {SESSION_STATUS_LABELS[s]}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      <DataTable table={table} isLoading={isLoading} />

        {data && (
        <Pagination meta={data.meta} page={page} onPageChange={setPage} />
        )}
    </div>
  );
}
