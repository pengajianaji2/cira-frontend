import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { activityApi } from "../api/activity.api";
import { ActivityCategory, CreateActivityLogInput } from "../types/activity.types";

export const activityKeys = {
  all: ["activities"] as const,
  lists: () => [...activityKeys.all, "list"] as const,
  list: (projectId: string, category: ActivityCategory = "all") =>
    [...activityKeys.lists(), projectId, category] as const,
};

export function useActivitiesQuery(projectId: string, category: ActivityCategory = "all") {
  return useQuery({
    queryKey: activityKeys.list(projectId, category),
    queryFn: async () => {
      const res = await activityApi.getActivities(projectId, category);
      return res.data;
    },
    enabled: Boolean(projectId),
  });
}

export function useCreateActivityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateActivityLogInput) => activityApi.logActivity(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.lists(),
      });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Gagal mencatat log aktivitas");
    },
  });
}
