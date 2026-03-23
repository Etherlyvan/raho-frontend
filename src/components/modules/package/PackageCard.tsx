"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress }  from "@/components/ui/progress";
import { Button }    from "@/components/ui/button";
import { Badge }     from "@/components/ui/badge";
import { ConfirmDialog }      from "@/components/shared/ConfirmDialog";
import { PackageStatusBadge } from "@/components/modules/package/PackageStatusBadge";
import { ConfirmPaymentDialog } from "@/components/modules/package/ConfirmPaymentDialog";
import { memberPackageApi }   from "@/lib/api/endpoints/memberPackages";
import { formatDate, getApiErrorMessage } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { MemberPackage } from "@/types";

interface Props {
  pkg:      MemberPackage;
  memberId: string;
}

export function PackageCard({ pkg, memberId }: Props) {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  const [showCancel,  setShowCancel]  = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const progressPct = pkg.totalSessions > 0
    ? Math.round((pkg.usedSessions / pkg.totalSessions) * 100)
    : 0;

  const cancelMutation = useMutation({
    mutationFn: () => memberPackageApi.cancel(memberId, pkg.memberPackageId),
    onSuccess: () => {
      toast.success("Paket berhasil dibatalkan");
      queryClient.invalidateQueries({ queryKey: ["packages", memberId] });
      setShowCancel(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal membatalkan paket")),
  });

  return (
    <>
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-semibold">
                  {pkg.type}
                </Badge>
                <PackageStatusBadge status={pkg.status} />
                <span className="text-xs text-slate-500 font-mono">
                  {pkg.branch.name}
                </span>
              </div>

              {/* Progress */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Sesi terpakai</span>
                  <span className="font-medium">
                    {pkg.usedSessions} / {pkg.totalSessions}
                  </span>
                </div>
                <Progress value={progressPct} className="h-2" />
              </div>

              {/* Dates */}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                {pkg.startDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Mulai: {formatDate(pkg.startDate)}
                  </span>
                )}
                {pkg.endDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Berakhir: {formatDate(pkg.endDate)}
                  </span>
                )}
                {pkg.paidAt && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    ✓ Dibayar: {formatDate(pkg.paidAt)}
                  </span>
                )}
              </div>

              {pkg.notes && (
                <p className="mt-2 text-xs text-slate-400 italic">{pkg.notes}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              {pkg.status === "PENDING_PAYMENT" && (
                <Button
                  size="sm"
                  variant="default"
                  className="text-xs h-7"
                  onClick={() => setShowConfirm(true)}
                >
                  Konfirmasi Bayar
                </Button>
              )}
              {pkg.status === "PENDING_PAYMENT" && hasRole("MASTER_ADMIN") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setShowCancel(true)}
                >
                  Batalkan
                </Button>
              )}
              <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showCancel}
        onOpenChange={setShowCancel}
        title="Batalkan Paket"
        description={`Yakin ingin membatalkan paket ${pkg.type} ini? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Batalkan Paket"
        variant="destructive"
        onConfirm={() => cancelMutation.mutate()}
        isLoading={cancelMutation.isPending}
      />

      <ConfirmPaymentDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        memberId={memberId}
        packageId={pkg.memberPackageId}
        packageType={pkg.type}
      />
    </>
  );
}
