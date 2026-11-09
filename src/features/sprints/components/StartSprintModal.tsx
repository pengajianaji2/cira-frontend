"use client";

import React, { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
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
import {
  addDaysDateOnly,
  extractWibDateOnly,
  getBusinessDateWib,
  isValidDateOnly,
} from "@/shared/lib/business-date";
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

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const todayWib = getBusinessDateWib();
    const initialStart = extractWibDateOnly(sprint.startDate) || todayWib;
    const initialEnd =
      extractWibDateOnly(sprint.endDate) || addDaysDateOnly(initialStart, 14);
    setStartDate(initialStart);
    setEndDate(initialEnd);
    setError(null);
  }, [isOpen, sprint.id, sprint.startDate, sprint.endDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError("Tanggal mulai dan tanggal selesai wajib diisi untuk mengaktifkan sprint.");
      return;
    }

    if (!isValidDateOnly(startDate) || !isValidDateOnly(endDate)) {
      setError("Format tanggal mulai atau tanggal selesai tidak valid.");
      return;
    }

    if (startDate > endDate) {
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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !startMutation.isPending) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight">
            Mulai / Aktifkan Sprint: {sprint.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sesuai aturan BR-SPRINT-02, tentukan tanggal mulai dan tanggal selesai valid (WIB) untuk mengaktifkan sprint ini.
          </DialogDescription>
        </DialogHeader>

        {hasAnotherActive && (
          <div
            role="status"
            className="bg-destructive/10 border border-destructive/20 rounded-2xl p-3 flex items-start gap-2.5 text-destructive my-2"
          >
            <HugeiconsIcon icon={AlertCircleIcon} className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[11px] leading-relaxed">
              Peringatan: Proyek ini sudah memiliki sprint aktif (<strong>{activeSprint?.name}</strong>). Hanya satu sprint yang boleh aktif dalam satu waktu.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="start-sprint-start-date"
                className="text-xs font-semibold text-foreground block"
              >
                Tanggal Mulai (WIB) <span className="text-destructive">*</span>
              </label>
              <Input
                id="start-sprint-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={startMutation.isPending}
                className="rounded-xl text-xs h-10"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="start-sprint-end-date"
                className="text-xs font-semibold text-foreground block"
              >
                Tanggal Selesai (WIB) <span className="text-destructive">*</span>
              </label>
              <Input
                id="start-sprint-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={startMutation.isPending}
                className="rounded-xl text-xs h-10"
                required
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 pt-2 border-t border-border/40">
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
              {startMutation.isPending ? (
                <Spinner className="size-3.5 mr-1.5" />
              ) : (
                <HugeiconsIcon icon={PlayIcon} className="size-3.5 mr-1.5" aria-hidden="true" />
              )}
              Aktifkan Sprint
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
