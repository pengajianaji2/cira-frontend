import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/shared/types/auth.types";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: "cira-auth-storage",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, isLoading: false }),
      migrate: (persisted) => {
        if (persisted && typeof persisted === "object") {
          const migrated = { ...(persisted as Record<string, unknown>) };
          delete migrated.token;
          return migrated as unknown as AuthStore;
        }
        return persisted as unknown as AuthStore;
      },
    }
  )
);
