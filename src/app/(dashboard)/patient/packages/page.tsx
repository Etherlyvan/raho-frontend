'use client';

import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import {
  ActivePackageList,
  ActivePackageListSkeleton,
} from '@/components/modules/patient/ActivePackageList';
import { memberPackageApi } from '@/lib/api/endpoints/memberPackages';
import { usePatientMemberId } from '@/hooks/usePatientMemberId';
import type { PatientActivePackage } from '@/types';

export default function PatientPackagesPage() {
  const memberId = usePatientMemberId();

  const { data: packages, isLoading, isError } = useQuery({
    queryKey: ['patient', 'packages', 'active', memberId],
    queryFn: async () => {
      const res = await memberPackageApi.listActive(memberId!);

      // Normalize MemberPackage (field "type", "endDate") →
      // PatientActivePackage (field "packageType", "expiredAt", "remainingSessions")
        return res.data.data.map<PatientActivePackage>((pkg) => ({
            memberPackageId: pkg.memberPackageId,
            packageType: pkg.type,
            packageName: pkg.packageName ?? null,
            totalSessions: pkg.totalSessions,
            usedSessions: pkg.usedSessions,
            expiredAt: pkg.endDate ?? null,
            remainingSessions: pkg.totalSessions - pkg.usedSessions,
            branch: {
                name: pkg.branch.name,
                // MemberPackage.branch tidak expose city — isi undefined (type sudah optional)
                city: undefined,
            },
        }));
    },
    enabled: !!memberId,
    staleTime: 2 * 60 * 1000,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paket Saya"
        description="Daftar seluruh paket treatment aktif yang Anda miliki."
      />

      {isError && (
        <ErrorMessage message="Gagal memuat data paket. Silakan muat ulang halaman." />
      )}

      {/* Loading state: gunakan skeleton granular, bukan spinner full-page */}
      {(isLoading || !memberId) && <ActivePackageListSkeleton />}

      {packages && !isLoading && (
        <ActivePackageList packages={packages} />
      )}
    </div>
  );
}
