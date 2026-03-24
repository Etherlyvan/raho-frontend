'use client';

import { useQuery } from '@tanstack/react-query';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { NurseDashboardCards } from '@/components/modules/nurse/NurseDashboardCards';
import { ActiveSessionList } from '@/components/modules/nurse/ActiveSessionList';
import { CriticalStockWidget } from '@/components/modules/nurse/CriticalStockWidget';
import { dashboardApi } from '@/lib/api/endpoints/dashboard';
import type { NurseDashboard } from '@/types';

export default function NurseDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'nurse'],
    queryFn: async () => {
      const res = await dashboardApi.nurse();
      return res.data.data as NurseDashboard;
    },
    refetchInterval: 2 * 60 * 1000, // auto-refresh tiap 2 menit
  });

  if (isError) {
    return (
      <ErrorMessage
        title="Gagal memuat dashboard"
        message="Terjadi kesalahan saat mengambil data. Coba refresh halaman."
      />
    );
  }

  return (
    <RoleGuard roles={['NURSE']}>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard Perawat"
          description="Ringkasan jadwal sesi hari ini dan kondisi stok cabang."
        />

        {/* 4 Summary Cards */}
        <NurseDashboardCards data={data ?? null} isLoading={isLoading} />

        {/* Konten Utama: Jadwal + Stok Kritis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Jadwal Hari Ini — 2/3 lebar */}
          <div className="lg:col-span-2">
            <ActiveSessionList
              sessions={data?.todaySchedule ?? []}
              isLoading={isLoading}
            />
          </div>

          {/* Widget Stok Kritis — 1/3 lebar */}
          <div>
            <CriticalStockWidget />
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
