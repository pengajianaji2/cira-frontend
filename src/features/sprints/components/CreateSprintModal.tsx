"use client";

import React, { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { extractWibDateOnly, isValidDateOnly } from "@/shared/lib/business-date";
import { Sprint } from "../types/sprints.types";
import {
  useCreateSprintMutation,
  useUpdateSprintMutation,
} from "../queries/sprints.queries";

interface CreateSprintModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  sprintToEdit?: Sprint | null;
}

export function CreateSprintModal({
  projectId,
  isOpen,
  onClose,
  sprintToEdit = null,
}: CreateSprintModalProps) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateSprintMutation(projectId);
  const updateMutation = useUpdateSprintMutation(projectId);

  const isEditMode = Boolean(sprintToEdit);
  const isActiveSprintEdit = sprintToEdit?.status === "active";
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!isOpen) return;
    if (sprintToEdit) {
      setName(sprintToEdit.name);
      setGoal(sprintToEdit.goal || "");
      setStartDate(extractWibDateOnly(sprintToEdit.startDate));
      setEndDate(extractWibDateOnly(sprintToEdit.endDate));
    } else {
      setName("");
      setGoal("");
      setStartDate("");
      setEndDate("");
    }
    setError(null);
  }, [isOpen, sprintToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Nama sprint wajib diisi.");
      return;
    }

    if (isActiveSprintEdit && (!startDate || !endDate)) {
      setError("Sprint berstatus aktif wajib memiliki tanggal mulai dan tanggal selesai.");
      return;
    }

    if (startDate && !isValidDateOnly(startDate)) {
      setError("Format tanggal mulai tidak valid.");
      return;
    }

    if (endDate && !isValidDateOnly(endDate)) {
      setError("Format tanggal selesai tidak valid.");
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      setError("Tanggal mulai sprint tidak boleh melebihi tanggal selesai.");
      return;
    }

    if (sprintToEdit) {
      updateMutation.mutate(
        {
          sprintId: sprintToEdit.id,
          input: {
            name: trimmedName,
            goal: goal.trim(),
            startDate: startDate || null,
            endDate: endDate || null,
          },
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
      return;
    }

    createMutation.mutate(
      {
        name: trimmedName,
        goal: goal.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
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
        if (!open && !isPending) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight">
            {isEditMode ? `Edit Sprint: ${sprintToEdit?.name}` : "Buat Sprint Baru"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditMode
              ? isActiveSprintEdit
                ? "Perbarui nama, sasaran, atau jadwal tanggal (WIB) sprint yang sedang berjalan."
                : "Perbarui informasi sprint. Tanggal masih dapat dikosongkan selama berstatus planning."
              : "Sprint baru berstatus planning. Tanggal boleh dikosongkan terlebih dahulu (BR-SPRINT-01)."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          <div className="space-y-1.5">
            <label
              htmlFor="sprint-form-name"
              className="text-xs font-semibold text-foreground block"
            >
              Nama Sprint <span className="text-destructive">*</span>
            </label>
            <Input
              id="sprint-form-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Sprint 1 — Autentikasi & RBAC"
              className="rounded-xl text-xs h-10"
              disabled={isPending}
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="sprint-form-goal"
              className="text-xs font-semibold text-foreground block"
            >
              Sasaran Sprint (Goal)
            </label>
            <Textarea
              id="sprint-form-goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Tuliskan target objektif yang ingin dicapai pada sprint ini..."
              rows={3}
              disabled={isPending}
              className="rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="sprint-form-start-date"
                className="text-xs font-semibold text-foreground block"
              >
                Tanggal Mulai {isActiveSprintEdit ? "(Wajib)" : "(Opsional)"}
              </label>
              <Input
                id="sprint-form-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isPending}
                required={isActiveSprintEdit}
                className="rounded-xl text-xs h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="sprint-form-end-date"
                className="text-xs font-semibold text-foreground block"
              >
                Tanggal Selesai {isActiveSprintEdit ? "(Wajib)" : "(Opsional)"}
              </label>
              <Input
                id="sprint-form-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isPending}
                required={isActiveSprintEdit}
                className="rounded-xl text-xs h-10"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {error}
            </p>
          )}

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="rounded-full text-xs h-9 px-4"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
              className="rounded-full text-xs h-9 px-5 bg-primary text-primary-foreground font-semibold"
            >
              {isPending && <Spinner className="size-3.5 mr-1.5" />}
              {isEditMode ? "Simpan Perubahan" : "Buat Sprint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
