"use client";

import { useQuery }         from "@tanstack/react-query";
import { Skeleton }         from "@/components/ui/skeleton";
import { PageHeader }       from "@/components/shared/PageHeader";
import { AdminDashboardCards } from "@/components/modules/dashboard/AdminDashboardCards";
import { dashboardApi }     from "@/lib/api/endpoints/dashboard";

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn:  async () => {
      const res = await dashboardApi.admin();
      return res.data.data;
    },
    refetchInterval: 5 * 60 * 1000, // refresh tiap 5 menit
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Admin"
        description="Ringkasan operasional cabang hari ini"
      />

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-40" />
        </div>
      ) : isError || !data ? (
        <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
          Gagal memuat dashboard. Coba muat ulang.
        </div>
      ) : (
        <AdminDashboardCards data={data} />
      )}
    </div>
  );
}
