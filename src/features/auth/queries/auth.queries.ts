"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";
import {
  ActivateInput,
  ChangePasswordInput,
  LoginInput,
  ProfileInput,
} from "../types/auth.types";

export const AUTH_QUERY_KEY = ["auth", "currentUser"];
export const INVITE_INFO_QUERY_KEY = ["auth", "inviteInfo"];
export const MY_PERMISSIONS_QUERY_KEY = ["auth", "permissions"];

export function useMyPermissionsQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: MY_PERMISSIONS_QUERY_KEY,
    queryFn: async () => (await authApi.getMyPermissions()).data.permissions,
    enabled: isAuthenticated,
    staleTime: 30_000,
    retry: false,
  });
}

export function useCurrentUserQuery() {
  const { setUser, logout } = useAuthStore();

  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        const response = await authApi.getMe();
        setUser(response.data.user);
        return response.data.user;
      } catch (err) {
        if ((err as Error & { status?: number }).status === 401) logout();
        throw err;
      }
    },
    enabled: true,
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useLoginMutation() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginInput) => authApi.login(payload),
    onSuccess: (response) => {
      setAuth(response.data.user);
      queryClient.setQueryData(AUTH_QUERY_KEY, response.data.user);
      toast.success(response.message || "Selamat datang kembali!");
      router.push("/projects");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Email atau password salah.");
    },
  });
}

export function useLogoutMutation() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onMutate: async () => {
      await queryClient.cancelQueries();
      logout();
      queryClient.removeQueries();
    },
    onSuccess: () => {
      toast.info("Anda telah keluar dari aplikasi.");
      router.push("/login");
    },
    onError: () => {
      logout();
      queryClient.removeQueries();
      router.push("/login");
    },
  });
}

export function useUpdateProfileMutation() {
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfileInput) => authApi.updateProfile(payload),
    onSuccess: (response) => {
      setUser(response.data.user);
      queryClient.setQueryData(AUTH_QUERY_KEY, response.data.user);
      toast.success(response.message || "Profil berhasil diperbarui!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memperbarui profil.");
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordInput) => authApi.changePassword(payload),
    onSuccess: (response) => {
      toast.success(response.message || "Password berhasil diganti!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengganti password.");
    },
  });
}

export function useUploadAvatarMutation() {
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dataUrl: string) => authApi.uploadAvatar(dataUrl),
    onSuccess: (response) => {
      setUser(response.data.user);
      queryClient.setQueryData(AUTH_QUERY_KEY, response.data.user);
      toast.success(response.message || "Foto profil diperbarui.");
    },
    onError: (error: Error) => toast.error(error.message || "Gagal mengunggah foto profil."),
  });
}

export function useInviteInfoQuery(token: string) {
  return useQuery({
    queryKey: [...INVITE_INFO_QUERY_KEY, token],
    queryFn: async () => {
      const response = await authApi.getInviteInfo(token);
      return response.data;
    },
    enabled: !!token,
    retry: false,
  });
}

export function useActivateMutation() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ActivateInput) => authApi.activate(payload),
    onSuccess: (response) => {
      setAuth(response.data.user);
      queryClient.setQueryData(AUTH_QUERY_KEY, response.data.user);
      toast.success(response.message || "Aktivasi berhasil! Selamat bergabung di tim.");
      router.push("/projects");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Aktivasi gagal. Silakan periksa kembali data Anda.");
    },
  });
}
