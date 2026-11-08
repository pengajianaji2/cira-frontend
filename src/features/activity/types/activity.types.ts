export type ActivityCategory = "all" | "finance" | "project" | "task" | "asset";

export interface ActivityUser {
  name: string;
  role: string;
  avatar?: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  category: "finance" | "project" | "task" | "asset";
  action: string;
  description: string;
  user: ActivityUser | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface CreateActivityLogInput {
  projectId: string;
  category: "finance" | "project" | "task" | "asset";
  action: string;
  description: string;
  user?: Partial<ActivityUser>;
  metadata?: Record<string, unknown>;
}
