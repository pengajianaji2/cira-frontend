"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createTaskSchema,
  CreateTaskInput,
  TaskStatus,
  TaskPriority,
  FIBONACCI_TASK_POINTS,
} from "../types/tasks.types";
import { useProjectSprintsQuery } from "@/features/sprints/queries/sprints.queries";
import { useProjectRosterQuery } from "@/features/projects/queries/governance.queries";

interface TaskCreateDialogProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  initialStatus?: TaskStatus;
  initialSprintId?: string | null;
  onSubmit: (input: CreateTaskInput) => void;
  isPending?: boolean;
}

export function TaskCreateDialog({
  projectId,
  isOpen,
  onClose,
  initialStatus = "todo",
  initialSprintId = null,
  onSubmit,
  isPending = false,
}: TaskCreateDialogProps) {
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [storyPoints, setStoryPoints] = useState<string>("none");
  const [sprintId, setSprintId] = useState<string>(initialSprintId || "none");
  const [assigneeId, setAssigneeId] = useState<string>("none");

  const { data: sprints = [] } = useProjectSprintsQuery(projectId);
  const { data: roster = [] } = useProjectRosterQuery(projectId);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: initialStatus,
      priority: "medium",
      assigneeName: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: "",
        description: "",
        status: initialStatus,
        priority: "medium",
        assigneeName: "",
      });
      setStatus(initialStatus);
      setPriority("medium");
      setStoryPoints("none");
      setSprintId(initialSprintId || "none");
      setAssigneeId("none");
    }
  }, [isOpen, initialStatus, initialSprintId, reset]);

  const onFormSubmit = (data: CreateTaskInput) => {
    const selectedPoints = storyPoints !== "none" ? Number(storyPoints) : undefined;
    const selectedSprint = sprintId !== "none" ? sprintId : undefined;

    let finalAssigneeId: string | undefined = undefined;
    let finalAssigneeName = data.assigneeName?.trim() || undefined;

    if (assigneeId !== "none") {
      const selectedMember = roster.find((m) => m.userId === assigneeId);
      if (selectedMember) {
        finalAssigneeId = selectedMember.userId;
        finalAssigneeName = selectedMember.user?.name || finalAssigneeName;
      }
    }

    onSubmit({
      ...data,
      status,
      priority,
      storyPoints: selectedPoints,
      sprintId: selectedSprint,
      assigneeId: finalAssigneeId,
      assigneeName: finalAssigneeName,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight">
            Tambah Task Baru
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Task baru default masuk ke Backlog kecuali sprint dipilih secara eksplisit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 my-2">
          {/* Judul Task */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Judul Task <span className="text-destructive">*</span>
            </label>
            <Input
              {...register("title")}
              placeholder="Contoh: Implementasi validasi checkout"
              className="rounded-xl text-xs h-10"
              autoFocus
            />
            {errors.title && (
              <p className="text-[11px] text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Deskripsi Singkat
            </label>
            <Textarea
              {...register("description")}
              placeholder="Jelaskan kebutuhan teknis atau kriteria selesai task ini..."
              rows={2}
              className="rounded-xl text-xs"
            />
          </div>

          {/* Story Points Fibonacci & Alokasi Sprint */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Story Points (Fibonacci)
              </label>
              <Select
                value={storyPoints}
                onValueChange={(val) => {
                  setStoryPoints(val);
                  setValue(
                    "storyPoints",
                    val !== "none" ? Number(val) : undefined
                  );
                }}
              >
                <SelectTrigger className="w-full rounded-xl text-xs h-10">
                  <SelectValue placeholder="Pilih Story Points" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none" className="text-xs text-muted-foreground">
                    Belum Ditentukan
                  </SelectItem>
                  {FIBONACCI_TASK_POINTS.map((pt) => (
                    <SelectItem key={pt} value={String(pt)} className="text-xs font-medium">
                      {pt} SP {pt === 1 ? "(Sangat Kecil)" : pt === 3 ? "(Sedang)" : pt === 8 ? "(Besar)" : pt === 13 ? "(Sangat Kompleks)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Alokasi Sprint
              </label>
              <Select
                value={sprintId}
                onValueChange={(val) => {
                  setSprintId(val);
                  setValue("sprintId", val !== "none" ? val : undefined);
                }}
              >
                <SelectTrigger className="w-full rounded-xl text-xs h-10">
                  <SelectValue placeholder="Pilih Sprint" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none" className="text-xs text-muted-foreground font-medium">
                    📦 Backlog (Default)
                  </SelectItem>
                  {sprints.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">
                      {s.status === "active" ? "🟢" : "⚪"} {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Task & Prioritas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Status Awal
              </label>
              <Select
                value={status}
                onValueChange={(val: TaskStatus) => {
                  setStatus(val);
                  setValue("status", val);
                }}
              >
                <SelectTrigger className="w-full rounded-xl text-xs h-10">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="todo" className="text-xs font-medium">
                    To Do
                  </SelectItem>
                  <SelectItem value="done" className="text-xs font-medium">
                    Done
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Prioritas
              </label>
              <Select
                value={priority}
                onValueChange={(val: TaskPriority) => {
                  setPriority(val);
                  setValue("priority", val);
                }}
              >
                <SelectTrigger className="w-full rounded-xl text-xs h-10">
                  <SelectValue placeholder="Prioritas" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="low" className="text-xs">
                    Low
                  </SelectItem>
                  <SelectItem value="medium" className="text-xs">
                    Medium
                  </SelectItem>
                  <SelectItem value="high" className="text-xs">
                    High
                  </SelectItem>
                  <SelectItem value="urgent" className="text-xs font-semibold text-rose-600">
                    Urgent
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee dari Roster Proyek */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Penanggung Jawab (Assignee)
            </label>
            {roster.length > 0 ? (
              <Select
                value={assigneeId}
                onValueChange={(val) => {
                  setAssigneeId(val);
                  if (val === "none") {
                    setValue("assigneeId", undefined);
                  } else {
                    setValue("assigneeId", val);
                  }
                }}
              >
                <SelectTrigger className="w-full rounded-xl text-xs h-10">
                  <SelectValue placeholder="Pilih dari Roster Proyek" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none" className="text-xs text-muted-foreground">
                    Belum Ditugaskan
                  </SelectItem>
                  {roster.map((m) => (
                    <SelectItem key={m.userId} value={m.userId} className="text-xs">
                      {m.user?.name || "Anggota"} ({m.user?.roles?.[0] || "member"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                {...register("assigneeName")}
                placeholder="Contoh: Ivan Developer"
                className="rounded-xl text-xs h-10"
              />
            )}
          </div>

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
              disabled={isPending}
              className="rounded-full text-xs h-9 px-5 bg-primary text-primary-foreground font-semibold"
            >
              {isPending ? "Menyimpan..." : "Buat Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
