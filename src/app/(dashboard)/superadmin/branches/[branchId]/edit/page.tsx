"use client";

import { useParams } from "next/navigation";
import { useQuery }  from "@tanstack/react-query";
import { Skeleton }  from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { BranchForm } from "@/components/modules/branch/BranchForm";
import { RoleGuard }  from "@/components/layout/RoleGuard";
import { branchApi }  from "@/lib/api/endpoints/branches";

export default function EditBranchPage() {
  const { branchId } = useParams<{ branchId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["branches", branchId],
    queryFn:  async () => {
      const res = await branchApi.detail(branchId);
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <RoleGuard roles={["SUPER_ADMIN", "MASTER_ADMIN"]}>
      <div className="max-w-2xl space-y-6">
        <PageHeader
          title={`Edit — ${data.name}`}
          description="Perbarui informasi cabang"
        />
        <BranchForm mode="edit" initialData={data} branchId={branchId} />
      </div>
    </RoleGuard>
  );
}
