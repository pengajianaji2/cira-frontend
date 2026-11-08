"use client";

import React, { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Folder01Icon,
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
import { useCompleteSprintMutation } from "../queries/sprints.queries";

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

  const tasks = sprint.tasks || [];
  const todoTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");

  // State untuk menyimpan alokasi tujuan per task TODO
  // Record<taskId, string | "backlog">
  const [destinations, setDestinations] = useState<Record<string, string>>({});

  // Reset destinasi saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {};
      todoTasks.forEach((t) => {
        initial[t.id] = "backlog"; // default ke Backlog
      });
      setDestinations(initial);
    }
  }, [isOpen, sprint.id]);

  // Daftar sprint planning lain yang dapat menerima task
  const planningSprints = allSprints.filter(
    (s) => s.id !== sprint.id && s.status === "planning"
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight">
            Tutup Sprint: {sprint.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sesuai aturan bisnis BR-SPRINT-04, seluruh task TODO yang tersisa wajib dialokasikan tujuannya ke Backlog atau sprint rencana lain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Ringkasan Status Task */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-600" />
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
                <HugeiconsIcon icon={AlertCircleIcon} className="size-4 text-amber-600" />
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
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">
                  Resolusi Task Belum Selesai ({todoTasks.length})
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Pilih ke mana task akan dipindahkan
                </p>
              </div>

              <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 border border-border/60 rounded-2xl p-2 bg-muted/10">
                {todoTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-card border border-border/80 rounded-xl"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">
                        {task.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {task.storyPoints ? `${task.storyPoints} SP` : "Tanpa SP"} · {task.priority}
                      </span>
                    </div>

                    <div className="w-full sm:w-[200px] shrink-0">
                      <Select
                        value={destinations[task.id] || "backlog"}
                        onValueChange={(val) => handleDestinationChange(task.id, val)}
                      >
                        <SelectTrigger className="w-full h-8 text-xs rounded-lg">
                          <SelectValue placeholder="Pilih tujuan" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="backlog" className="text-xs">
                            📦 Kembalikan ke Backlog
                          </SelectItem>
                          {planningSprints.map((ps) => (
                            <SelectItem key={ps.id} value={ps.id} className="text-xs">
                              ⚪ {ps.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center bg-muted/20 border border-border/50 rounded-2xl space-y-1">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-6 text-emerald-600 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-foreground">
                Seluruh Task Telah Selesai!
              </p>
              <p className="text-[11px] text-muted-foreground">
                Tidak ada task TODO yang tersisa di sprint ini.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
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
            disabled={completeMutation.isPending}
          >
            {completeMutation.isPending && <Spinner className="size-3.5 mr-1.5" />}
            Selesaikan Sprint & Pindahkan Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
