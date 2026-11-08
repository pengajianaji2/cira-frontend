import { Task } from "@/features/tasks/types/tasks.types";

export type SprintStatus = "planning" | "active" | "completed";

export const FIBONACCI_POINTS = [1, 2, 3, 5, 8, 13] as const;
export type FibonacciPoint = (typeof FIBONACCI_POINTS)[number];

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
  totalPoints?: number;
  completedPoints?: number;
}

export interface CreateSprintInput {
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateSprintInput {
  name?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
}

export interface StartSprintInput {
  startDate: string;
  endDate: string;
}

export interface TaskMoveTarget {
  taskId: string;
  targetSprintId: string | null; // null = Backlog
}

export interface CloseSprintInput {
  taskMoves: TaskMoveTarget[];
}

export interface ProjectCumulativeProgress {
  projectId: string;
  totalScopePoints: number;
  completedPoints: number;
  progress: number; // Persentase matematis 0 - 100
  completedSprintCount?: number;
  totalSprintCount?: number;
}
