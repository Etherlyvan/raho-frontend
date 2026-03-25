'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/endpoints/dashboard';

/**
 * Mengambil memberId pasien yang sedang login dari cache dashboard.
 *
 * Dashboard patient selalu di-fetch saat masuk halaman patient (page.tsx),
 * sehingga query ini akan dilayani dari cache (staleTime 5 menit)
 * tanpa network request tambahan di halaman packages / invoices.
 */
export function usePatientMemberId(): string | null {
  const { data } = useQuery({
    queryKey: ['dashboard', 'patient'],
    queryFn: async () => (await dashboardApi.patient()).data.data,
    staleTime: 5 * 60 * 1000,
  });

  return data?.member.memberId ?? null;
}
