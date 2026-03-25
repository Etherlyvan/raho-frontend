'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

/**
 * Layout guard untuk seluruh segmen /dashboard/patient.
 *
 * DashboardLayout (parent) menangani autentikasi dan fetch authMe.
 * Layout ini hanya memastikan role yang mengakses adalah PATIENT.
 * Role lain akan diarahkan ke halaman dashboard sesuai rolenya masing-masing.
 */

const ROLE_HOME: Record<string, string> = {
  SUPERADMIN: '/dashboard/superadmin/branches',
  MASTERADMIN: '/dashboard/masteradmin/dashboard',
  ADMIN: '/dashboard/admin/dashboard',
  DOCTOR: '/dashboard/doctor/dashboard',
  NURSE: '/dashboard/nurse/dashboard',
};

interface Props {
  children: React.ReactNode;
}

export default function PatientLayout({ children }: Props) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'PATIENT') {
      // Redirect ke dashboard yang sesuai role yang sedang login
      router.replace(ROLE_HOME[user.role] ?? '/dashboard');
    }
  }, [user, router]);

  // Tampilkan spinner sementara user belum terhidrasi
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Jangan render children saat role tidak cocok (cegah flash konten)
  if (user.role !== 'PATIENT') {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
