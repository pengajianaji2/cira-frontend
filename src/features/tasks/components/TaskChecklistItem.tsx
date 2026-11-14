"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/shared/components";
import { Task, TaskPriority } from "../types/tasks.types";
import { TODO_BUTTON_INTERACTION_CLASS } from "../taskButtonStyles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskChecklistItemProps {
  task: Task;
  onToggleStatus?: (task: Task, nextStatus: "todo" | "done") => void;
  onDelete?: (taskId: string) => void;
  assigneeOptions?: Array<{ id: string; name: string }>;
  onAssigneeChange?: (taskId: string, assigneeId: string | null) => void;
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
  assigneeOptions = [],
  onAssigneeChange,
}: TaskChecklistItemProps) {
  const isDone = task.status === "done";
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const assigneeDisplayName = task.assignee?.name || task.assigneeName;
  const assigneeAvatarUrl = task.assignee?.avatarUrl || task.assignee?.avatar;

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    onToggleStatus?.(task, checked === true ? "done" : "todo");
  };

  return (
    <div
      className={`group flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-3 p-3 rounded-xl border transition-all duration-200 ${
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
      <div className="flex items-center gap-2 shrink-0 max-w-full">
        <Badge
          variant="outline"
          className={`text-[10px] font-medium h-5 px-1.5 rounded-md ${priority.className}`}
        >
          {priority.label}
        </Badge>

        {onAssigneeChange ? (
          <Select
            value={task.assigneeId ?? "__none"}
            onValueChange={(value) => onAssigneeChange(task.id, value === "__none" ? null : value)}
          >
            <SelectTrigger className="h-7 w-[130px] rounded-full text-[10px]">
              <SelectValue placeholder="Pilih PIC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">Tanpa PIC</SelectItem>
              {assigneeOptions.map((member) => (
                <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : assigneeDisplayName && (
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
      <div className="flex items-center gap-1 shrink-0 ml-auto opacity-80 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer ${TODO_BUTTON_INTERACTION_CLASS}`}
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
