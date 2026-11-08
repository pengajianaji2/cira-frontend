"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  ArrowRight01Icon,
  Undo02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task, TaskPriority } from "../types/tasks.types";

interface TaskChecklistItemProps {
  task: Task;
  onToggleStatus: (task: Task, nextStatus: "todo" | "done") => void;
  onDelete?: (taskId: string) => void;
  onRequestMoveToSprint?: (task: Task) => void;
  onReturnToBacklog?: (taskId: string) => void;
  hasActiveSprint?: boolean;
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string }> = {
  urgent: { label: "Urgent", className: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30" },
  high: { label: "High", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  medium: { label: "Medium", className: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30" },
  low: { label: "Low", className: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-400 border-zinc-500/30" },
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

  const handleCheckboxChange = (checked: boolean) => {
    onToggleStatus(task, checked ? "done" : "todo");
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
          aria-label={`Tandai "${task.title}" sebagai ${isDone ? "belum selesai" : "selesai"}`}
          className="size-4.5 rounded-md data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 cursor-pointer"
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

        {(task.assignee?.name || task.assigneeName) && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 rounded-md px-1.5 py-0.5 max-w-[120px] truncate">
            <HugeiconsIcon icon={UserIcon} className="size-3 shrink-0 text-muted-foreground" />
            <span className="truncate">{task.assignee?.name || task.assigneeName}</span>
          </div>
        )}
      </div>

      {/* Kolom Kanan: Aksi (Pindah Sprint / Hapus) */}
      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
        {isBacklog && hasActiveSprint && onRequestMoveToSprint && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[11px] px-2 text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
            onClick={() => onRequestMoveToSprint(task)}
            title="Pindahkan ke Sprint Aktif"
          >
            <span className="hidden sm:inline mr-1">Ke Sprint</span>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
          </Button>
        )}

        {!isBacklog && onReturnToBacklog && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[11px] px-2 text-muted-foreground hover:bg-muted rounded-lg cursor-pointer"
            onClick={() => onReturnToBacklog(task.id)}
            title="Kembalikan ke Backlog"
          >
            <HugeiconsIcon icon={Undo02Icon} className="size-3.5 mr-1" />
            <span className="hidden sm:inline">Ke Backlog</span>
          </Button>
        )}

        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
            onClick={() => onDelete(task.id)}
            title="Hapus task"
          >
            <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
