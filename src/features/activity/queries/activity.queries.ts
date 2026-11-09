import { useQuery } from "@tanstack/react-query";
import { activityApi } from "../api/activity.api";
import { ActivityCategory } from "../types/activity.types";

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

