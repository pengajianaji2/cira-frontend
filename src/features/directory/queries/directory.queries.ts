"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { directoryApi } from "../api/directory.api";
import {
  InviteUserInput,
  UpdateRoleInput,
  UpdateStatusInput,
} from "../types/directory.types";

export const DIRECTORY_QUERY_KEY = ["directory", "users"];

export function useDirectoryQuery() {
  return useQuery({
    queryKey: DIRECTORY_QUERY_KEY,
    queryFn: async () => {
      const response = await directoryApi.getDirectory();
      return response.data.users;
    },
  });
}

export function useInviteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InviteUserInput) => directoryApi.inviteUser(payload),
    onSuccess: (response) => {
      toast.success(
        response.message || "Tautan undangan berhasil diterbitkan (24 jam)!"
      );
      queryClient.invalidateQueries({ queryKey: DIRECTORY_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengirim undangan.");
    },
  });
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRoleInput) => directoryApi.updateUserRole(payload),
    onSuccess: (response) => {
      toast.success(response.message || "Role anggota berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: DIRECTORY_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memperbarui role anggota.");
    },
  });
}

export function useUpdateStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStatusInput) =>
      directoryApi.updateUserStatus(payload),
    onSuccess: (response) => {
      toast.success(response.message || "Status anggota berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: DIRECTORY_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengubah status akun.");
    },
  });
}
