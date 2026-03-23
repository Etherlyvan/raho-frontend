"use client";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/lib/api/endpoints/auth";
import { useAuthStore } from "@/store/auth.store";
import { getApiErrorMessage } from "@/lib/utils";
import type { AppUser, LoginPayload, RoleName } from "@/types";

const ROLE_REDIRECT: Record<RoleName, string> = {
  SUPER_ADMIN:  "/superadmin/branches",
  MASTER_ADMIN: "/masteradmin/dashboard",
  ADMIN:        "/admin/dashboard",
  DOCTOR:       "/doctor/dashboard",
  NURSE:        "/nurse/dashboard",
  PATIENT:      "/patient/dashboard",
};

export function useAuth() {
  const { user, token, setUser, logout: clearStore } = useAuthStore();

  // ─── Login ─────────────────────────────────────────────────

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ data }) => {
      const { user: loginUser, accessToken } = data.data;

      // ✅ Normalize LoginUser → AppUser
      const appUser: AppUser = {
        userId:    loginUser.userId,
        email:     loginUser.email,
        role:      loginUser.role,
        branchId:  loginUser.branchId,
        fullName:  loginUser.fullName,
        avatarUrl: loginUser.avatar,  // BE: "avatar" → store: "avatarUrl"
        isActive:  true,
      };

      setUser(appUser, accessToken);
      toast.success(`Selamat datang, ${appUser.fullName ?? appUser.email}!`);
      window.location.href = ROLE_REDIRECT[appUser.role];
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Email atau password salah."));
    },
  });

  // ─── Logout ────────────────────────────────────────────────

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearStore();
      window.location.href = "/login";
    },
  });

  // ─── Helpers ───────────────────────────────────────────────

  const hasRole = useCallback(
    (...roles: RoleName[]): boolean =>
      !!user && roles.includes(user.role),
    [user],
  );

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    hasRole,
    login:        loginMutation.mutate,
    logout:       () => logoutMutation.mutate(),
    isLoggingIn:  loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
