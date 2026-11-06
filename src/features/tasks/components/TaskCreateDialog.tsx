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
} from "../types/tasks.types";

interface TaskCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialStatus?: TaskStatus;
  onSubmit: (input: CreateTaskInput) => void;
  isPending?: boolean;
}

export function TaskCreateDialog({
  isOpen,
  onClose,
  initialStatus = "todo",
  onSubmit,
  isPending = false,
}: TaskCreateDialogProps) {
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [priority, setPriority] = useState<TaskPriority>("medium");

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
    }
  }, [isOpen, initialStatus, reset]);

  const onFormSubmit = (data: CreateTaskInput) => {
    onSubmit({
      ...data,
      status,
      priority,
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
            Masukkan detail tugas dan alokasikan penanggung jawab di tim.
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
              placeholder="Contoh: Implementasi modul filter kasir"
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
              rows={3}
              className="rounded-xl text-xs"
            />
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tahap Kolom
              </label>
              <Select
                value={status}
                onValueChange={(val: TaskStatus) => {
                  setStatus(val);
                  setValue("status", val);
                }}
              >
                <SelectTrigger className="w-full rounded-xl text-xs h-10">
                  <SelectValue placeholder="Pilih Tahap" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="todo" className="text-xs">
                    To Do
                  </SelectItem>
                  <SelectItem value="in_progress" className="text-xs">
                    In Progress
                  </SelectItem>
                  <SelectItem value="done" className="text-xs">
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
                  <SelectItem value="urgent" className="text-xs">
                    Urgent
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Penanggung Jawab */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Penanggung Jawab (Assignee)
            </label>
            <Input
              {...register("assigneeName")}
              placeholder="Contoh: Ivan Developer"
              className="rounded-xl text-xs h-10"
            />
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
