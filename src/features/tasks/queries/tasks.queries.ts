import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tasksApi } from "../api/tasks.api";
import { CreateTaskInput, Task, TaskStatus } from "../types/tasks.types";

/** Query key factory TanStack Query untuk daftar task dan status DP proyek. */
export const tasksKeys = {
  all: ["tasks"] as const,
  lists: () => [...tasksKeys.all, "list"] as const,
  list: (projectId: string) => [...tasksKeys.lists(), projectId] as const,
  paymentStatus: (projectId: string) => ["projects", projectId, "paymentStatus"] as const,
};

function invalidateTaskRelatedQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string
) {
  queryClient.invalidateQueries({ queryKey: tasksKeys.list(projectId) });
  queryClient.invalidateQueries({ queryKey: ["sprints"] });
  queryClient.invalidateQueries({ queryKey: ["projects", projectId, "cumulativeProgress"] });
  queryClient.invalidateQueries({ queryKey: ["activities", "list", projectId] });
}

/** Hook TanStack Query untuk mengambil daftar seluruh task (Backlog & Sprint) proyek. */
export function useTasksQuery(projectId: string) {
  return useQuery({
    queryKey: tasksKeys.list(projectId),
    queryFn: async () => {
      const res = await tasksApi.getTasks(projectId);
      if (Array.isArray(res.data)) return res.data;
      if (res.data && Array.isArray(res.data.tasks)) return res.data.tasks;
      return [];
    },
    enabled: !!projectId,
  });
}

/** Hook TanStack Query untuk mengecek status kelengkapan verifikasi DP proyek bagi banner peringatan task. */
export function useProjectPaymentStatusQuery(projectId: string) {
  return useQuery({
    queryKey: tasksKeys.paymentStatus(projectId),
    queryFn: () => tasksApi.getProjectPaymentStatus(projectId),
    enabled: !!projectId,
  });
}

/** Hook mutasi pembuatan task baru (default Backlog bila `sprintId` dikosongkan). */
export function useCreateTaskMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const res = await tasksApi.createTask(projectId, input);
      return res.data;
    },
    onSuccess: (newTask) => {
      toast.success(`Task "${newTask.title}" berhasil ditambahkan`);
      invalidateTaskRelatedQueries(queryClient, projectId);
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Gagal menambahkan task");
    },
  });
}

/** Hook mutasi toggle status checklist task (`todo` <-> `done`) dengan optimistic update. */
export function useUpdateTaskStatusMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
      newOrder,
    }: {
      taskId: string;
      status: TaskStatus;
      newOrder?: number;
    }) => {
      const res = await tasksApi.updateTaskStatus(taskId, status, newOrder);
      return res.data;
    },
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: tasksKeys.list(projectId) });
      const previousTasks = queryClient.getQueryData<Task[]>(tasksKeys.list(projectId));

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          tasksKeys.list(projectId),
          previousTasks.map((t) => (t.id === taskId ? { ...t, status } : t))
        );
      }

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(tasksKeys.list(projectId), context.previousTasks);
      }
      toast.error("Gagal memperbarui status task");
    },
    onSettled: () => {
      invalidateTaskRelatedQueries(queryClient, projectId);
    },
  });
}

/** Hook mutasi pemindahan task ke Sprint target atau kembali ke Backlog (`targetSprintId = null`). */
export function useMoveTaskToSprintMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      targetSprintId,
    }: {
      taskId: string;
      targetSprintId: string | null;
    }) => {
      const res = await tasksApi.moveTaskToSprint(taskId, targetSprintId);
      return res.data;
    },
    onSuccess: (task) => {
      toast.success(
        task.sprintId
          ? "Task berhasil dipindahkan ke Sprint Aktif"
          : "Task berhasil dikembalikan ke Backlog"
      );
      invalidateTaskRelatedQueries(queryClient, projectId);
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Gagal memindahkan task");
    },
  });
}

/** Hook mutasi penghapusan permanen task proyek. */
export function useDeleteTaskMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      await tasksApi.deleteTask(taskId);
      return taskId;
    },
    onSuccess: () => {
      toast.success("Task berhasil dihapus");
      invalidateTaskRelatedQueries(queryClient, projectId);
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Gagal menghapus task");
    },
  });
}
