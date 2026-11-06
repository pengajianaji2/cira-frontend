"use client";

import React, { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  useTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
} from "../queries/tasks.queries";
import { Task, TaskStatus, CreateTaskInput } from "../types/tasks.types";
import { TaskColumn } from "./TaskColumn";
import { TaskCard } from "./TaskCard";
import { TaskCreateDialog } from "./TaskCreateDialog";
import { DpWarningBanner } from "./DpWarningBanner";

interface TaskKanbanBoardProps {
  project: {
    id: string;
    name: string;
    status: string;
  };
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export function TaskKanbanBoard({ project }: TaskKanbanBoardProps) {
  const { data: tasks = [], isLoading } = useTasksQuery(project.id);
  const createTaskMutation = useCreateTaskMutation(project.id);
  const updateStatusMutation = useUpdateTaskStatusMutation(project.id);
  const deleteTaskMutation = useDeleteTaskMutation(project.id);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>("todo");
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Hindari salah trigger klik tombol sebagai drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.assignee?.name.toLowerCase().includes(q)
    );
  }, [tasks, searchQuery]);

  const tasksByColumn = useMemo(() => {
    return {
      todo: filteredTasks.filter((t) => t.status === "todo"),
      in_progress: filteredTasks.filter((t) => t.status === "in_progress"),
      done: filteredTasks.filter((t) => t.status === "done"),
    };
  }, [filteredTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const currentTask = tasks.find((t) => t.id === active.id);
    if (currentTask) {
      setActiveTask(currentTask);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Menentukan target status jika di-drag di atas kolom langsung
    const isOverColumn = COLUMNS.some((col) => col.id === overId);
    if (isOverColumn) {
      const targetColumn = overId as TaskStatus;
      const task = tasks.find((t) => t.id === activeId);
      if (task && task.status !== targetColumn) {
        // Status akan diperbarui saat drag end
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const task = tasks.find((t) => t.id === activeId);
    if (!task) return;

    // Kasus 1: Dijatuhkan langsung di kontainer Kolom
    const isOverColumn = COLUMNS.some((col) => col.id === overId);
    if (isOverColumn) {
      const targetStatus = overId as TaskStatus;
      if (task.status !== targetStatus) {
        updateStatusMutation.mutate({
          taskId: activeId,
          status: targetStatus,
        });
      }
      return;
    }

    // Kasus 2: Dijatuhkan di atas Task lain
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && task.status !== overTask.status) {
      updateStatusMutation.mutate({
        taskId: activeId,
        status: overTask.status,
      });
    }
  };

  const handleOpenCreate = (status: TaskStatus = "todo") => {
    setCreateStatus(status);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (input: CreateTaskInput) => {
    createTaskMutation.mutate(input, {
      onSuccess: () => {
        setIsCreateOpen(false);
      },
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus task ini?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  return (
    <div className="space-y-6">
      {/* AC-8: Banner Peringatan DP jika proyek Active dan belum ada pembayaran verified */}
      <DpWarningBanner
        projectId={project.id}
        projectStatus={project.status}
      />

      {/* Board Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari task atau anggota tim..."
            className="pl-9 rounded-full text-xs h-9 bg-card"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            onClick={() => handleOpenCreate("todo")}
            className="rounded-full text-xs h-9 px-4 bg-primary text-primary-foreground font-semibold"
          >
            <HugeiconsIcon icon={Add01Icon} className="size-3.5 mr-1.5" />
            Tambah Task Baru
          </Button>
        </div>
      </div>

      {/* Kanban Board Columns Area */}
      {isLoading ? (
        <div className="min-h-[360px] flex flex-col items-center justify-center gap-2">
          <Spinner className="size-6 text-primary" />
          <p className="text-xs text-muted-foreground">Memuat task board...</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col lg:flex-row items-start gap-5 overflow-x-auto pb-4 no-scrollbar">
            {COLUMNS.map((col) => (
              <TaskColumn
                key={col.id}
                status={col.id}
                title={col.title}
                tasks={tasksByColumn[col.id]}
                onAddTask={handleOpenCreate}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Create Dialog */}
      <TaskCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        initialStatus={createStatus}
        onSubmit={handleCreateSubmit}
        isPending={createTaskMutation.isPending}
      />
    </div>
  );
}
