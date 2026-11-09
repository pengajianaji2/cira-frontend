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
    dotClass: "bg-project-status-lead-fg",
    badgeClass: "bg-project-status-lead-bg text-project-status-lead-fg border-project-status-lead-border hover:bg-project-status-lead-bg",
  },
  active: {
    label: "Active",
    dotClass: "bg-project-status-active-fg animate-pulse",
    badgeClass: "bg-project-status-active-bg text-project-status-active-fg border-project-status-active-border hover:bg-project-status-active-bg",
  },
  completed: {
    label: "Completed",
    dotClass: "bg-project-status-completed-fg",
    badgeClass: "bg-project-status-completed-bg text-project-status-completed-fg border-project-status-completed-border hover:bg-project-status-completed-bg",
  },
  cancelled: {
    label: "Cancelled",
    dotClass: "bg-project-status-cancelled-fg",
    badgeClass: "bg-project-status-cancelled-bg text-project-status-cancelled-fg border-project-status-cancelled-border hover:bg-project-status-cancelled-bg",
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
