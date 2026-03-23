import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { tokenStorage } from "@/lib/api/axios";
import { clearAllClientStorage } from "@/lib/utils";
import type { AppUser } from "@/types";

interface AuthState {
  user:        AppUser | null;
  token:       string | null;
  isHydrated:  boolean;

  setUser:     (user: AppUser, token: string) => void;
  logout:      () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:        null,
      token:       null,
      isHydrated:  false,

      setUser: (user, token) => {
        tokenStorage.set(token);
        set({ user, token });
      },

      logout: () => {
        tokenStorage.remove();
        clearAllClientStorage();
        set({ user: null, token: null });
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name:    "raho-auth",
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
