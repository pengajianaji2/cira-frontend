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
  useSprintByIdQuery,
  useUpdateSprintMutation,
} from "../queries/sprints.queries";
import { CreateSprintInput } from "../types/sprints.types";
import { useUpdateTaskMutation } from "@/features/tasks/queries/tasks.queries";
import { useProjectRosterQuery } from "@/features/projects";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function parseSprintTemplate(value: string): CreateSprintInput & { errors: string[] } {
  const lines = value.split(/\r?\n/);
  const get = (key: string) => lines.find((line) => line.toUpperCase().startsWith(`${key}:`))?.slice(key.length + 1).trim() || "";
  const taskIndex = lines.findIndex((line) => line.trim().toUpperCase() === "TASKS:");
  const tasks: NonNullable<CreateSprintInput["tasks"]> = [];
  const errors: string[] = [];
  for (const line of lines.slice(taskIndex < 0 ? lines.length : taskIndex + 1)) {
    if (!line.trim()) continue;
    if (line.trim().startsWith("- ")) {
      const match = line.trim().slice(2).match(/^\[(LOW|MEDIUM|HIGH|URGENT)\]\s+(.+)$/i);
      if (!match) { errors.push(`Format task tidak valid: ${line.trim()}`); continue; }
      tasks.push({ title: match[2].trim(), priority: match[1].toLowerCase() as "low" | "medium" | "high" | "urgent" });
    } else if (line.trim().startsWith(">") && tasks.length) {
      tasks[tasks.length - 1].description = line.trim().slice(1).trim();
    }
  }
  const name = get("SPRINT");
  if (!name) errors.unshift("Isi nama dengan format SPRINT: Nama Sprint.");
  if (taskIndex < 0 || tasks.length === 0) errors.push("Tambahkan TASKS: dan minimal satu baris - [MEDIUM] Judul task.");
  return { name, goal: get("GOAL") || undefined, startDate: get("START") || undefined, endDate: get("END") || undefined, tasks, errors };
}

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
  const [inputMode, setInputMode] = useState<"manual" | "template">("manual");
  const [template, setTemplate] = useState("");
  const [defaultAssigneeId, setDefaultAssigneeId] = useState("__none");
  const [taskAssignees, setTaskAssignees] = useState<Record<number, string>>({});
  const templatePreview = parseSprintTemplate(template);
  const { data: roster = [] } = useProjectRosterQuery(projectId);
  const { data: sprintDetail, isLoading: isLoadingSprintTasks } = useSprintByIdQuery(
    isOpen && sprintToEdit ? sprintToEdit.id : ""
  );

  const createMutation = useCreateSprintMutation(projectId);
  const updateMutation = useUpdateSprintMutation(projectId);
  const updateTaskMutation = useUpdateTaskMutation(projectId);

  const isEditMode = Boolean(sprintToEdit);
  const isActiveSprintEdit = sprintToEdit?.status === "active";
  const isPending = createMutation.isPending || updateMutation.isPending || updateTaskMutation.isPending;
  const editableTasks = sprintDetail?.tasks ?? sprintToEdit?.tasks ?? [];

  const handleTaskAssigneeChange = (taskId: string, assigneeId: string) => {
    const member = roster.find((item) => item.userId === assigneeId);
    updateTaskMutation.mutate({
      taskId,
      input: {
        assigneeId: assigneeId === "__none" ? null : assigneeId,
        assigneeName: assigneeId === "__none" ? null : member?.user.name ?? null,
      },
    });
  };

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
    setInputMode("manual");
    setTemplate("");
    setDefaultAssigneeId("__none");
    setTaskAssignees({});
  }, [isOpen, sprintToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = inputMode === "template" && !isEditMode ? templatePreview : null;
    if (parsed?.errors.length) { setError(parsed.errors[0]); return; }
    const trimmedName = (parsed?.name ?? name).trim();
    if (!trimmedName) {
      setError("Nama sprint wajib diisi.");
      return;
    }

    const finalStartDate = parsed?.startDate ?? startDate;
    const finalEndDate = parsed?.endDate ?? endDate;
    if (isActiveSprintEdit && (!finalStartDate || !finalEndDate)) {
      setError("Sprint berstatus aktif wajib memiliki tanggal mulai dan tanggal selesai.");
      return;
    }

    if (finalStartDate && !isValidDateOnly(finalStartDate)) {
      setError("Format tanggal mulai tidak valid.");
      return;
    }

    if (finalEndDate && !isValidDateOnly(finalEndDate)) {
      setError("Format tanggal selesai tidak valid.");
      return;
    }

    if (finalStartDate && finalEndDate && finalStartDate > finalEndDate) {
      setError("Tanggal mulai sprint tidak boleh melebihi tanggal selesai.");
      return;
    }

    if (sprintToEdit) {
      updateMutation.mutate(
        {
          sprintId: sprintToEdit.id,
          input: {
            name: trimmedName,
            goal: (parsed?.goal ?? goal).trim(),
            startDate: finalStartDate || null,
            endDate: finalEndDate || null,
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
        goal: (parsed?.goal ?? goal).trim() || undefined,
        startDate: finalStartDate || undefined,
        endDate: finalEndDate || undefined,
        tasks: parsed?.tasks?.map((task, index) => ({
          ...task,
          assigneeId: (taskAssignees[index] ?? defaultAssigneeId) === "__none"
            ? null
            : taskAssignees[index] ?? defaultAssigneeId,
        })),
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
      <DialogContent className="max-w-xl rounded-3xl p-4 sm:p-6">
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

        {isEditMode && (
          <section className="min-w-0 space-y-2 rounded-xl border border-border p-3">
            <div>
              <h3 className="text-xs font-semibold">PIC Todo <span className="font-normal text-muted-foreground">(opsional)</span></h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Kamu bisa mengatur PIC tiap Todo di sini. Perubahan PIC langsung tersimpan; Sprint tetap bisa berjalan tanpa PIC.</p>
            </div>
            {isLoadingSprintTasks ? (
              <div className="flex justify-center py-3"><Spinner className="size-4" /></div>
            ) : editableTasks.length ? (
              <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                {editableTasks.map((task) => (
                  <div key={task.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(8rem,12rem)] items-center gap-2">
                    <span className="min-w-0 truncate text-xs" title={task.title}>{task.title}</span>
                    <Select
                      value={task.assigneeId ?? "__none"}
                      onValueChange={(value) => handleTaskAssigneeChange(task.id, value)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="h-8 w-full rounded-lg text-xs">
                        <SelectValue placeholder="Pilih PIC" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Tanpa PIC</SelectItem>
                        {roster.filter((member) => member.user.isActive || member.userId === task.assigneeId).map((member) => (
                          <SelectItem key={member.userId} value={member.userId}>{member.user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-2 text-xs text-muted-foreground">Belum ada Todo di Sprint ini.</p>
            )}
          </section>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 my-2 min-w-0">
          {!isEditMode && <div className="flex gap-2"><Button type="button" variant={inputMode === "manual" ? "default" : "outline"} size="sm" onClick={() => setInputMode("manual")}>Manual</Button><Button type="button" variant={inputMode === "template" ? "default" : "outline"} size="sm" onClick={() => setInputMode("template")}>Paste Template</Button></div>}
          {!isEditMode && inputMode === "template" && (
            <div className="space-y-2 min-w-0">
              <label htmlFor="sprint-template" className="text-xs font-semibold">Template Sprint</label>
              <Textarea
                id="sprint-template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={9}
                className="font-mono text-xs"
                placeholder={'SPRINT: Sprint 1 — Contoh\nGOAL: Hasil yang dituju\nSTART: 2026-11-16\nEND: 2026-11-27\n\nTASKS:\n- [HIGH] Judul task\n  > Deskripsi task'}
              />
              <p className="text-[11px] text-muted-foreground">Tanggal YYYY-MM-DD; prioritas LOW, MEDIUM, HIGH, URGENT.</p>
              {templatePreview.errors.length > 0 && <p role="alert" className="text-xs text-destructive">{templatePreview.errors[0]}</p>}
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs">
                <p className="font-semibold">Preview {templatePreview.name || "Sprint"} · {templatePreview.tasks?.length ?? 0} Todo</p>
                {(templatePreview.tasks?.length ?? 0) > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Select value={defaultAssigneeId} onValueChange={setDefaultAssigneeId}>
                        <SelectTrigger className="h-9 flex-1 rounded-lg text-xs">
                          <SelectValue placeholder="Pilih PIC" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">Tanpa PIC</SelectItem>
                          {roster.map((member) => (
                            <SelectItem key={member.userId} value={member.userId}>{member.user.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-lg text-xs"
                        onClick={() => setTaskAssignees({})}
                        disabled={isPending}
                      >
                        Terapkan ke semua
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Pilih PIC di atas lalu terapkan ke semua Todo. Kamu bisa mengganti PIC masing-masing Todo di bawah.</p>
                  </div>
                )}
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {templatePreview.tasks?.map((task, i) => (
                    <li key={`${task.title}-${i}`} className="space-y-1.5 py-1">
                      <div>{task.title} <span className="text-muted-foreground">({task.priority})</span></div>
                      <Select
                        value={taskAssignees[i] ?? defaultAssigneeId}
                        onValueChange={(value) => setTaskAssignees((current) => ({ ...current, [i]: value }))}
                      >
                        <SelectTrigger className="h-8 w-full rounded-lg text-xs">
                          <SelectValue placeholder="Pilih PIC" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">Tanpa PIC</SelectItem>
                          {roster.map((member) => (
                            <SelectItem key={member.userId} value={member.userId}>{member.user.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {inputMode === "manual" && <>
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

          </>}
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
              disabled={!(inputMode === "template" && !isEditMode ? template.trim() : name.trim()) || isPending}
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
