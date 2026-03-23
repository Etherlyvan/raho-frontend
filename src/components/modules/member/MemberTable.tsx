"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Eye, Pencil, Power, Camera } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { MemberStatusBadge } from "@/components/modules/member/MemberStatusBadge";
import { memberApi } from "@/lib/api/endpoints/members";
import { formatDate, getApiErrorMessage } from "@/lib/utils";
import type { Member } from "@/types";

interface Props {
  data: Member[];
  isLoading?: boolean;
}

export function MemberTable({ data, isLoading }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [toggleTarget, setToggleTarget] = useState<Member | null>(null);
  const [consentTarget, setConsentTarget] = useState<Member | null>(null);

  const toggleMutation = useMutation({
    mutationFn: (m: Member) => memberApi.toggleActive(m.memberId),
    onSuccess: () => {
      toast.success("Status pasien berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setToggleTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal mengubah status")),
  });

  const consentMutation = useMutation({
    // ← !m.isConsentToPhoto tetap valid karena isConsentToPhoto masih ada di Member
    mutationFn: (m: Member) => memberApi.updateConsentPhoto(m.memberId, !m.isConsentToPhoto),
    onSuccess: () => {
      toast.success("Consent foto berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setConsentTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal mengubah consent")),
  });

  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: "memberNo",
      header: "No. Pasien",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-500">{row.original.memberNo}</span>
      ),
    },
    {
      id: "nama",
      header: "Nama",
      cell: ({ row }) => (
        <div>
          {/* ← row.original.fullName flat, BUKAN row.original.profile.fullName */}
          <p className="font-medium text-sm text-slate-900 dark:text-white">
            {row.original.fullName}
          </p>
          {/* ← row.original.phone flat, BUKAN row.original.profile.phone */}
          {row.original.phone && (
            <p className="text-xs text-slate-500 mt-0.5">{row.original.phone}</p>
          )}
        </div>
      ),
    },
    {
      id: "tgllahir",
      header: "Tgl Lahir",
      cell: ({ row }) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {/* ← dateOfBirth, BUKAN profile.birthDate */}
          {row.original.dateOfBirth ? formatDate(row.original.dateOfBirth) : "-"}
        </span>
      ),
    },
    {
      id: "cabang",
      header: "Cabang",
      cell: ({ row }) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {/* ← registrationBranch, BUKAN branch */}
          {row.original.registrationBranch.name}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <MemberStatusBadge status={row.original.status} />,
    },
    {
      id: "consent",
      header: "Foto",
      cell: ({ row }) => (
        <span
          className={`text-xs font-medium ${
            row.original.isConsentToPhoto ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          {row.original.isConsentToPhoto ? "Setuju" : "Tidak"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const member = row.original;
        // ← isActive di-derive dari status, BUKAN member.isActive
        const isActive = member.status === "ACTIVE";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/admin/members/${member.memberId}`)}
              >
                <Eye className="mr-2 h-4 w-4" /> Detail
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/admin/members/${member.memberId}?tab=info&edit=true`)
                }
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConsentTarget(member)}>
                <Camera className="mr-2 h-4 w-4" />
                {member.isConsentToPhoto ? "Cabut Consent Foto" : "Set Consent Foto"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={
                  isActive
                    ? "text-red-600 focus:text-red-600"
                    : "text-emerald-600 focus:text-emerald-600"
                }
                onClick={() => setToggleTarget(member)}
              >
                <Power className="mr-2 h-4 w-4" />
                {/* ← isActive dari status, BUKAN member.isActive */}
                {isActive ? "Nonaktifkan" : "Aktifkan"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // ← derive isActive dari status untuk ConfirmDialog juga
  const isTargetActive = toggleTarget?.status === "ACTIVE";

  return (
    <>
      <DataTable table={table} isLoading={isLoading} />

      {/* Confirm Toggle Status */}
      <ConfirmDialog
        open={!!toggleTarget}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={isTargetActive ? "Nonaktifkan Pasien" : "Aktifkan Pasien"}
        description={`Yakin ingin ${isTargetActive ? "menonaktifkan" : "mengaktifkan"} pasien ${
          // ← toggleTarget.fullName flat, BUKAN toggleTarget.profile.fullName
          toggleTarget?.fullName
        }?`}
        confirmLabel={isTargetActive ? "Nonaktifkan" : "Aktifkan"}
        variant={isTargetActive ? "destructive" : "default"}
        onConfirm={() => toggleTarget && toggleMutation.mutate(toggleTarget)}
        isLoading={toggleMutation.isPending}
      />

      {/* Confirm Toggle Consent Foto */}
      <ConfirmDialog
        open={!!consentTarget}
        onOpenChange={(open) => !open && setConsentTarget(null)}
        title={consentTarget?.isConsentToPhoto ? "Cabut Consent Foto" : "Set Consent Foto"}
        description={
          consentTarget?.isConsentToPhoto
            ? "Pasien tidak lagi setuju untuk difoto."
            : "Pasien menyetujui untuk difoto selama sesi. Konfirmasi perubahan?"
        }
        confirmLabel="Konfirmasi"
        onConfirm={() => consentTarget && consentMutation.mutate(consentTarget)}
        isLoading={consentMutation.isPending}
      />
    </>
  );
}
