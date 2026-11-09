import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sprintsApi } from "../api/sprints.api";
import {
  CloseSprintInput,
  CreateSprintInput,
  StartSprintInput,
  UpdateSprintInput,
} from "../types/sprints.types";

export const sprintsKeys = {
  all: ["sprints"] as const,
  lists: () => [...sprintsKeys.all, "list"] as const,
  list: (projectId: string) => [...sprintsKeys.lists(), projectId] as const,
  detail: (sprintId: string) => [...sprintsKeys.all, "detail", sprintId] as const,
  progress: (projectId: string) => ["projects", projectId, "cumulativeProgress"] as const,
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const res = (err as { response?: { data?: { message?: string } } }).response;
    if (res?.data?.message) return res.data.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

function invalidateSprintRelatedQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
  options?: { includeTasksAndFinance?: boolean }
) {
  queryClient.invalidateQueries({ queryKey: sprintsKeys.list(projectId) });
  queryClient.invalidateQueries({ queryKey: sprintsKeys.progress(projectId) });
  queryClient.invalidateQueries({ queryKey: [...sprintsKeys.all, "detail"] });
  queryClient.invalidateQueries({ queryKey: ["projects", "detail", projectId] });
  queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
  queryClient.invalidateQueries({ queryKey: ["operations", "calendar"] });
  queryClient.invalidateQueries({ queryKey: ["activities", "list", projectId] });

  if (options?.includeTasksAndFinance) {
    queryClient.invalidateQueries({ queryKey: ["tasks", "list", projectId] });
    queryClient.invalidateQueries({ queryKey: ["payment-terms", "list", projectId] });
  }
}

export function useProjectSprintsQuery(projectId: string) {
  return useQuery({
    queryKey: sprintsKeys.list(projectId),
    queryFn: async () => {
      const res = await sprintsApi.getProjectSprints(projectId);
      return res.data || [];
    },
    enabled: !!projectId,
  });
}

export function useProjectProgressQuery(projectId: string) {
  return useQuery({
    queryKey: sprintsKeys.progress(projectId),
    queryFn: async () => {
      const res = await sprintsApi.getProjectProgress(projectId);
      return res.data;
    },
    enabled: !!projectId,
  });
}

export function useSprintByIdQuery(sprintId: string) {
  return useQuery({
    queryKey: sprintsKeys.detail(sprintId),
    queryFn: async () => {
      const res = await sprintsApi.getSprintById(sprintId);
      return res.data;
    },
    enabled: !!sprintId,
  });
}

export function useCreateSprintMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSprintInput) => sprintsApi.createSprint(projectId, input),
    onSuccess: (res) => {
      toast.success(res.message || "Sprint berhasil dibuat");
      invalidateSprintRelatedQueries(queryClient, projectId);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal membuat sprint"));
    },
  });
}

export function useUpdateSprintMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sprintId, input }: { sprintId: string; input: UpdateSprintInput }) =>
      sprintsApi.updateSprint(sprintId, input),
    onSuccess: (res) => {
      toast.success(res.message || "Sprint berhasil diperbarui");
      invalidateSprintRelatedQueries(queryClient, projectId);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal memperbarui sprint"));
    },
  });
}

export function useStartSprintMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sprintId, input }: { sprintId: string; input: StartSprintInput }) =>
      sprintsApi.startSprint(sprintId, input),
    onSuccess: (res) => {
      toast.success(res.message || "Sprint berhasil diaktifkan");
      invalidateSprintRelatedQueries(queryClient, projectId, {
        includeTasksAndFinance: true,
      });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal mengaktifkan sprint"));
    },
  });
}

export function useCompleteSprintMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sprintId, input }: { sprintId: string; input?: CloseSprintInput }) =>
      sprintsApi.completeSprint(sprintId, input),
    onSuccess: (res) => {
      toast.success(res.message || "Sprint berhasil diselesaikan");
      invalidateSprintRelatedQueries(queryClient, projectId, {
        includeTasksAndFinance: true,
      });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal menyelesaikan sprint"));
    },
  });
}

export function useReopenSprintMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sprintId: string) => sprintsApi.reopenSprint(sprintId),
    onSuccess: (res) => {
      toast.success(res.message || "Sprint berhasil dibuka kembali");
      invalidateSprintRelatedQueries(queryClient, projectId, {
        includeTasksAndFinance: true,
      });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal membuka kembali sprint"));
    },
  });
}

export function useDeleteSprintMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sprintId: string) => sprintsApi.deleteSprint(sprintId),
    onSuccess: (res) => {
      toast.success(res.message || "Sprint berhasil dihapus");
      invalidateSprintRelatedQueries(queryClient, projectId, {
        includeTasksAndFinance: true,
      });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal menghapus sprint"));
    },
  });
}

export function useAssignTasksToSprintMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sprintId, taskIds }: { sprintId: string; taskIds: string[] }) =>
      sprintsApi.assignTasks(sprintId, taskIds),
    onSuccess: (res) => {
      toast.success(res.message || "Task berhasil dimasukkan ke dalam sprint");
      invalidateSprintRelatedQueries(queryClient, projectId, {
        includeTasksAndFinance: true,
      });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal memasukkan task ke sprint"));
    },
  });
}
