import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import {
  Task,
  TaskStatus,
  CreateTaskInput,
  UpdateTaskInput,
} from "../types/tasks.types";

/**
 * Service API Manajemen Tugas (Task Kanban Board)
 * Terhubung langsung ke Backend API Cira PM (/api/v1/projects/:id/tasks & /api/v1/tasks/:id)
 */
export const tasksApi = {
  /**
   * Mengambil daftar tugas berdasarkan ID proyek dari backend.
   */
  async getTasks(projectId: string): Promise<ApiResponse<Task[]>> {
    const response = await apiClient.get<ApiResponse<Task[]>>(
      `/projects/${projectId}/tasks`
    );
    return response.data;
  },

  /**
   * Membuat tugas baru di kolom kanban proyek.
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
   * Mengubah status kolom tugas (drag-and-drop) dan urutannya di board kanban.
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
   * Menghapus tugas dari papan kanban.
   */
  async deleteTask(taskId: string): Promise<ApiResponse<{ id: string }>> {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(
      `/tasks/${taskId}`
    );
    return response.data;
  },

  /**
   * Mengambil status verifikasi pembayaran DP proyek langsung dari backend ringkasan keuangan.
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
