"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Power, KeyRound, Eye } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button }               from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable }            from "@/components/shared/DataTable";
import { ConfirmDialog }        from "@/components/shared/ConfirmDialog";
import { RoleBadge }            from "@/components/modules/user/RoleBadge";
import { BranchStatusBadge }    from "@/components/modules/branch/BranchStatusBadge";
import { ResetPasswordDialog }  from "@/components/modules/user/ResetPasswordDialog";
import { userApi }              from "@/lib/api/endpoints/users";
import { formatDate, getApiErrorMessage } from "@/lib/utils";
import type { StaffUser }       from "@/types";

interface Props {
  data:       StaffUser[];
  isLoading?: boolean;
  basePath:   string;
}

export function UserTable({ data, isLoading, basePath }: Props) {
  const router      = useRouter();
  const queryClient = useQueryClient();

  const [toggleTarget, setToggleTarget]     = useState<StaffUser | null>(null);
  const [resetTarget, setResetTarget]       = useState<StaffUser | null>(null);

  const toggleMutation = useMutation({
    mutationFn: (userId: string) => userApi.toggleActive(userId),
    onSuccess: () => {
      toast.success("Status staff berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setToggleTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal mengubah status")),
  });

  const columns: ColumnDef<StaffUser>[] = [
    {
      id:   "user",
      header: "Staff",
      cell: ({ row }) => {
        const u = row.original;
        const name     = u.profile?.fullName ?? u.email;
        const initials = name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={u.profile?.avatarUrl ?? undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                {u.profile?.fullName ?? "-"}
              </p>
              <p className="text-xs text-slate-500 truncate">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "staffCode",
      header:      "Kode Staff",
      cell:        ({ row }) => (
        <span className="font-mono text-xs text-slate-500">
          {row.original.staffCode ?? "-"}
        </span>
      ),
    },
    {
      id:     "role",
      header: "Role",
      cell:   ({ row }) => <RoleBadge role={row.original.role.name} />,
    },
    {
      id:     "branch",
      header: "Cabang",
      cell:   ({ row }) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {row.original.branch?.name ?? "-"}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header:      "Status",
      cell:        ({ row }) => <BranchStatusBadge isActive={row.original.isActive} />,
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
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`${basePath}/users/${user.userId}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Detail
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`${basePath}/users/${user.userId}?edit=true`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setResetTarget(user)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={user.isActive
                  ? "text-red-600 focus:text-red-600"
                  : "text-emerald-600 focus:text-emerald-600"
                }
                onClick={() => setToggleTarget(user)}
              >
                <Power className="mr-2 h-4 w-4" />
                {user.isActive ? "Nonaktifkan" : "Aktifkan"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const [sorting, setSorting] = useState<SortingState>([]);
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

      <ConfirmDialog
        open={!!toggleTarget}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={toggleTarget?.isActive ? "Nonaktifkan Akun" : "Aktifkan Akun"}
        description={`Yakin ingin ${toggleTarget?.isActive ? "menonaktifkan" : "mengaktifkan"} akun "${toggleTarget?.profile?.fullName ?? toggleTarget?.email}"?`}
        confirmLabel={toggleTarget?.isActive ? "Nonaktifkan" : "Aktifkan"}
        variant={toggleTarget?.isActive ? "destructive" : "default"}
        onConfirm={() => toggleTarget && toggleMutation.mutate(toggleTarget.userId)}
        isLoading={toggleMutation.isPending}
      />

      {resetTarget && (
        <ResetPasswordDialog
          open={!!resetTarget}
          onOpenChange={(open) => !open && setResetTarget(null)}
          userId={resetTarget.userId}
          userName={resetTarget.profile?.fullName ?? resetTarget.email}
        />
      )}
    </>
  );
}
