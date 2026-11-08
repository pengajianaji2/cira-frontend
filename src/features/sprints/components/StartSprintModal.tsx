"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  PlayIcon,
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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Sprint } from "../types/sprints.types";
import { useStartSprintMutation } from "../queries/sprints.queries";

interface StartSprintModalProps {
  projectId: string;
  sprint: Sprint;
  activeSprint?: Sprint | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StartSprintModal({
  projectId,
  sprint,
  activeSprint,
  isOpen,
  onClose,
}: StartSprintModalProps) {
  const startMutation = useStartSprintMutation(projectId);

  const defaultStart = sprint.startDate
    ? new Date(sprint.startDate).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const defaultEnd = sprint.endDate
    ? new Date(sprint.endDate).toISOString().slice(0, 10)
    : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError("Tanggal mulai dan tanggal selesai wajib diisi untuk mengaktifkan sprint.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Tanggal mulai tidak boleh melebihi tanggal selesai.");
      return;
    }

    startMutation.mutate(
      {
        sprintId: sprint.id,
        input: { startDate, endDate },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const hasAnotherActive = Boolean(activeSprint && activeSprint.id !== sprint.id);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight">
            Mulai / Aktifkan Sprint: {sprint.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sesuai aturan BR-SPRINT-02, tentukan tanggal mulai dan tanggal selesai valid untuk mengaktifkan sprint ini.
          </DialogDescription>
        </DialogHeader>

        {hasAnotherActive && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-3 flex items-start gap-2.5 text-destructive my-2">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-4 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Peringatan: Proyek ini sudah memiliki sprint aktif (<strong>{activeSprint?.name}</strong>). Hanya satu sprint yang boleh aktif dalam satu waktu.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tanggal Mulai <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl text-xs h-10"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tanggal Selesai <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl text-xs h-10"
                required
              />
            </div>
          </div>

          {error && <p className="text-[11px] text-destructive">{error}</p>}

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              className="rounded-full text-xs h-9 px-4"
              onClick={onClose}
              disabled={startMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={startMutation.isPending || hasAnotherActive}
              className="rounded-full text-xs h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {startMutation.isPending && <Spinner className="size-3.5 mr-1.5" />}
              <HugeiconsIcon icon={PlayIcon} className="size-3.5 mr-1.5" />
              Aktifkan Sprint
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
