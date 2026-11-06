import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import { User } from "@/shared/types/auth.types";
import {
  ChangePasswordInput,
  LoginInput,
  ProfileInput,
} from "../types/auth.types";

/**
 * Service API Autentikasi Pengguna
 * Terhubung langsung ke Backend API Cira PM (/api/v1/auth)
 */
export const authApi = {
  /**
   * Melakukan autentikasi kredensial pengguna (email & password).
   */
  async login(payload: LoginInput): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.post<ApiResponse<{ user: User }>>(
      "/auth/login",
      payload
    );
    return response.data;
  },

  /**
   * Mengakhiri sesi pengguna aktif dan menghapus cookie autentikasi di backend.
   */
  async logout(): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>("/auth/logout");
    return response.data;
  },

  /**
   * Mengambil data profil pengguna yang saat ini sedang login dari cookie sesi.
   */
  async getMe(): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>("/auth/me");
    return response.data;
  },

  /**
   * Memperbarui informasi profil pengguna (nama & email).
   */
  async updateProfile(payload: ProfileInput): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.put<ApiResponse<{ user: User }>>(
      "/auth/profile",
      payload
    );
    return response.data;
  },

  /**
   * Mengubah kata sandi pengguna dengan memverifikasi kata sandi lama.
   */
  async changePassword(payload: ChangePasswordInput): Promise<ApiResponse<null>> {
    const response = await apiClient.put<ApiResponse<null>>(
      "/auth/password",
      payload
    );
    return response.data;
  },
};
