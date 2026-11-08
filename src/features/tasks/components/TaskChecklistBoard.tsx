"use client";

import React, { useState, useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Search01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Folder01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import {
  useTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useMoveTaskToSprintMutation,
  useDeleteTaskMutation,
} from "../queries/tasks.queries";
import { Task, CreateTaskInput } from "../types/tasks.types";
import { TaskChecklistItem } from "./TaskChecklistItem";
import { TaskCreateDialog } from "./TaskCreateDialog";
import { MoveToActiveSprintDialog } from "./MoveToActiveSprintDialog";
import { DpWarningBanner } from "./DpWarningBanner";
import { useProjectSprintsQuery } from "@/features/sprints";

interface TaskChecklistBoardProps {
  project: {
    id: string;
    name: string;
    status: string;
  };
}

export function TaskChecklistBoard({ project }: TaskChecklistBoardProps) {
  const { data: tasks = [], isLoading } = useTasksQuery(project.id);
  const { data: sprints = [] } = useProjectSprintsQuery(project.id);

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialSprintId, setCreateInitialSprintId] = useState<string | null>(null);

  // Dialog konfirmasi pemindahan ke sprint aktif
  const [taskToMove, setTaskToMove] = useState<Task | null>(null);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);

  // Mutations
  const createTaskMutation = useCreateTaskMutation(project.id);
  const updateStatusMutation = useUpdateTaskStatusMutation(project.id);
  const moveTaskMutation = useMoveTaskToSprintMutation(project.id);
  const deleteTaskMutation = useDeleteTaskMutation(project.id);

  // Cari sprint aktif
  const activeSprint = useMemo(() => {
    return sprints.find((s) => s.status === "active");
  }, [sprints]);

  // Pisahkan task berdasarkan Sprint Aktif dan Backlog
  const { activeSprintTasks, backlogTasks } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = tasks.filter((t) => {
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.assignee?.name && t.assignee.name.toLowerCase().includes(q))
      );
    });

    const active = activeSprint
      ? filtered.filter((t) => t.sprintId === activeSprint.id)
      : [];
    const backlog = filtered.filter((t) => !t.sprintId);

    return {
      activeSprintTasks: active,
      backlogTasks: backlog,
    };
  }, [tasks, activeSprint, searchQuery]);

  // Statistik Sprint Aktif
  const sprintStats = useMemo(() => {
    if (!activeSprintTasks.length) return { total: 0, done: 0, percent: 0 };
    const done = activeSprintTasks.filter((t) => t.status === "done").length;
    const total = activeSprintTasks.length;
    return {
      total,
      done,
      percent: Math.round((done / total) * 100),
    };
  }, [activeSprintTasks]);

  // Handlers
  const handleToggleStatus = (task: Task, nextStatus: "todo" | "done") => {
    updateStatusMutation.mutate({
      taskId: task.id,
      status: nextStatus,
    });
  };

  const handleRequestMoveToSprint = (task: Task) => {
    setTaskToMove(task);
    setIsMoveDialogOpen(true);
  };

  const handleConfirmMoveToSprint = async (taskId: string, targetSprintId: string) => {
    await moveTaskMutation.mutateAsync({
      taskId,
      targetSprintId,
    });
  };

  const handleReturnToBacklog = (taskId: string) => {
    moveTaskMutation.mutate({
      taskId,
      targetSprintId: null,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const handleCreateSubmit = (input: CreateTaskInput) => {
    createTaskMutation.mutate(input, {
      onSuccess: () => {
        setIsCreateOpen(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[350px] flex flex-col items-center justify-center gap-3">
        <Spinner className="size-6 text-primary" />
        <p className="text-xs text-muted-foreground">Memuat checklist task...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner DP Warning (jika belum ada pembayaran terverifikasi) */}
      <DpWarningBanner projectId={project.id} projectStatus={project.status} />

      {/* Kontrol Filter & Tambah Task */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border rounded-2xl p-3.5">
        <div className="relative flex-1 max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
          />
          <Input
            placeholder="Cari task atau penanggung jawab..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-background"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="rounded-full text-xs h-9 px-4 cursor-pointer"
            onClick={() => {
              setCreateInitialSprintId(null);
              setIsCreateOpen(true);
            }}
          >
            <HugeiconsIcon icon={Add01Icon} className="size-3.5 mr-1.5" />
            Tambah Task ke Backlog
          </Button>
        </div>
      </div>

      {/* SEKSI 1: SPRINT AKTIF */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-4">
        {activeSprint ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                    🟢 Sprint Aktif
                  </Badge>
                  <h3 className="text-sm font-bold text-foreground">
                    {activeSprint.name}
                  </h3>
                </div>
                {activeSprint.goal && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    Goal: {activeSprint.goal}
                  </p>
                )}
              </div>

              {/* Progress Bar Task Sprint */}
              <div className="sm:text-right shrink-0 min-w-[180px]">
                <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-medium text-foreground mb-1.5">
                  <span className="text-muted-foreground text-[11px]">
                    {sprintStats.done} dari {sprintStats.total} selesai
                  </span>
                  <span className="font-bold font-mono">{sprintStats.percent}%</span>
                </div>
                <Progress value={sprintStats.percent} className="h-2 rounded-full" />
              </div>
            </div>

            {/* Daftar Task Sprint Aktif */}
            {activeSprintTasks.length > 0 ? (
              <div className="space-y-2">
                {activeSprintTasks.map((task) => (
                  <TaskChecklistItem
                    key={task.id}
                    task={task}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDeleteTask}
                    onReturnToBacklog={handleReturnToBacklog}
                    hasActiveSprint={Boolean(activeSprint)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground bg-muted/20 border border-dashed border-border rounded-xl">
                <p>Belum ada task di sprint aktif ini.</p>
                <p className="text-[11px] mt-1">
                  Pindahkan task dari daftar Backlog di bawah untuk mulai mengerjakannya.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center bg-muted/20 border border-border/60 rounded-xl space-y-2">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <HugeiconsIcon icon={Calendar03Icon} className="size-5" />
            </div>
            <h4 className="text-xs font-semibold text-foreground">Tidak Ada Sprint Aktif</h4>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Saat ini belum ada sprint yang sedang berjalan. Buat atau aktifkan sprint dari tab Sprints untuk mengalokasikan task.
            </p>
          </div>
        )}
      </div>

      {/* SEKSI 2: BACKLOG PROYEK */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Folder01Icon} className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">Backlog Proyek</h3>
            <Badge variant="secondary" className="text-xs font-mono px-2 py-0.5 rounded-full">
              {backlogTasks.length} task
            </Badge>
          </div>
        </div>

        {backlogTasks.length > 0 ? (
          <div className="space-y-2">
            {backlogTasks.map((task) => (
              <TaskChecklistItem
                key={task.id}
                task={task}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteTask}
                onRequestMoveToSprint={handleRequestMoveToSprint}
                hasActiveSprint={Boolean(activeSprint)}
              />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-muted-foreground bg-muted/20 border border-dashed border-border rounded-xl">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-6 mx-auto mb-2 text-muted-foreground/60" />
            <p className="font-medium text-foreground">Backlog Kosong</p>
            <p className="text-[11px] mt-0.5">
              Semua pekerjaan telah dialokasikan ke sprint atau selesai. Klik tombol di atas untuk menambah task backlog baru.
            </p>
          </div>
        )}
      </div>

      {/* Modal Dialog Buat Task */}
      <TaskCreateDialog
        projectId={project.id}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        initialSprintId={createInitialSprintId}
        onSubmit={handleCreateSubmit}
        isPending={createTaskMutation.isPending}
      />

      {/* Modal Dialog Konfirmasi Masuk Sprint Aktif (BR-TASK-03) */}
      <MoveToActiveSprintDialog
        open={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
        task={taskToMove}
        activeSprintName={activeSprint?.name}
        activeSprintId={activeSprint?.id}
        onConfirm={handleConfirmMoveToSprint}
        isLoading={moveTaskMutation.isPending}
      />
    </div>
  );
}
