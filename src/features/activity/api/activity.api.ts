import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import {
  ActivityLog,
  ActivityCategory,
} from "../types/activity.types";

/**
 * Service API Riwayat Aktivitas & Audit Log
 * Terhubung langsung ke Backend API Cira PM (/api/v1/projects/:id/activities)
 */
export const activityApi = {
  /**
   * Mengambil riwayat aktivitas berdasarkan ID proyek dengan filter kategori opsional dari backend.
   */
  async getActivities(
    projectId: string,
    category: ActivityCategory = "all"
  ): Promise<ApiResponse<ActivityLog[]>> {
    const response = await apiClient.get<ApiResponse<ActivityLog[]>>(
      `/projects/${projectId}/activities`,
      {
        params: {
          category: category !== "all" ? category : undefined,
        },
      }
    );
    return response.data;
  },
};
