import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import {
  CalendarFeedResponse,
  CalendarQueryFilters,
  CancelOperationalEventInput,
  CreateOperationalEventInput,
  OperationalEventRecord,
  RecordReminderInput,
  UpdateOperationalEventInput,
} from "../types/operations.types";

export const operationsApi = {
  async getOperationalCalendar(
    filters: CalendarQueryFilters
  ): Promise<ApiResponse<CalendarFeedResponse>> {
    const response = await apiClient.get<ApiResponse<CalendarFeedResponse>>(
      "/operations/calendar",
      {
        params: {
          from: filters.from,
          to: filters.to,
          types: filters.types?.length ? filters.types.join(",") : undefined,
          projectIds: filters.projectIds?.length
            ? filters.projectIds.join(",")
            : undefined,
          projectStatuses: filters.projectStatuses?.length
            ? filters.projectStatuses.join(",")
            : undefined,
          includeCancelled: filters.includeCancelled ? "true" : undefined,
        },
      }
    );
    return response.data;
  },

  async createOperationalEvent(
    input: CreateOperationalEventInput
  ): Promise<ApiResponse<OperationalEventRecord>> {
    const response = await apiClient.post<ApiResponse<OperationalEventRecord>>(
      "/operations/events",
      input
    );
    return response.data;
  },

  async updateOperationalEvent(
    id: string,
    input: UpdateOperationalEventInput
  ): Promise<ApiResponse<OperationalEventRecord>> {
    const response = await apiClient.patch<ApiResponse<OperationalEventRecord>>(
      `/operations/events/${id}`,
      input
    );
    return response.data;
  },

  async cancelOperationalEvent(
    id: string,
    input?: CancelOperationalEventInput
  ): Promise<ApiResponse<OperationalEventRecord>> {
    const response = await apiClient.patch<ApiResponse<OperationalEventRecord>>(
      `/operations/events/${id}/cancel`,
      input ?? {}
    );
    return response.data;
  },

  async recordReminder(
    id: string,
    input?: RecordReminderInput
  ): Promise<
    ApiResponse<{
      id: string;
      title: string;
      projectId: string | null;
      lastRemindedAt: string | null;
      reminderNote: string | null;
      reminderCount: number;
    }>
  > {
    const response = await apiClient.post<
      ApiResponse<{
        id: string;
        title: string;
        projectId: string | null;
        lastRemindedAt: string | null;
        reminderNote: string | null;
        reminderCount: number;
      }>
    >(`/operations/events/${id}/remind`, input ?? {});
    return response.data;
  },
};
