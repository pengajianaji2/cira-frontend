import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import {
  CreateSprintInput,
  ProjectCumulativeProgress,
  Sprint,
  UpdateSprintInput,
} from "../types/sprints.types";

/**
 * Service API Manajemen Sprint & Progres Kumulatif
 * Terhubung ke backend /api/v1/projects/:id/sprints & /api/v1/sprints/:id
 */
export const sprintsApi = {
  /**
   * Mengambil daftar sprint berdasarkan ID proyek.
   */
  async getProjectSprints(projectId: string): Promise<ApiResponse<Sprint[]>> {
    const response = await apiClient.get<ApiResponse<Sprint[]>>(
      `/projects/${projectId}/sprints`
    );
    return response.data;
  },

  /**
   * Mengambil ringkasan progres kumulatif terbobot proyek.
   */
  async getProjectProgress(
    projectId: string
  ): Promise<ApiResponse<ProjectCumulativeProgress>> {
    const response = await apiClient.get<ApiResponse<ProjectCumulativeProgress>>(
      `/projects/${projectId}/sprints/progress`
    );
    return response.data;
  },

  /**
   * Mengambil data detail satu sprint.
   */
  async getSprintById(sprintId: string): Promise<ApiResponse<Sprint>> {
    const response = await apiClient.get<ApiResponse<Sprint>>(
      `/sprints/${sprintId}`
    );
    return response.data;
  },

  /**
   * Membuat sprint baru dalam proyek.
   */
  async createSprint(
    projectId: string,
    input: CreateSprintInput
  ): Promise<ApiResponse<Sprint>> {
    const response = await apiClient.post<ApiResponse<Sprint>>(
      `/projects/${projectId}/sprints`,
      input
    );
    return response.data;
  },

  /**
   * Memperbarui informasi sprint (nama, sasaran, tanggal).
   */
  async updateSprint(
    sprintId: string,
    input: UpdateSprintInput
  ): Promise<ApiResponse<Sprint>> {
    const response = await apiClient.patch<ApiResponse<Sprint>>(
      `/sprints/${sprintId}`,
      input
    );
    return response.data;
  },

  /**
   * Memulai sprint (AC-10: seluruh task wajib punya satu assignee & points Fibonacci).
   */
  async startSprint(sprintId: string): Promise<ApiResponse<Sprint>> {
    const response = await apiClient.post<ApiResponse<Sprint>>(
      `/sprints/${sprintId}/start`
    );
    return response.data;
  },

  /**
   * Menyelesaikan sprint (AC-11: seluruh task wajib berstatus done).
   */
  async completeSprint(
    sprintId: string
  ): Promise<ApiResponse<{ sprint: Sprint; cumulativeProgress: ProjectCumulativeProgress }>> {
    const response = await apiClient.patch<
      ApiResponse<{ sprint: Sprint; cumulativeProgress: ProjectCumulativeProgress }>
    >(`/sprints/${sprintId}/complete`);
    return response.data;
  },

  /**
   * Membuka kembali sprint yang telah selesai.
   */
  async reopenSprint(
    sprintId: string
  ): Promise<ApiResponse<{ sprint: Sprint; cumulativeProgress: ProjectCumulativeProgress }>> {
    const response = await apiClient.post<
      ApiResponse<{ sprint: Sprint; cumulativeProgress: ProjectCumulativeProgress }>
    >(`/sprints/${sprintId}/reopen`);
    return response.data;
  },

  /**
   * Menghapus sprint.
   */
  async deleteSprint(sprintId: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      `/sprints/${sprintId}`
    );
    return response.data;
  },

  /**
   * Memasukkan daftar task ke dalam sprint.
   */
  async assignTasks(
    sprintId: string,
    taskIds: string[]
  ): Promise<ApiResponse<{ success: boolean; count: number }>> {
    const response = await apiClient.post<ApiResponse<{ success: boolean; count: number }>>(
      `/sprints/${sprintId}/tasks`,
      { taskIds }
    );
    return response.data;
  },
};
