import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import {
  Project,
  ProjectListingResponse,
  ProjectStatus,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectDeletionResult,
  PrdVersionDocument,
} from "../types/projects.types";

/**
 * Service API Manajemen Proyek & Dokumen PRD
 * Terhubung langsung ke Backend API Cira PM (/api/v1/projects)
 */
export const projectsApi = {
  async getProjectListing(filters: { status?: ProjectStatus; search?: string; page: number; limit: number }): Promise<ApiResponse<ProjectListingResponse>> {
    const response = await apiClient.get<ApiResponse<ProjectListingResponse>>("/projects/listing", { params: filters });
    return response.data;
  },
  /**
   * Mengambil daftar proyek dari backend dengan filter status opsional.
   */
  async getProjects(status?: ProjectStatus | "all"): Promise<ApiResponse<Project[]>> {
    const response = await apiClient.get<ApiResponse<Project[]>>("/projects", {
      params: { status: status === "all" ? undefined : status },
    });
    return response.data;
  },

  /**
   * Mengambil detail satu proyek berdasarkan ID proyek.
   */
  async getProjectById(id: string): Promise<ApiResponse<Project>> {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data;
  },

  /**
   * Mendaftarkan proyek baru ke sistem dengan status awal 'lead' dan template PRD bawaan.
   */
  async createProject(input: CreateProjectInput): Promise<ApiResponse<Project>> {
    const response = await apiClient.post<ApiResponse<Project>>("/projects", input);
    return response.data;
  },

  /**
   * Memperbarui informasi proyek (status, nilai kontrak, konten PRD).
   */
  async updateProject(
    id: string,
    input: UpdateProjectInput
  ): Promise<ApiResponse<Project>> {
    const response = await apiClient.patch<ApiResponse<Project>>(
      `/projects/${id}`,
      input
    );
    return response.data;
  },

  /**
   * Menghapus proyek secara permanen dengan otentikasi password Owner.
   */
  async deleteProject(id: string, password: string): Promise<ApiResponse<ProjectDeletionResult>> {
    const response = await apiClient.delete<ApiResponse<ProjectDeletionResult>>(`/projects/${id}`, {
      data: { password },
    });
    return response.data;
  },

  /**
   * Melanjutkan sisa cleanup penghapusan file proyek yang tertunda.
   */
  async retryProjectDeletion(id: string, password: string): Promise<ApiResponse<ProjectDeletionResult>> {
    const response = await apiClient.post<ApiResponse<ProjectDeletionResult>>(`/projects/${id}/deletion/retry`, {
      password,
    });
    return response.data;
  },

  /**
   * Mengambil daftar riwayat versi dokumen PRD privat.
   */
  async getPrdVersions(projectId: string): Promise<ApiResponse<PrdVersionDocument[]>> {
    const response = await apiClient.get<ApiResponse<PrdVersionDocument[]>>(`/projects/${projectId}/prd/versions`);
    return response.data;
  },

  /**
   * Mendaftarkan upload session PDF PRD baru sebagai versi PRD.
   */
  async createPrdVersion(projectId: string, uploadSessionId: string): Promise<ApiResponse<PrdVersionDocument>> {
    const response = await apiClient.post<ApiResponse<PrdVersionDocument>>(`/projects/${projectId}/prd/versions`, {
      uploadSessionId,
    });
    return response.data;
  },
};
