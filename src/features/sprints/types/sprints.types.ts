import type { Task } from "@/features/tasks";

export type SprintStatus = "planning" | "active" | "completed";

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string | null;
  status: SprintStatus;
  startDate?: string | null;
  endDate?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  totalTasks?: number;
  completedTasks?: number;
}

export interface CreateSprintInput {
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  tasks?: Array<{
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high" | "urgent";
    assigneeId?: string | null;
  }>;
}

export interface UpdateSprintInput {
  name?: string;
  goal?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface StartSprintInput {
  startDate: string;
  endDate: string;
}

export interface TaskMoveTarget {
  taskId: string;
  targetSprintId: string;
}

export interface CloseSprintInput {
  taskMoves: TaskMoveTarget[];
}

export interface ProjectCumulativeProgress {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  progress: number; // Persentase matematis 0 - 100
  completedSprintCount?: number;
  totalSprintCount?: number;
}
