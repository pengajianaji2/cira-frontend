import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import {
  DirectoryUser,
  InviteUserInput,
  InviteUserResponse,
  UpdateRoleInput,
  UpdateStatusInput,
} from "../types/directory.types";

export const directoryApi = {
  async getDirectory(): Promise<ApiResponse<{ users: DirectoryUser[] }>> {
    const response = await apiClient.get<ApiResponse<{ users: DirectoryUser[] }>>(
      "/users/directory"
    );
    return response.data;
  },

  async inviteUser(
    payload: InviteUserInput
  ): Promise<ApiResponse<{ invitation: InviteUserResponse }>> {
    const response = await apiClient.post<
      ApiResponse<{ invitation: InviteUserResponse }>
    >("/auth/invite", payload);
    return response.data;
  },

  async updateUserRole(
    payload: UpdateRoleInput
  ): Promise<ApiResponse<{ user: DirectoryUser }>> {
    const response = await apiClient.patch<ApiResponse<{ user: DirectoryUser }>>(
      `/auth/users/${payload.userId}/role`,
      { roles: payload.roles }
    );
    return response.data;
  },

  async updateUserStatus(
    payload: UpdateStatusInput
  ): Promise<ApiResponse<{ user: DirectoryUser }>> {
    const response = await apiClient.patch<ApiResponse<{ user: DirectoryUser }>>(
      `/auth/users/${payload.userId}/status`,
      { isActive: payload.isActive }
    );
    return response.data;
  },
};
