"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, ShieldOff } from "lucide-react";
import { Button }        from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { branchAccessApi } from "@/lib/api/endpoints/branchAccess";
import { formatDate, getApiErrorMessage } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { BranchAccess } from "@/types";

interface Props {
  accesses: BranchAccess[];
  memberId: string;
}

export function BranchAccessList({ accesses, memberId }: Props) {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const [revokeTarget, setRevokeTarget] = useState<BranchAccess | null>(null);

  const revokeMutation = useMutation({
    mutationFn: (access: BranchAccess) =>
      branchAccessApi.revoke(access.accessId),
    onSuccess: () => {
      toast.success("Akses berhasil dicabut");
      queryClient.invalidateQueries({ queryKey: ["branch-access", memberId] });
      setRevokeTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal mencabut akses")),
  });

  if (accesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="h-10 w-10 text-slate-300 mb-3" />
        <p className="text-sm text-slate-500">Belum ada cabang yang punya akses</p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {accesses.map((access) => (
          <li
            key={access.accessId}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-slate-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {access.branch.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {access.branch.city} · Akses sejak {formatDate(access.grantedAt)}
                  {access.grantedBy && (
                    <span className="ml-2">by {access.grantedBy.fullName}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Hanya MASTER_ADMIN / SUPER_ADMIN bisa cabut */}
            {hasRole("MASTER_ADMIN", "SUPER_ADMIN") && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 shrink-0 text-xs h-7"
                onClick={() => setRevokeTarget(access)}
              >
                <ShieldOff className="mr-1.5 h-3 w-3" />
                Cabut
              </Button>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Cabut Akses Cabang"
        description={`Yakin ingin mencabut akses "${revokeTarget?.branch.name}" ke pasien ini?`}
        confirmLabel="Cabut Akses"
        variant="destructive"
        onConfirm={() => revokeTarget && revokeMutation.mutate(revokeTarget)}
        isLoading={revokeMutation.isPending}
      />
    </>
  );
}
