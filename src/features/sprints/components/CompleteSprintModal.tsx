"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
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
import { Sprint } from "../types/sprints.types";
import { useCompleteSprintMutation } from "../queries/sprints.queries";

interface CompleteSprintModalProps {
  projectId: string;
  sprint: Sprint;
  isOpen: boolean;
  onClose: () => void;
}

export function CompleteSprintModal({
  projectId,
  sprint,
  isOpen,
  onClose,
}: CompleteSprintModalProps) {
  const completeMutation = useCompleteSprintMutation(projectId);

  const tasks = sprint.tasks || [];
  const incompleteTasks = tasks.filter((t) => t.status !== "done");
  const hasIncompleteTasks = incompleteTasks.length > 0;

  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
  const completedTasksCount = tasks.filter((t) => t.status === "done").length;

  const handleConfirm = () => {
    if (hasIncompleteTasks) return;

    completeMutation.mutate(sprint.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight">
            Selesaikan {sprint.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Validasi kriteria penyelesaian sprint dan pembaruan progres kumulatif proyek.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Peringatan AC-11 jika ada task belum done */}
          {hasIncompleteTasks ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-start gap-2.5 text-destructive">
                <HugeiconsIcon icon={AlertCircleIcon} className="size-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold leading-snug">
                    Sprint Belum Dapat Diselesaikan
                  </h4>
                  <p className="text-[11px] text-destructive/90 mt-0.5 leading-relaxed">
                    Sesuai aturan bisnis AC-11, seluruh task dalam sprint wajib berstatus{" "}
                    <strong>Done</strong> sebelum sprint dapat ditandai selesai. Masih terdapat{" "}
                    <strong>{incompleteTasks.length} task</strong> yang belum selesai:
                  </p>
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pt-1">
                {incompleteTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-2 bg-background/80 px-3 py-1.5 rounded-xl border border-destructive/15 text-xs"
                  >
                    <span className="font-medium text-foreground truncate max-w-[220px]">
                      {task.title}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 capitalize bg-muted border-border"
                    >
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3 text-emerald-800 dark:text-emerald-300">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
              />
              <div className="text-xs space-y-1">
                <p className="font-bold">Seluruh Task Selesai!</p>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  Semua <strong>{tasks.length} task</strong> pada sprint ini telah berstatus{" "}
                  <strong>Done</strong> dengan total akumulasi bobot{" "}
                  <strong>{totalPoints} Story Points</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Rangkuman Sprint */}
          <div className="bg-muted/30 border border-border/80 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Total Task Terdaftar:</span>
              <span className="font-semibold text-foreground">{tasks.length} task</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Task Selesai (Done):</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {completedTasksCount} / {tasks.length}
              </span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Total Story Points:</span>
              <span className="font-semibold text-foreground">{totalPoints} SP</span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={completeMutation.isPending}
            className="rounded-full text-xs h-9 px-4"
          >
            Tutup
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={hasIncompleteTasks || completeMutation.isPending}
            className="rounded-full text-xs h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            {completeMutation.isPending ? "Menyelesaikan..." : "Konfirmasi Selesaikan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
