"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMyPermissionsQuery } from "@/features/auth";
import { useProjectRosterQuery } from "@/features/projects";
import { useProjectSprintsQuery } from "@/features/sprints";
import {
  useTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "../queries/tasks.queries";
import { Task, CreateTaskInput } from "../types/tasks.types";
import { TODO_BUTTON_INTERACTION_CLASS } from "../taskButtonStyles";
import { TaskChecklistItem } from "./TaskChecklistItem";
import { TaskCreateDialog } from "./TaskCreateDialog";
import { DpWarningBanner } from "./DpWarningBanner";

interface TaskChecklistBoardProps {
  project: {
    id: string;
    name: string;
    status: string;
  };
}

/**
 * Papan Todo proyek yang selalu mengelompokkan pekerjaan ke Sprint.
 */
export function TaskChecklistBoard({ project }: TaskChecklistBoardProps) {
  const { data: permissions = [] } = useMyPermissionsQuery();
  const canWriteTasks = permissions.includes("tasks.write");
  const canDeleteTasks = permissions.includes("tasks.delete");

  const { data: tasks = [], isLoading, isError, refetch } = useTasksQuery(project.id);
  const { data: sprints = [] } = useProjectSprintsQuery(project.id);
  const { data: roster = [] } = useProjectRosterQuery(project.id);

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialSprintId, setCreateInitialSprintId] = useState<string | null>(null);

  // AlertDialog konfirmasi hapus task
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Mutations
  const createTaskMutation = useCreateTaskMutation(project.id);
  const updateStatusMutation = useUpdateTaskStatusMutation(project.id);
  const updateTaskMutation = useUpdateTaskMutation(project.id);
  const deleteTaskMutation = useDeleteTaskMutation(project.id);

  // Cari sprint aktif
  const activeSprint = useMemo(() => {
    return sprints.find((s) => s.status === "active");
  }, [sprints]);

  const sprintTaskGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = tasks.filter((t) => {
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.assignee?.name && t.assignee.name.toLowerCase().includes(q))
      );
    });

    return sprints.map((sprint) => ({
      sprint,
      tasks: filtered.filter((task) => task.sprintId === sprint.id),
    }));
  }, [tasks, sprints, searchQuery]);

  // Handlers
  const handleToggleStatus = (task: Task, nextStatus: "todo" | "done") => {
    updateStatusMutation.mutate({
      taskId: task.id,
      status: nextStatus,
    });
  };

  const handleAssigneeChange = (taskId: string, assigneeId: string | null) => {
    const assigneeName = roster.find((member) => member.userId === assigneeId)?.user.name ?? null;
    updateTaskMutation.mutate({
      taskId,
      input: { assigneeId, assigneeName },
    });
  };

  const handleRequestDeleteTask = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId) || null;
    setTaskToDelete(target);
  };

  const handleConfirmDeleteTask = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!taskToDelete) return;
    deleteTaskMutation.mutate(taskToDelete.id, {
      onSuccess: () => {
        setTaskToDelete(null);
      },
    });
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

  if (isError) {
    return (
      <div
        role="alert"
        className="bg-card border border-destructive/30 rounded-2xl p-8 text-center space-y-3"
      >
        <p className="text-sm font-bold text-destructive">
          Gagal memuat daftar task proyek.
        </p>
        <p className="text-xs text-muted-foreground">
          Periksa koneksi Anda lalu coba muat ulang.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className={`rounded-full text-xs h-9 px-4 ${TODO_BUTTON_INTERACTION_CLASS}`}
        >
          Muat Ulang
        </Button>
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
            aria-hidden="true"
          />
          <Input
            placeholder="Cari task atau penanggung jawab..."
            aria-label="Cari task atau penanggung jawab"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-background"
          />
        </div>

        {canWriteTasks && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={!sprints.some((sprint) => sprint.status !== "completed")}
              className={`rounded-full text-xs h-9 px-4 cursor-pointer ${TODO_BUTTON_INTERACTION_CLASS}`}
              onClick={() => {
                setCreateInitialSprintId(activeSprint?.id ?? sprints.find((sprint) => sprint.status === "planning")?.id ?? null);
                setIsCreateOpen(true);
              }}
            >
              <HugeiconsIcon icon={Add01Icon} className="size-3.5 mr-1.5" aria-hidden="true" />
              Tambah Todo ke Sprint
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {sprintTaskGroups.length ? sprintTaskGroups.map(({ sprint, tasks: sprintTasks }) => {
          const doneCount = sprintTasks.filter((task) => task.status === "done").length;
          return (
            <section key={sprint.id} className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant={sprint.status === "active" ? "default" : "secondary"} className="text-[10px] shrink-0">
                    {sprint.status === "active" ? "Aktif" : sprint.status === "completed" ? "Selesai" : "Planning"}
                  </Badge>
                  <h3 className="text-sm font-bold truncate">{sprint.name}</h3>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">{doneCount}/{sprintTasks.length} selesai</span>
              </div>
              {sprintTasks.length ? (
                <div className="space-y-2">
                  {sprintTasks.map((task) => (
                    <TaskChecklistItem
                      key={task.id}
                      task={task}
                      onToggleStatus={canWriteTasks && sprint.status !== "completed" ? handleToggleStatus : undefined}
                      onDelete={canDeleteTasks ? handleRequestDeleteTask : undefined}
                      assigneeOptions={roster.map((member) => ({ id: member.userId, name: member.user.name }))}
                      onAssigneeChange={canWriteTasks && sprint.status !== "completed" ? handleAssigneeChange : undefined}
                    />
                  ))}
                </div>
              ) : (
                <p className="py-5 text-center text-xs text-muted-foreground">Belum ada Todo di Sprint ini.</p>
              )}
            </section>
          );
        }) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center space-y-3">
            <p className="text-sm font-semibold">Belum ada Sprint</p>
            <p className="text-xs text-muted-foreground">Buat Sprint planning terlebih dahulu, lalu tambahkan Todo ke dalamnya.</p>
            <Button asChild variant="outline" size="sm" className={`rounded-full text-xs ${TODO_BUTTON_INTERACTION_CLASS}`}>
              <Link href={`/projects/${project.id}?tab=sprints`}>Buka Sprint</Link>
            </Button>
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

      {/* AlertDialog Konfirmasi Hapus Task */}
      <AlertDialog
        open={Boolean(taskToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteTaskMutation.isPending) {
            setTaskToDelete(null);
          }
        }}
      >
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Hapus Task?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin menghapus task &ldquo;{taskToDelete?.title}&rdquo;? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={deleteTaskMutation.isPending}
              className="rounded-full text-xs h-9"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteTaskMutation.isPending}
              onClick={handleConfirmDeleteTask}
              className="rounded-full text-xs h-9 font-semibold"
            >
              {deleteTaskMutation.isPending && <Spinner className="size-3.5 mr-1.5" />}
              Ya, Hapus Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
