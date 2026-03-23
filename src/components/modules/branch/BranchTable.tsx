"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Power, BarChart3 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button }            from "@/components/ui/button";
import { Badge }             from "@/components/ui/badge";
import { DataTable }         from "@/components/shared/DataTable";
import { ConfirmDialog }     from "@/components/shared/ConfirmDialog";
import { BranchStatusBadge } from "@/components/modules/branch/BranchStatusBadge";
import { branchApi }         from "@/lib/api/endpoints/branches";
import { formatDate, getApiErrorMessage } from "@/lib/utils";
import { useAuth }           from "@/hooks/useAuth";
import type { Branch }       from "@/types";

interface Props {
  data:       Branch[];
  isLoading?: boolean;
  basePath:   string;   // "/superadmin" | "/masteradmin"
}

export function BranchTable({ data, isLoading, basePath }: Props) {
  const router      = useRouter();
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  const [sorting, setSorting]               = useState<SortingState>([]);
  const [toggleTarget, setToggleTarget]     = useState<Branch | null>(null);

  const toggleMutation = useMutation({
    mutationFn: (branchId: string) => branchApi.toggleActive(branchId),
    onSuccess: (_, branchId) => {
      toast.success("Status cabang berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      queryClient.invalidateQueries({ queryKey: ["branches", branchId] });
      setToggleTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal mengubah status")),
  });

  const columns: ColumnDef<Branch>[] = [
    {
      accessorKey: "branchCode",
      header:      "Kode",
      cell:        ({ row }) => (
        <span className="font-mono text-xs text-slate-500">
          {row.original.branchCode}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header:      "Nama Cabang",
      cell:        ({ row }) => (
        <span className="font-medium text-slate-900 dark:text-white">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "city",
      header:      "Kota",
    },
    {
      accessorKey: "tipe",
      header:      "Tipe",
      cell:        ({ row }) => (
        <Badge variant="secondary" className="text-xs">
          {row.original.tipe === "KLINIK" ? "Klinik" : "Homecare"}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header:      "Status",
      cell:        ({ row }) => (
        <BranchStatusBadge isActive={row.original.isActive} />
      ),
    },
    {
      accessorKey: "createdAt",
      header:      "Dibuat",
      cell:        ({ row }) => (
        <span className="text-sm text-slate-500">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id:   "actions",
      cell: ({ row }) => {
        const branch = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`${basePath}/branches/${branch.branchId}`)}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Detail & Statistik
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`${basePath}/branches/${branch.branchId}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>

              {/* Toggle hanya SUPER_ADMIN */}
              {hasRole("SUPER_ADMIN") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={branch.isActive
                      ? "text-red-600 focus:text-red-600"
                      : "text-emerald-600 focus:text-emerald-600"
                    }
                    onClick={() => setToggleTarget(branch)}
                  >
                    <Power className="mr-2 h-4 w-4" />
                    {branch.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state:    { sorting },
    onSortingChange:   setSorting,
    getCoreRowModel:   getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <DataTable table={table} isLoading={isLoading} />

      {/* Confirm Toggle Active */}
      <ConfirmDialog
        open={!!toggleTarget}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={toggleTarget?.isActive ? "Nonaktifkan Cabang" : "Aktifkan Cabang"}
        description={`Yakin ingin ${toggleTarget?.isActive ? "menonaktifkan" : "mengaktifkan"} cabang "${toggleTarget?.name}"?`}
        confirmLabel={toggleTarget?.isActive ? "Nonaktifkan" : "Aktifkan"}
        variant={toggleTarget?.isActive ? "destructive" : "default"}
        onConfirm={() => toggleTarget && toggleMutation.mutate(toggleTarget.branchId)}
        isLoading={toggleMutation.isPending}
      />
    </>
  );
}
