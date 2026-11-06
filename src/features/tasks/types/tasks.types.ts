import { z } from "zod";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TaskAssignee {
  name: string;
  avatar?: string;
  role?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: TaskAssignee;
  order: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const createTaskSchema = z.object({
  title: z.string().min(2, "Judul task minimal 2 karakter"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assigneeName: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  order?: number;
  assignee?: TaskAssignee;
}
