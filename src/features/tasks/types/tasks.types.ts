import { z } from "zod";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export const FIBONACCI_TASK_POINTS = [1, 2, 3, 5, 8, 13] as const;

export interface TaskAssignee {
  id?: string;
  name: string;
  avatar?: string;
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
  storyPoints?: number | null;
  sprintId?: string | null;
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
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  storyPoints: z
    .number()
    .int("Story points harus berupa bilangan bulat")
    .refine(
      (val) => (FIBONACCI_TASK_POINTS as readonly number[]).includes(val),
      "Story points harus deret Fibonacci: 1, 2, 3, 5, 8, 13"
    )
    .optional(),
  sprintId: z.string().optional(),
  assigneeId: z.string().optional(),
  assigneeName: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  storyPoints?: number | null;
  sprintId?: string | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
  order?: number;
  assignee?: TaskAssignee;
}
