"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { RoleName } from "@/types";

const ROLE_HOME: Record<RoleName, string> = {
  SUPER_ADMIN:  "/superadmin/branches",
  MASTER_ADMIN: "/masteradmin/dashboard",
  ADMIN:        "/admin/dashboard",
  DOCTOR:       "/doctor/dashboard",
  NURSE:        "/nurse/dashboard",
  PATIENT:      "/patient/dashboard",
};

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) router.replace(ROLE_HOME[user.role]);
  }, [user, router]);

  return (
    <div className="flex items-center justify-center h-full">
      <LoadingSpinner size="lg" />
    </div>
  );
}
