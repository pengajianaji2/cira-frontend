import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import {
  Project,
  ProjectListingResponse,
  ProjectStatus,
  CreateProjectInput,
  UpdateProjectInput,
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

};
