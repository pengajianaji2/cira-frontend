"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Task } from "../types/tasks.types";

interface MoveToActiveSprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  activeSprintName?: string;
  activeSprintId?: string;
  onConfirm: (taskId: string, targetSprintId: string) => Promise<void>;
  isLoading?: boolean;
}

export function MoveToActiveSprintDialog({
  open,
  onOpenChange,
  task,
  activeSprintName = "Sprint Aktif",
  activeSprintId,
  onConfirm,
  isLoading = false,
}: MoveToActiveSprintDialogProps) {
  if (!task || !activeSprintId) return null;

  const handleConfirm = async () => {
    await onConfirm(task.id, activeSprintId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-foreground">
            Konfirmasi Masuk ke Sprint Aktif
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground pt-1.5">
            Pekerjaan ini akan langsung dimasukkan ke dalam sprint yang sedang berjalan.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/40 border border-border/60 rounded-xl p-3.5 space-y-1.5 my-2">
          <p className="text-xs font-medium text-foreground">
            Task: <span className="font-semibold text-primary">{task.title}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Target Sprint: <span className="font-medium text-foreground">{activeSprintName}</span>
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="rounded-full text-xs h-9 px-4"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="rounded-full text-xs h-9 px-4"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Spinner className="size-3.5 mr-1.5" />}
            Pindahkan ke Sprint Aktif
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
