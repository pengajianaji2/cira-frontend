import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import {
  Project,
  ProjectStatus,
  CreateProjectInput,
  UpdateProjectInput,
  DEFAULT_PRD_TEMPLATE,
} from "../types/projects.types";

/**
 * Service API Manajemen Proyek & Dokumen PRD
 * Terhubung langsung ke Backend API Cira PM (/api/v1/projects)
 */
export const projectsApi = {
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
    const payload = {
      ...input,
      prdContent: DEFAULT_PRD_TEMPLATE(input.name, input.clientName),
    };
    const response = await apiClient.post<ApiResponse<Project>>("/projects", payload);
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
   * Menyimpan pembaruan dokumen PRD markdown proyek.
   */
  async updateProjectPrd(
    id: string,
    prdContent: string
  ): Promise<ApiResponse<Project>> {
    return this.updateProject(id, { prdContent });
  },

};
