"use client";

import React, { useState } from "react";
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
import { useCreateSprintMutation } from "../queries/sprints.queries";

interface CreateSprintModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSprintModal({
  projectId,
  isOpen,
  onClose,
}: CreateSprintModalProps) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const createMutation = useCreateSprintMutation(projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createMutation.mutate(
      {
        name: name.trim(),
        goal: goal.trim() || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          setName("");
          setGoal("");
          setStartDate("");
          setEndDate("");
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight">
            Buat Sprint Baru
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sprint baru akan berstatus perencanaan (planning) sampai Anda memulainya secara resmi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          {/* Nama Sprint */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nama Sprint <span className="text-destructive">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Sprint 1 — Autentikasi & RBAC"
              className="rounded-xl text-xs h-10"
              autoFocus
              required
            />
          </div>

          {/* Goal / Sasaran Sprint */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Sasaran Sprint (Goal)
            </label>
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Tuliskan target objektif yang ingin dicapai pada sprint ini..."
              rows={3}
              className="rounded-xl text-xs"
            />
          </div>

          {/* Rentang Tanggal */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tanggal Mulai
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl text-xs h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tanggal Selesai
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl text-xs h-10"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="rounded-full text-xs h-9 px-4"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || createMutation.isPending}
              className="rounded-full text-xs h-9 px-5 bg-primary text-primary-foreground font-semibold"
            >
              {createMutation.isPending ? "Membuat..." : "Buat Sprint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
