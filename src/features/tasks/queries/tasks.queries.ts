import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tasksApi } from "../api/tasks.api";
import { CreateTaskInput, Task, TaskStatus } from "../types/tasks.types";

export const tasksKeys = {
  all: ["tasks"] as const,
  lists: () => [...tasksKeys.all, "list"] as const,
  list: (projectId: string) => [...tasksKeys.lists(), projectId] as const,
  paymentStatus: (projectId: string) => ["projects", projectId, "paymentStatus"] as const,
};

export function useTasksQuery(projectId: string) {
  return useQuery({
    queryKey: tasksKeys.list(projectId),
    queryFn: async () => {
      const res = await tasksApi.getTasks(projectId);
      return res.data;
    },
    enabled: !!projectId,
  });
}

export function useProjectPaymentStatusQuery(projectId: string) {
  return useQuery({
    queryKey: tasksKeys.paymentStatus(projectId),
    queryFn: () => tasksApi.getProjectPaymentStatus(projectId),
    enabled: !!projectId,
  });
}

export function useCreateTaskMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const res = await tasksApi.createTask(projectId, input);
      return res.data;
    },
    onSuccess: (newTask) => {
      toast.success(`Task "${newTask.title}" berhasil ditambahkan`);
      queryClient.invalidateQueries({ queryKey: tasksKeys.list(projectId) });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Gagal menambahkan task");
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: tasksKeys.list(projectId) });
    },
  });
}

export function useDeleteTaskMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      await tasksApi.deleteTask(taskId);
      return taskId;
    },
    onSuccess: () => {
      toast.success("Task berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: tasksKeys.list(projectId) });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Gagal menghapus task");
    },
  });
}
