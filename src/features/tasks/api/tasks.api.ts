import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import {
  Task,
  TaskStatus,
  CreateTaskInput,
  UpdateTaskInput,
  ProjectTasksResult,
} from "../types/tasks.types";

/**
 * Service API Manajemen Todo dalam Sprint.
 * Terhubung langsung ke Backend API Cira PM (/api/v1/projects/:id/tasks & /api/v1/tasks/:id)
 */
export const tasksApi = {
  /**
   * Mengambil daftar tugas berdasarkan ID proyek dari backend.
   */
  async getTasks(projectId: string): Promise<ApiResponse<ProjectTasksResult | Task[]>> {
    const response = await apiClient.get<ApiResponse<ProjectTasksResult | Task[]>>(
      `/projects/${projectId}/tasks`
    );
    return response.data;
  },

  /**
   * Membuat Todo baru di Sprint yang dipilih.
   */
  async createTask(
    projectId: string,
    input: CreateTaskInput
  ): Promise<ApiResponse<Task>> {
    const response = await apiClient.post<ApiResponse<Task>>(
      `/projects/${projectId}/tasks`,
      input
    );
    return response.data;
  },

  /**
   * Mengubah status tugas ('todo' <-> 'done'). Checkbox checked iff 'done'.
   */
  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    newOrder?: number
  ): Promise<ApiResponse<Task>> {
    const response = await apiClient.patch<ApiResponse<Task>>(
      `/tasks/${taskId}/status`,
      {
        status,
        order: newOrder,
      }
    );
    return response.data;
  },

  /**
   * Memindahkan Todo ke Sprint lain.
   */
  async moveTaskToSprint(
    taskId: string,
    targetSprintId: string
  ): Promise<ApiResponse<Task>> {
    const response = await apiClient.patch<ApiResponse<Task>>(
      `/tasks/${taskId}/move-sprint`,
      { targetSprintId }
    );
    return response.data;
  },

  /**
   * Memperbarui detail tugas (judul, deskripsi, prioritas, assignee).
   */
  async updateTask(
    taskId: string,
    input: UpdateTaskInput
  ): Promise<ApiResponse<Task>> {
    const response = await apiClient.patch<ApiResponse<Task>>(
      `/tasks/${taskId}`,
      input
    );
    return response.data;
  },

  /**
   * Menghapus tugas dari sistem.
   */
  async deleteTask(taskId: string): Promise<ApiResponse<{ id: string }>> {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(
      `/tasks/${taskId}`
    );
    return response.data;
  },

  /**
   * Mengambil status verifikasi pembayaran DP proyek.
   */
  async getProjectPaymentStatus(projectId: string): Promise<{
    hasVerifiedPayment: boolean;
    paymentsCount: number;
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        hasVerifiedDp: boolean;
        paymentsCount: number;
      }>
    >(`/projects/${projectId}/finance-summary`);

    return {
      hasVerifiedPayment: Boolean(response.data.data?.hasVerifiedDp),
      paymentsCount: response.data.data?.paymentsCount ?? 0,
    };
  },
};
