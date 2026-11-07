import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/shared/types/auth.types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User | null, token?: string | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (user, token = null) =>
        set({
          user,
          token,
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
          token: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: "cira-auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
