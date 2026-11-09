"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  ArrowRight01Icon,
  Undo02Icon,
} from "@hugeicons/core-free-icons";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/shared/components";
import { Task, TaskPriority } from "../types/tasks.types";

interface TaskChecklistItemProps {
  task: Task;
  onToggleStatus?: (task: Task, nextStatus: "todo" | "done") => void;
  onDelete?: (taskId: string) => void;
  onRequestMoveToSprint?: (task: Task) => void;
  onReturnToBacklog?: (taskId: string) => void;
  hasActiveSprint?: boolean;
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string }> = {
  urgent: { label: "Urgent", className: "bg-task-priority-urgent-bg text-task-priority-urgent-text border-task-priority-urgent-border" },
  high: { label: "High", className: "bg-task-priority-high-bg text-task-priority-high-text border-task-priority-high-border" },
  medium: { label: "Medium", className: "bg-task-priority-medium-bg text-task-priority-medium-text border-task-priority-medium-border" },
  low: { label: "Low", className: "bg-task-priority-low-bg text-task-priority-low-text border-task-priority-low-border" },
};

export function TaskChecklistItem({
  task,
  onToggleStatus,
  onDelete,
  onRequestMoveToSprint,
  onReturnToBacklog,
  hasActiveSprint = false,
}: TaskChecklistItemProps) {
  const isDone = task.status === "done";
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const isBacklog = !task.sprintId;
  const assigneeDisplayName = task.assignee?.name || task.assigneeName;
  const assigneeAvatarUrl = task.assignee?.avatarUrl || task.assignee?.avatar;

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    onToggleStatus?.(task, checked === true ? "done" : "todo");
  };

  return (
    <div
      className={`group flex items-center justify-between gap-3 p-3 rounded-xl border transition-all duration-200 ${
        isDone
          ? "bg-muted/20 border-border/40 opacity-75"
          : "bg-card border-border hover:border-border/80 hover:shadow-xs"
      }`}
    >
      {/* Kolom Kiri: Checkbox & Judul */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Checkbox
          checked={isDone}
          onCheckedChange={handleCheckboxChange}
          disabled={!onToggleStatus}
          aria-label={`Tandai "${task.title}" sebagai ${isDone ? "belum selesai" : "selesai"}`}
          className={`size-4.5 rounded-md data-[state=checked]:bg-status-success-text data-[state=checked]:border-status-success-text ${
            onToggleStatus ? "cursor-pointer" : "cursor-not-allowed"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p
            className={`text-xs font-medium truncate ${
              isDone ? "line-through text-muted-foreground" : "text-foreground"
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Kolom Tengah: Metadata (Priority, Points, Assignee) */}
      <div className="flex items-center gap-2 shrink-0">
        <Badge
          variant="outline"
          className={`text-[10px] font-medium h-5 px-1.5 rounded-md ${priority.className}`}
        >
          {priority.label}
        </Badge>

        {task.storyPoints !== null && task.storyPoints !== undefined && (
          <Badge
            variant="secondary"
            className="text-[10px] font-mono h-5 px-1.5 rounded-md"
            title="Story Points"
          >
            {task.storyPoints} SP
          </Badge>
        )}

        {assigneeDisplayName && (
          <div className="flex items-center gap-1.5 text-[11px] text-foreground bg-muted/60 border border-border/60 rounded-full pl-0.5 pr-2 py-0.5 max-w-[140px] truncate">
            <UserAvatar
              name={assigneeDisplayName}
              avatarUrl={assigneeAvatarUrl}
              size="xs"
              decorative
            />
            <span className="truncate">{assigneeDisplayName}</span>
          </div>
        )}
      </div>

      {/* Kolom Kanan: Aksi (Pindah Sprint / Hapus) */}
      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
        {isBacklog && hasActiveSprint && onRequestMoveToSprint && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-[11px] px-2 text-accent-foreground hover:bg-accent rounded-lg cursor-pointer"
            onClick={() => onRequestMoveToSprint(task)}
            aria-label={`Pindahkan "${task.title}" ke Sprint Aktif`}
            title="Pindahkan ke Sprint Aktif"
          >
            <span className="hidden sm:inline mr-1">Ke Sprint</span>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" aria-hidden="true" />
          </Button>
        )}

        {!isBacklog && onReturnToBacklog && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-[11px] px-2 text-muted-foreground hover:bg-muted rounded-lg cursor-pointer"
            onClick={() => onReturnToBacklog(task.id)}
            aria-label={`Kembalikan "${task.title}" ke Backlog`}
            title="Kembalikan ke Backlog"
          >
            <HugeiconsIcon icon={Undo02Icon} className="size-3.5 mr-1" aria-hidden="true" />
            <span className="hidden sm:inline">Ke Backlog</span>
          </Button>
        )}

        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
            onClick={() => onDelete(task.id)}
            aria-label={`Hapus task "${task.title}"`}
            title="Hapus task"
          >
            <HugeiconsIcon icon={Delete02Icon} className="size-3.5" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
