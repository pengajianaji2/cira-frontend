"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sprint, TaskMoveTarget } from "../types/sprints.types";
import {
  useCompleteSprintMutation,
  useSprintByIdQuery,
} from "../queries/sprints.queries";

interface CloseSprintModalProps {
  projectId: string;
  sprint: Sprint;
  allSprints?: Sprint[];
  isOpen: boolean;
  onClose: () => void;
}

export function CloseSprintModal({
  projectId,
  sprint,
  allSprints = [],
  isOpen,
  onClose,
}: CloseSprintModalProps) {
  const completeMutation = useCompleteSprintMutation(projectId);
  const {
    data: sprintDetail,
    isLoading: isLoadingDetail,
    isError: isDetailError,
    refetch: refetchDetail,
  } = useSprintByIdQuery(isOpen ? sprint.id : "");

  const resolvedSprint = sprintDetail ?? sprint;

  const { todoTasks, doneTasks } = useMemo(() => {
    const tasks = resolvedSprint.tasks || [];
    return {
      todoTasks: tasks.filter((t) => t.status !== "done"),
      doneTasks: tasks.filter((t) => t.status === "done"),
    };
  }, [resolvedSprint.tasks]);

  const [destinations, setDestinations] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    setDestinations((prev) => {
      const next: Record<string, string> = {};
      todoTasks.forEach((task) => {
        next[task.id] = prev[task.id] || "backlog";
      });
      return next;
    });
  }, [isOpen, sprint.id, todoTasks]);

  // Daftar sprint planning lain yang dapat menerima task sisa (BR-SPRINT-04)
  const planningSprints = useMemo(
    () => allSprints.filter((s) => s.id !== sprint.id && s.status === "planning"),
    [allSprints, sprint.id]
  );

  const handleDestinationChange = (taskId: string, target: string) => {
    setDestinations((prev) => ({
      ...prev,
      [taskId]: target,
    }));
  };

  const handleConfirm = () => {
    const taskMoves: TaskMoveTarget[] = todoTasks.map((t) => {
      const target = destinations[t.id];
      return {
        taskId: t.id,
        targetSprintId: target === "backlog" || !target ? null : target,
      };
    });

    completeMutation.mutate(
      {
        sprintId: sprint.id,
        input: { taskMoves },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !completeMutation.isPending) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-xl rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight">
            Tutup Sprint: {resolvedSprint.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sesuai aturan bisnis BR-SPRINT-04, seluruh task TODO yang tersisa wajib dialokasikan tujuannya ke Backlog atau sprint perencanaan lain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {isLoadingDetail ? (
            <div className="py-10 flex flex-col items-center justify-center gap-2.5 bg-muted/20 border border-border/60 rounded-2xl">
              <Spinner className="size-6 text-primary" />
              <p className="text-xs text-muted-foreground">
                Memuat daftar task terbaru dalam sprint...
              </p>
            </div>
          ) : isDetailError ? (
            <div
              role="alert"
              className="py-6 px-4 text-center bg-destructive/10 border border-destructive/20 rounded-2xl space-y-2.5"
            >
              <HugeiconsIcon
                icon={AlertCircleIcon}
                className="size-6 text-destructive mx-auto"
                aria-hidden="true"
              />
              <p className="text-xs font-semibold text-destructive">
                Gagal memuat rincian task sprint.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetchDetail()}
                className="rounded-full text-xs h-8 px-4"
              >
                Coba Muat Ulang
              </Button>
            </div>
          ) : (
            <>
              {/* Ringkasan Status Task */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      className="size-4 text-emerald-600"
                      aria-hidden="true"
                    />
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      Task Selesai (Done)
                    </span>
                  </div>
                  <Badge className="bg-emerald-600 text-white text-xs font-mono">
                    {doneTasks.length}
                  </Badge>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={AlertCircleIcon}
                      className="size-4 text-amber-600"
                      aria-hidden="true"
                    />
                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                      Task Tersisa (To Do)
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {todoTasks.length}
                  </Badge>
                </div>
              </div>

              {/* Tabel Resolusi Task TODO jika ada */}
              {todoTasks.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-foreground">
                      Resolusi Task Belum Selesai ({todoTasks.length})
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Pilih tujuan setiap task
                    </p>
                  </div>

                  <div className="max-h-[240px] overflow-y-auto space-y-2 pr-1 border border-border/60 rounded-2xl p-2 bg-muted/10">
                    {todoTasks.map((task) => {
                      const selectId = `close-sprint-target-${task.id}`;
                      return (
                        <div
                          key={task.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-card border border-border/80 rounded-xl"
                        >
                          <div className="min-w-0 flex-1">
                            <label
                              htmlFor={selectId}
                              className="text-xs font-medium text-foreground truncate block cursor-pointer"
                            >
                              {task.title}
                            </label>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {task.storyPoints ? `${task.storyPoints} SP` : "Tanpa SP"} · {task.priority}
                            </span>
                          </div>

                          <div className="w-full sm:w-[210px] shrink-0">
                            <Select
                              value={destinations[task.id] || "backlog"}
                              onValueChange={(val) => handleDestinationChange(task.id, val)}
                            >
                              <SelectTrigger
                                id={selectId}
                                aria-label={`Tujuan pemindahan untuk task "${task.title}"`}
                                className="w-full h-8 text-xs rounded-lg"
                              >
                                <SelectValue placeholder="Pilih tujuan" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="backlog" className="text-xs">
                                  Kembalikan ke Backlog
                                </SelectItem>
                                {planningSprints.map((ps) => (
                                  <SelectItem key={ps.id} value={ps.id} className="text-xs">
                                    Sprint Planning: {ps.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center bg-muted/20 border border-border/50 rounded-2xl space-y-1">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="size-6 text-emerald-600 mx-auto mb-1.5"
                    aria-hidden="true"
                  />
                  <p className="text-xs font-semibold text-foreground">
                    Seluruh Task Telah Selesai!
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Tidak ada task TODO yang tersisa di sprint ini.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            className="rounded-full text-xs h-9 px-4"
            onClick={onClose}
            disabled={completeMutation.isPending}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="rounded-full text-xs h-9 px-5 bg-primary text-primary-foreground font-semibold cursor-pointer"
            onClick={handleConfirm}
            disabled={isLoadingDetail || isDetailError || completeMutation.isPending}
          >
            {completeMutation.isPending && <Spinner className="size-3.5 mr-1.5" />}
            Selesaikan Sprint &amp; Pindahkan Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
