import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import {
  CloseSprintInput,
  CreateSprintInput,
  ProjectCumulativeProgress,
  Sprint,
  StartSprintInput,
  UpdateSprintInput,
} from "../types/sprints.types";

/**
 * Service API Manajemen Sprint & Progres Proyek
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
   * Mengambil ringkasan progres kumulatif proyek berbasis rumus sprint (BR-PROJECT-01).
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
   * Membuat sprint baru dalam proyek (BR-SPRINT-01: tanggal boleh kosong).
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
   * Memperbarui informasi sprint.
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
   * Mengaktifkan sprint (BR-SPRINT-02: wajib memiliki tanggal mulai dan selesai valid).
   */
  async startSprint(
    sprintId: string,
    input: StartSprintInput
  ): Promise<ApiResponse<Sprint>> {
    const response = await apiClient.post<ApiResponse<Sprint>>(
      `/sprints/${sprintId}/start`,
      input
    );
    return response.data;
  },

  /**
   * Menyelesaikan sprint secara atomik dengan resolusi task TODO (BR-SPRINT-04 & BR-SPRINT-05).
   */
  async completeSprint(
    sprintId: string,
    input?: CloseSprintInput
  ): Promise<ApiResponse<{ sprint: Sprint; progress: number; completedSprintCount: number; totalSprintCount: number }>> {
    const response = await apiClient.post<
      ApiResponse<{ sprint: Sprint; progress: number; completedSprintCount: number; totalSprintCount: number }>
    >(`/sprints/${sprintId}/complete`, input || { taskMoves: [] });
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
