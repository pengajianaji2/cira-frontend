import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import { User } from "@/shared/types/auth.types";
import {
  ActivateInput,
  ChangePasswordInput,
  InviteInfoResponse,
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
      { oldPassword: payload.currentPassword, newPassword: payload.newPassword }
    );
    return response.data;
  },

  /**
   * Memeriksa validitas token aktivasi undangan dan mengambil info calon anggota.
   */
  async getInviteInfo(token: string): Promise<ApiResponse<InviteInfoResponse>> {
    const response = await apiClient.post<ApiResponse<InviteInfoResponse>>(
      "/auth/invite/verify", { token }
    );
    return response.data;
  },

  /**
   * Menyelesaikan aktivasi akun tim dengan nama, WhatsApp, Instagram, dan password baru.
   */
  async activate(payload: ActivateInput): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.post<ApiResponse<{ user: User }>>(
      "/auth/activate",
      payload
    );
    return response.data;
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>("/auth/forgot-password", { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>("/auth/reset-password", { token, newPassword });
    return response.data;
  },

  async uploadAvatar(dataUrl: string): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.post<ApiResponse<{ user: User }>>("/auth/avatar", { dataUrl });
    return response.data;
  },

  async getMyPermissions(): Promise<ApiResponse<{ permissions: string[] }>> {
    const response = await apiClient.get<ApiResponse<{ permissions: string[] }>>("/policies/me");
    return response.data;
  },
};
