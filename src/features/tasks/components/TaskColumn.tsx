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
  Clock01Icon,
  CheckmarkCircle02Icon,
  File01Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  in_progress: {
    icon: Clock01Icon,
    color: "text-blue-600 dark:text-blue-400",
    bgBadge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
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
    data: {
      type: "Column",
      status,
    },
  });

  const meta = COLUMN_META[status];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-muted/30 border rounded-3xl p-4 transition-colors min-w-[280px] w-full lg:w-1/3 flex-1 ${
        isOver
          ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20"
          : "border-border/80"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div
            className={`size-7 rounded-xl flex items-center justify-center bg-card border border-border shadow-xs ${meta.color}`}
          >
            <HugeiconsIcon icon={meta.icon} className="size-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground tracking-tight">
            {title}
          </h3>
          <Badge
            variant="secondary"
            className={`text-xs px-2 py-0 rounded-full font-semibold ${meta.bgBadge}`}
          >
            {tasks.length}
          </Badge>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => onAddTask(status)}
          className="rounded-full text-muted-foreground hover:text-foreground hover:bg-card transition-all"
          title={`Tambah task ke ${title}`}
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
        </Button>
      </div>

      {/* Task List / Drop Area */}
      <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/60 rounded-2xl text-center bg-card/40 my-2">
            <p className="text-xs text-muted-foreground/80 font-medium">
              Belum ada task di tahap ini
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddTask(status)}
              className="mt-3 rounded-full text-xs h-7 px-3 text-muted-foreground hover:text-foreground border-border/80 bg-card"
            >
              <HugeiconsIcon icon={Add01Icon} className="size-3 mr-1" />
              Tambah Task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
