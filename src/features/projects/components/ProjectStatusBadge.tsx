import React from "react";
import { Badge } from "@/components/ui/badge";
import { ProjectStatus } from "../types/projects.types";
import { cn } from "@/lib/utils";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
  size?: "sm" | "default";
}

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  lead: {
    label: "Lead",
    dotClass: "bg-slate-500",
    badgeClass:
      "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700",
  },
  active: {
    label: "Active",
    dotClass: "bg-blue-500 animate-pulse",
    badgeClass:
      "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  },
  completed: {
    label: "Completed",
    dotClass: "bg-emerald-500",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  },
  cancelled: {
    label: "Cancelled",
    dotClass: "bg-rose-500",
    badgeClass:
      "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
  },
};

export function ProjectStatusBadge({
  status,
  className,
  size = "default",
}: ProjectStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.lead;

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full font-medium inline-flex items-center gap-1.5 transition-colors",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        config.badgeClass,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </Badge>
  );
}
