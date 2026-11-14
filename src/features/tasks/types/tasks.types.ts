import { z } from "zod";

export type TaskStatus = "todo" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TaskAssignee {
  id?: string;
  name: string;
  avatar?: string;
  avatarUrl?: string | null;
  email?: string;
  role?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  sprintId: string;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeRole?: string | null;
  assignee?: TaskAssignee;
  sprint?: {
    id: string;
    name: string;
    status: string;
  } | null;
  order: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTasksResult {
  tasks: Task[];
  hasVerifiedDp: boolean;
  dpWarning: boolean;
}

export const createTaskSchema = z.object({
  title: z.string().min(2, "Judul task minimal 2 karakter"),
  description: z.string().optional(),
  status: z.enum(["todo", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  sprintId: z.string().min(1, "Sprint wajib dipilih"),
  assigneeId: z.string().optional(),
  assigneeName: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  sprintId?: string;
  assigneeId?: string | null;
  assigneeName?: string | null;
  order?: number;
  assignee?: TaskAssignee;
}

export interface MoveTaskToSprintInput {
  targetSprintId: string;
}
