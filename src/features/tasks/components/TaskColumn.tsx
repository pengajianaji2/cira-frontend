"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  File01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task, TaskStatus } from "../types/tasks.types";
import { TaskCard } from "./TaskCard";

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onDeleteTask: (id: string) => void;
}

type HugeIconType = React.ComponentProps<typeof HugeiconsIcon>["icon"];

const COLUMN_META: Record<
  TaskStatus,
  { icon: HugeIconType; color: string; bgBadge: string }
> = {
  todo: {
    icon: File01Icon,
    color: "text-slate-600 dark:text-slate-400",
    bgBadge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  done: {
    icon: CheckmarkCircle02Icon,
    color: "text-emerald-600 dark:text-emerald-400",
    bgBadge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  },
};

export function TaskColumn({
  status,
  title,
  tasks,
  onAddTask,
  onDeleteTask,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const meta = COLUMN_META[status];
  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-3xl bg-card border transition-all duration-200 overflow-hidden flex-1 min-w-[280px] max-w-full ${
        isOver
          ? "border-primary ring-2 ring-primary/20 shadow-lg"
          : "border-border shadow-xs hover:border-border/80"
      }`}
    >
      {/* Header Kolom */}
      <div className="p-4 border-b border-border/60 flex items-center justify-between gap-2 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-xl bg-card border border-border shadow-2xs ${meta.color}`}>
            <HugeiconsIcon icon={meta.icon} className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground tracking-tight">
              {title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Badge
            variant="secondary"
            className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${meta.bgBadge}`}
          >
            {tasks.length}
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-xl hover:bg-card text-muted-foreground hover:text-foreground"
            onClick={() => onAddTask(status)}
            title={`Tambah task di kolom ${title}`}
          >
            <HugeiconsIcon icon={Add01Icon} className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Area Droppable & Sortable Cards */}
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[220px]">
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-32 border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-center p-4">
            <p className="text-[11px] text-muted-foreground">
              Tarik task ke sini atau buat task baru
            </p>
          </div>
        )}
      </div>

      {/* Tombol Cepat Tambah Task di Bawah Kolom */}
      <div className="p-2.5 border-t border-border/40 bg-muted/10">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground hover:text-foreground justify-start rounded-xl h-8 px-2.5"
          onClick={() => onAddTask(status)}
        >
          <HugeiconsIcon icon={Add01Icon} className="size-3.5 mr-2" />
          Tambah item
        </Button>
      </div>
    </div>
  );
}
