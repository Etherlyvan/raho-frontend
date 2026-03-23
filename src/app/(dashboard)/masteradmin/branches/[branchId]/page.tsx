// Reuse exact same component dari superadmin, ganti router path saja
"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button }     from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge }      from "@/components/ui/badge";
import { Skeleton }   from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { BranchStatsCard }   from "@/components/modules/branch/BranchStatsCard";
import { BranchStatusBadge } from "@/components/modules/branch/BranchStatusBadge";
import { branchApi }  from "@/lib/api/endpoints/branches";
import { formatDate } from "@/lib/utils";

export default function MasterAdminBranchDetailPage() {
  const { branchId } = useParams<{ branchId: string }>();
  const router       = useRouter();

  const { data: branch, isLoading: bl } = useQuery({
    queryKey: ["branches", branchId],
    queryFn:  async () => (await branchApi.detail(branchId)).data.data,
  });

  const { data: stats, isLoading: sl } = useQuery({
    queryKey: ["branches", branchId, "stats"],
    queryFn:  async () => (await branchApi.stats(branchId)).data.data,
  });

  if (bl) return <Skeleton className="h-64" />;
  if (!branch) return null;

  return (
    <div className="space-y-6">
      <PageHeader title={branch.name} description={`${branch.city} · ${branch.branchCode}`}>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />Kembali
          </Button>
          <Button variant="outline" size="sm"
            onClick={() => router.push(`/masteradmin/branches/${branchId}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />Edit
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Informasi Cabang</CardTitle>
            <BranchStatusBadge isActive={branch.isActive} />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div><p className="text-slate-500">Kode</p><p className="font-mono font-medium mt-0.5">{branch.branchCode}</p></div>
          <div><p className="text-slate-500">Tipe</p><Badge variant="secondary" className="mt-0.5">{branch.tipe}</Badge></div>
          <div><p className="text-slate-500">Telepon</p><p className="font-medium mt-0.5">{branch.phone ?? "-"}</p></div>
          <div><p className="text-slate-500">Jam Operasional</p><p className="font-medium mt-0.5">{branch.operatingHours ?? "-"}</p></div>
          <div><p className="text-slate-500">Dibuat</p><p className="font-medium mt-0.5">{formatDate(branch.createdAt)}</p></div>
          <div className="col-span-2 sm:col-span-3"><p className="text-slate-500">Alamat</p><p className="font-medium mt-0.5">{branch.address}</p></div>
        </CardContent>
      </Card>

      {sl || !stats
        ? <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{Array.from({length:7}).map((_,i)=><Skeleton key={i} className="h-24"/>)}</div>
        : <BranchStatsCard data={stats} />
      }
    </div>
  );
}
