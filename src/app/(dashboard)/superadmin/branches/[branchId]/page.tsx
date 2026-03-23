"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Power, ArrowLeft } from "lucide-react";
import { Button }          from "@/components/ui/button";
import { Badge }           from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton }        from "@/components/ui/skeleton";
import { PageHeader }      from "@/components/shared/PageHeader";
import { ConfirmDialog }   from "@/components/shared/ConfirmDialog";
import { BranchStatsCard } from "@/components/modules/branch/BranchStatsCard";
import { BranchStatusBadge } from "@/components/modules/branch/BranchStatusBadge";
import { branchApi }       from "@/lib/api/endpoints/branches";
import { formatDate, getApiErrorMessage } from "@/lib/utils";
import { useAuth }         from "@/hooks/useAuth";
import { useState }        from "react";

export default function BranchDetailPage() {
  const { branchId }  = useParams<{ branchId: string }>();
  const router        = useRouter();
  const queryClient   = useQueryClient();
  const { hasRole }   = useAuth();
  const [showToggle, setShowToggle] = useState(false);

  const { data: branch, isLoading: branchLoading } = useQuery({
    queryKey: ["branches", branchId],
    queryFn:  async () => {
      const res = await branchApi.detail(branchId);
      return res.data.data;
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["branches", branchId, "stats"],
    queryFn:  async () => {
      const res = await branchApi.stats(branchId);
      return res.data.data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: () => branchApi.toggleActive(branchId),
    onSuccess: () => {
      toast.success("Status cabang diperbarui");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      queryClient.invalidateQueries({ queryKey: ["branches", branchId] });
      setShowToggle(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Gagal mengubah status")),
  });

  if (branchLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!branch) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={branch.name}
        description={`${branch.city} · ${branch.tipe === "KLINIK" ? "Klinik" : "Homecare"} · ${branch.branchCode}`}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/superadmin/branches/${branchId}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {hasRole("SUPER_ADMIN") && (
            <Button
              variant={branch.isActive ? "destructive" : "default"}
              size="sm"
              onClick={() => setShowToggle(true)}
            >
              <Power className="mr-2 h-4 w-4" />
              {branch.isActive ? "Nonaktifkan" : "Aktifkan"}
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Informasi Cabang</CardTitle>
            <BranchStatusBadge isActive={branch.isActive} />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Kode Cabang</p>
            <p className="font-mono font-medium mt-0.5">{branch.branchCode}</p>
          </div>
          <div>
            <p className="text-slate-500">Tipe</p>
            <Badge variant="secondary" className="mt-0.5">
              {branch.tipe === "KLINIK" ? "Klinik" : "Homecare"}
            </Badge>
          </div>
          <div>
            <p className="text-slate-500">Telepon</p>
            <p className="font-medium mt-0.5">{branch.phone ?? "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Jam Operasional</p>
            <p className="font-medium mt-0.5">{branch.operatingHours ?? "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Dibuat</p>
            <p className="font-medium mt-0.5">{formatDate(branch.createdAt)}</p>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <p className="text-slate-500">Alamat</p>
            <p className="font-medium mt-0.5">{branch.address}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Statistik Operasional
        </h2>
        {statsLoading || !stats
          ? <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          : <BranchStatsCard data={stats} />
        }
      </div>

      <ConfirmDialog
        open={showToggle}
        onOpenChange={setShowToggle}
        title={branch.isActive ? "Nonaktifkan Cabang" : "Aktifkan Cabang"}
        description={`Yakin ingin ${branch.isActive ? "menonaktifkan" : "mengaktifkan"} cabang "${branch.name}"?`}
        confirmLabel={branch.isActive ? "Nonaktifkan" : "Aktifkan"}
        variant={branch.isActive ? "destructive" : "default"}
        onConfirm={() => toggleMutation.mutate()}
        isLoading={toggleMutation.isPending}
      />
    </div>
  );
}
