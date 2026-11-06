"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DragDropVerticalIcon,
  Delete02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Task, TaskPriority } from "../types/tasks.types";

interface TaskCardProps {
  task: Task;
  onDelete?: (id: string) => void;
  isOverlay?: boolean;
}

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  low: {
    label: "Low",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200",
  },
  medium: {
    label: "Medium",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200",
  },
  high: {
    label: "High",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200",
  },
  urgent: {
    label: "Urgent",
    className: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 font-semibold",
  },
};

export function TaskCard({ task, onDelete, isOverlay = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityMeta = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  const initials = task.assignee?.name
    ? task.assignee.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-card border border-border rounded-2xl p-4 shadow-xs transition-all ${
        isDragging
          ? "opacity-30 border-dashed border-primary"
          : isOverlay
          ? "shadow-xl border-primary ring-2 ring-primary/20 rotate-1 cursor-grabbing"
          : "hover:border-foreground/20 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <Badge
          variant="outline"
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${priorityMeta.className}`}
        >
          {priorityMeta.label}
        </Badge>

        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          {onDelete && !isOverlay && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="text-muted-foreground hover:text-destructive rounded-lg transition-colors"
              title="Hapus task"
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
            </Button>
          )}

          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -mr-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
            title="Seret task"
          >
            <HugeiconsIcon icon={DragDropVerticalIcon} className="size-4" />
          </div>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-foreground mt-2.5 leading-snug">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          {initials ? (
            <Avatar className="size-5 rounded-full bg-primary/20 text-[10px] font-bold text-foreground">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="size-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <HugeiconsIcon icon={UserIcon} className="size-3" />
            </div>
          )}
          <span className="text-[11px] font-medium text-foreground/80 truncate max-w-[120px]">
            {task.assignee?.name || "Belum ditugaskan"}
          </span>
        </div>

        <span className="text-[10px] text-muted-foreground/70">
          {new Date(task.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
    </div>
  );
}
