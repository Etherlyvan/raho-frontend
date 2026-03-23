"use client";

import { useAuthStore } from "@/store/auth.store";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import type { RoleName } from "@/types";

interface RoleGuardProps {
  roles:    RoleName[];
  children: React.ReactNode;
}

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const { user } = useAuthStore();

  // ✅ user.role sekarang RoleName — assignable ke parameter RoleName
  if (!user || !roles.includes(user.role)) {
    return (
      <ErrorMessage
        title="Akses Ditolak"
        message="Anda tidak memiliki izin untuk mengakses halaman ini."
      />
    );
  }

  return <>{children}</>;
}
