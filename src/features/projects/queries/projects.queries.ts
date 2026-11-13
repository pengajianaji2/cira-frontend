import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectsApi } from "../api/projects.api";
import {
  ProjectStatus,
  CreateProjectInput,
  UpdateProjectInput,
} from "../types/projects.types";

export const PROJECT_KEYS = {
  all: ["projects"] as const,
  lists: () => [...PROJECT_KEYS.all, "list"] as const,
  list: (status?: ProjectStatus | "all") =>
    [...PROJECT_KEYS.lists(), { status }] as const,
  details: () => [...PROJECT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PROJECT_KEYS.details(), id] as const,
};

export function useProjectsQuery(status?: ProjectStatus | "all") {
  return useQuery({
    queryKey: PROJECT_KEYS.list(status),
    queryFn: async () => {
      const response = await projectsApi.getProjects(status);
      return response.data;
    },
  });
}

export function useProjectListingQuery(filters: { status?: ProjectStatus; search?: string; page: number; limit: number }) {
  return useQuery({
    queryKey: [...PROJECT_KEYS.lists(), "listing", filters],
    queryFn: async () => (await projectsApi.getProjectListing(filters)).data,
    placeholderData: (previous) => previous,
  });
}

export function useProjectQuery(id: string) {
  return useQuery({
    queryKey: PROJECT_KEYS.detail(id),
    queryFn: async () => {
      const response = await projectsApi.getProjectById(id);
      return response.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateProjectInput) => {
      const response = await projectsApi.createProject(payload);
      return response.data;
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
      toast.success("Proyek Baru Berhasil Dibuat", {
        description: `Proyek "${newProject.name}" masuk ke pipeline dengan status Lead.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Gagal membuat proyek", {
        description: error.message || "Terjadi kesalahan pada sistem.",
      });
    },
  });
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateProjectInput;
    }) => {
      const response = await projectsApi.updateProject(id, input);
      return response.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(PROJECT_KEYS.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
    },
  });
}
