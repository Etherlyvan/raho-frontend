"use client";

import { useParams } from "next/navigation";
import { useQuery }  from "@tanstack/react-query";
import { Skeleton }  from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { BranchForm } from "@/components/modules/branch/BranchForm";
import { branchApi }  from "@/lib/api/endpoints/branches";

export default function MasterAdminEditBranchPage() {
  const { branchId } = useParams<{ branchId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["branches", branchId],
    queryFn:  async () => (await branchApi.detail(branchId)).data.data,
  });

  if (isLoading) return <Skeleton className="h-64 max-w-2xl" />;
  if (!data)     return null;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={`Edit — ${data.name}`} description="Perbarui informasi cabang" />
      {/* basePath masteradmin, redirect setelah edit ke /masteradmin/branches/:id */}
      <BranchForm mode="edit" initialData={data} branchId={branchId} basePath="masteradmin" />
    </div>
  );
}
