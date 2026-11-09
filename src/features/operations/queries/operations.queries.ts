"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { operationsApi } from "../api/operations.api";
import {
  CalendarQueryFilters,
  CancelOperationalEventInput,
  CreateOperationalEventInput,
  RecordReminderInput,
  UpdateOperationalEventInput,
} from "../types/operations.types";

export const OPERATION_KEYS = {
  all: ["operations"] as const,
  calendars: () => [...OPERATION_KEYS.all, "calendar"] as const,
  calendar: (filters: CalendarQueryFilters) =>
    [...OPERATION_KEYS.calendars(), filters] as const,
};

export function useOperationalCalendarQuery(
  filters: CalendarQueryFilters,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: OPERATION_KEYS.calendar(filters),
    queryFn: async () => {
      const response = await operationsApi.getOperationalCalendar(filters);
      return response.data;
    },
    enabled: options?.enabled ?? true,
    retry: (failureCount, error: Error & { status?: number }) => {
      if (error?.status === 403 || error?.status === 401 || error?.status === 400) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useCreateOperationalEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOperationalEventInput) => {
      const response = await operationsApi.createOperationalEvent(input);
      return response.data;
    },
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: OPERATION_KEYS.all });
      toast.success("Agenda Operasional Ditambahkan", {
        description: `"${created.title}" kini tampil di kalender operasional.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Gagal Menambahkan Agenda", {
        description: error.message || "Periksa kembali isian agenda Anda.",
      });
    },
  });
}

export function useUpdateOperationalEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateOperationalEventInput;
    }) => {
      const response = await operationsApi.updateOperationalEvent(id, input);
      return response.data;
    },
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: OPERATION_KEYS.all });
      toast.success("Agenda Operasional Diperbarui", {
        description: `Perubahan pada "${updated.title}" telah disimpan.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Gagal Memperbarui Agenda", {
        description: error.message || "Terjadi kesalahan saat memperbarui agenda.",
      });
    },
  });
}

export function useCancelOperationalEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input?: CancelOperationalEventInput;
    }) => {
      const response = await operationsApi.cancelOperationalEvent(id, input);
      return response.data;
    },
    onSuccess: (cancelled) => {
      void queryClient.invalidateQueries({ queryKey: OPERATION_KEYS.all });
      toast.success("Agenda Dibatalkan", {
        description: `"${cancelled.title}" ditandai sebagai dibatalkan dan tetap tersimpan di log audit.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Gagal Membatalkan Agenda", {
        description: error.message || "Agenda tidak dapat dibatalkan.",
      });
    },
  });
}

export function useRecordReminderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input?: RecordReminderInput;
    }) => {
      const response = await operationsApi.recordReminder(id, input);
      return response.data;
    },
    onSuccess: (recorded) => {
      void queryClient.invalidateQueries({ queryKey: OPERATION_KEYS.all });
      toast.success("Tindak Lanjut Manual Dicatat", {
        description: `Log ke-${recorded.reminderCount} untuk "${recorded.title}" tersimpan (tidak mengirim email/WhatsApp otomatis).`,
      });
    },
    onError: (error: Error) => {
      toast.error("Gagal Mencatat Tindak Lanjut", {
        description: error.message || "Silakan coba beberapa saat lagi.",
      });
    },
  });
}
