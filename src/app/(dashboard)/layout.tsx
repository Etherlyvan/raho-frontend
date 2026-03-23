"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api/endpoints/auth";
import { useAuthStore } from "@/store/auth.store";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { tokenStorage } from "@/lib/api/axios";
import type { AppUser } from "@/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, token, isHydrated, setUser, logout } = useAuthStore();

  const { isLoading, isError, data } = useQuery({
    queryKey: ["auth", "me"],
    queryFn:  async () => {
      const res = await authApi.me();
      return res.data.data;
    },
    enabled:   isHydrated && !!token,
    retry:     false,
    staleTime: 5 * 60 * 1000,
  });

  // ✅ Normalize MeResponse → AppUser
  useEffect(() => {
    if (data) {
      const t = tokenStorage.get();
      if (t) {
        const appUser: AppUser = {
          userId:    data.userId,
          email:     data.email,
          role:      data.role.name,
          branchId:  data.branch?.branchId ?? null,
          fullName:  data.profile?.fullName ?? null,
          avatarUrl: data.profile?.avatarUrl ?? null,
          isActive:  data.isActive,
          profile:   data.profile,
        };
        setUser(appUser, t);
      }
    }
  }, [data, setUser]);

  useEffect(() => {
    if (isError) {
      logout();
      window.location.href = "/login";
    }
  }, [isError, logout]);

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/login");
    }
  }, [isHydrated, token, router]);

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size="lg" label="Memuat..." />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
