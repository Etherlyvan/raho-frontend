"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { EncounterStatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/shared/Pagination";
import { encountersApi } from "@/lib/api/endpoints/encounters";
import { useAuthStore } from "@/store/auth.store";
import { formatDate, ENCOUNTER_STATUS_LABELS } from "@/lib/utils";
import type { Encounter, EncounterStatus, EncounterType } from "@/types";
import {
  useReactTable, getCoreRowModel, type ColumnDef,
} from "@tanstack/react-table";

const TYPE_LABEL: Record<EncounterType, string> = {
  CONSULTATION: "Konsultasi",
  TREATMENT: "Treatment",
};

export default function DoctorEncountersPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EncounterStatus | "ALL">("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["encounters", "doctor", page, search, statusFilter, user?.userId],
    queryFn: async () =>
      (
        await encountersApi.list({
          // Dokter hanya lihat encounter miliknya — filter by doctorId di params jika BE support
          page,
          limit: 15,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
        })
      ).data,
    enabled: !!user,
  });

  const columns: ColumnDef<Encounter>[] = [
    {
      accessorKey: "member",
      header: "Pasien",
      cell: (row) => {
        const e = row.row.original;
        return (
          <div>
            <p className="font-medium text-sm text-slate-900 dark:text-white">
              {e.member.fullName}
            </p>
            <p className="text-xs text-slate-400 font-mono">{e.member.memberNo}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Tipe",
      cell: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {TYPE_LABEL[row.row.original.type]}
        </span>
      ),
    },
    {
      accessorKey: "treatmentDate",
      header: "Tanggal",
      cell: (row) => (
        <span className="text-sm tabular-nums">
          {formatDate(row.row.original.treatmentDate)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row) => <EncounterStatusBadge status={row.row.original.status} />,
    },
    {
      accessorKey: "branch",
      header: "Cabang",
      cell: (row) => (
        <span className="text-sm text-slate-500">
          {row.row.original.branch.name}
        </span>
      ),
    },
    {
      id: "count",
      header: "Sesi / Diagnosis",
      cell: (row) => {
        const { _count } = row.row.original;
        return (
          <span className="text-xs text-slate-500 tabular-nums">
            {_count.sessions}s / {_count.diagnoses}d
          </span>
        );
      },
    },
  ];

  const table = useReactTable<Encounter>({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    });

  return (
    <div className="space-y-5">
      <PageHeader
            title="Encounter Saya"
            description="Daftar semua encounter yang ditangani"
            >
            <Button onClick={() => router.push("/doctor/encounters/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Buat Encounter
            </Button>
        </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Cari nama pasien..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-56"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as EncounterStatus | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            {(Object.keys(ENCOUNTER_STATUS_LABELS) as EncounterStatus[]).map(
              (s) => (
                <SelectItem key={s} value={s}>
                  {ENCOUNTER_STATUS_LABELS[s]}
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
