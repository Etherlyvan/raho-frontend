"use client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { AdminDashboardCards } from "@/components/modules/dashboard/AdminDashboardCards";
import { dashboardApi } from "@/lib/api/endpoints/dashboard";

export default function MasterAdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "admin"],   // shared queryKey agar cache sama
    queryFn: async () => (await dashboardApi.admin()).data.data,
    refetchInterval: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Ringkasan operasional seluruh cabang" />
      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
          </div>
          <Skeleton className="h-44 rounded-lg" />
        </div>
      )}
      {isError && <ErrorMessage message="Gagal memuat data dashboard. Silakan muat ulang halaman." />}
      {data && !isLoading && <AdminDashboardCards data={data} />}
    </div>
  );
}