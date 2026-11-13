"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  Calendar03Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  extractWibDateOnly,
  getBusinessDateWib,
  isoToWibDateAndTime,
  isValidDateOnly,
  isValidTimeHHmm,
  wibDateAndTimeToIso,
} from "@/shared/lib/business-date";
import { Project } from "@/features/projects";
import {
  CalendarEvent,
  CreateOperationalEventInput,
  OperationalEventType,
} from "../types/operations.types";
import {
  useCreateOperationalEventMutation,
  useUpdateOperationalEventMutation,
} from "../queries/operations.queries";
import {
  OPERATIONAL_EVENT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
} from "../utils/calendar.helpers";

interface OperationalEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEvent: CalendarEvent | null;
  defaultDateOnly?: string;
  projects: Project[];
  onSaved?: (savedEventId: string) => void;
}

const EVENT_TYPE_OPTIONS: OperationalEventType[] = [
  "client_demo",
  "deployment",
  "maintenance",
  "meeting",
];

export function OperationalEventModal({
  open,
  onOpenChange,
  editingEvent,
  defaultDateOnly,
  projects,
  onSaved,
}: OperationalEventModalProps) {
  const isEditing = Boolean(editingEvent);
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<OperationalEventType>("client_demo");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [allDay, setAllDay] = useState(false);

  const [allDayStartDate, setAllDayStartDate] = useState("");
  const [allDayEndDate, setAllDayEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const [description, setDescription] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const createMutation = useCreateOperationalEventMutation();
  const updateMutation = useUpdateOperationalEventMutation();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;

    const todayWib =
      defaultDateOnly && isValidDateOnly(defaultDateOnly)
        ? defaultDateOnly
        : getBusinessDateWib();

    if (editingEvent && editingEvent.sourceType === "operational_event") {
      setTitle(editingEvent.title);
      setEventType(editingEvent.metadata?.eventType ?? "meeting");
      setProjectId(editingEvent.project?.id ?? null);
      setAllDay(editingEvent.allDay);
      setDescription(editingEvent.metadata?.description ?? "");

      if (editingEvent.allDay) {
        const sDate = extractWibDateOnly(editingEvent.startAt) || todayWib;
        const eDate = editingEvent.endAt
          ? extractWibDateOnly(editingEvent.endAt)
          : sDate;
        setAllDayStartDate(sDate);
        setAllDayEndDate(eDate);
        setStartDate(sDate);
        setStartTime("09:00");
        setEndDate(eDate);
        setEndTime("10:00");
      } else {
        const s = isoToWibDateAndTime(editingEvent.startAt);
        setStartDate(s.date || todayWib);
        setStartTime(s.time || "09:00");
        setAllDayStartDate(s.date || todayWib);

        if (editingEvent.endAt) {
          const e = isoToWibDateAndTime(editingEvent.endAt);
          setEndDate(e.date);
          setEndTime(e.time);
          setAllDayEndDate(e.date);
        } else {
          setEndDate("");
          setEndTime("");
          setAllDayEndDate(s.date || todayWib);
        }
      }
    } else {
      setTitle("");
      setEventType("client_demo");
      setProjectId(null);
      setAllDay(false);
      setAllDayStartDate(todayWib);
      setAllDayEndDate(todayWib);
      setStartDate(todayWib);
      setStartTime("09:00");
      setEndDate(todayWib);
      setEndTime("10:00");
      setDescription("");
    }

    setProjectSearch("");
    setProjectPickerOpen(false);
    setTouched({});
    setSubmitted(false);
  }, [open, editingEvent, defaultDateOnly]);

  const sortedProjects = useMemo(() => {
    const rank: Record<string, number> = {
      active: 0,
      lead: 1,
      completed: 2,
      cancelled: 3,
    };
    return [...projects].sort((a, b) => {
      const rDiff = (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
      return rDiff !== 0 ? rDiff : a.name.localeCompare(b.name);
    });
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    return sortedProjects.filter((p) => {
      if (p.status === "cancelled" && p.id !== projectId) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q)
      );
    });
  }, [sortedProjects, projectSearch, projectId]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === projectId) ?? null,
    [projects, projectId]
  );

  // Validasi form
  const trimmedTitle = title.trim();
  const titleError = !trimmedTitle
    ? "Judul agenda wajib diisi."
    : trimmedTitle.length < 2
    ? "Judul agenda minimal 2 karakter."
    : null;

  const allDayStartError =
    allDay && !isValidDateOnly(allDayStartDate)
      ? "Tanggal mulai sepanjang hari wajib diisi (YYYY-MM-DD)."
      : null;

  const allDayEndError =
    allDay && allDayEndDate.trim()
      ? !isValidDateOnly(allDayEndDate)
        ? "Format tanggal selesai harus YYYY-MM-DD."
        : isValidDateOnly(allDayStartDate) && allDayStartDate > allDayEndDate
        ? "Tanggal selesai tidak boleh mendahului tanggal mulai."
        : null
      : null;

  const timedStartError =
    !allDay && (!isValidDateOnly(startDate) || !isValidTimeHHmm(startTime))
      ? "Tanggal dan jam mulai (WIB) wajib diisi dengan benar."
      : null;

  let timedEndError: string | null = null;
  if (!allDay && (endTime.trim() || (endDate.trim() && endDate !== startDate))) {
    const effectiveEndDate = endDate.trim() || startDate;
    const effectiveEndTime = endTime.trim() || "23:59";
    if (!isValidDateOnly(effectiveEndDate) || !isValidTimeHHmm(effectiveEndTime)) {
      timedEndError = "Format tanggal/jam selesai tidak valid.";
    } else if (isValidDateOnly(startDate) && isValidTimeHHmm(startTime)) {
      const sIso = wibDateAndTimeToIso(startDate, startTime);
      const eIso = wibDateAndTimeToIso(effectiveEndDate, effectiveEndTime);
      if (new Date(sIso).getTime() > new Date(eIso).getTime()) {
        timedEndError = "Waktu selesai tidak boleh mendahului waktu mulai.";
      }
    }
  }

  const showTitleErr = (touched.title || submitted) && Boolean(titleError);
  const showAllDayStartErr =
    (touched.allDayStartDate || submitted) && Boolean(allDayStartError);
  const showAllDayEndErr =
    (touched.allDayEndDate || submitted) && Boolean(allDayEndError);
  const showTimedStartErr =
    (touched.startDate || touched.startTime || submitted) && Boolean(timedStartError);
  const showTimedEndErr =
    (touched.endDate || touched.endTime || submitted) && Boolean(timedEndError);

  const markTouched = (field: string) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  };

  const handleToggleAllDay = (checked: boolean) => {
    setAllDay(checked);
    if (checked) {
      if (isValidDateOnly(startDate) && !isValidDateOnly(allDayStartDate)) {
        setAllDayStartDate(startDate);
      }
      if (!allDayEndDate && isValidDateOnly(startDate)) {
        setAllDayEndDate(startDate);
      }
    } else {
      if (isValidDateOnly(allDayStartDate)) {
        setStartDate(allDayStartDate);
        if (!endDate) setEndDate(allDayStartDate);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const firstError =
      titleError ||
      allDayStartError ||
      allDayEndError ||
      timedStartError ||
      timedEndError;

    if (firstError) {
      toast.error(firstError);
      requestAnimationFrame(() => {
        const firstInvalid = formRef.current?.querySelector<HTMLElement>(
          '[aria-invalid="true"]'
        );
        firstInvalid?.focus();
      });
      return;
    }

    const payload: CreateOperationalEventInput = {
      title: trimmedTitle,
      eventType,
      description: description.trim() ? description.trim() : null,
      projectId: projectId ?? null,
      allDay,
      ...(allDay
        ? {
            allDayStartDate,
            allDayEndDate: allDayEndDate.trim() || allDayStartDate,
          }
        : {
            startAt: wibDateAndTimeToIso(startDate, startTime),
            endAt: endTime.trim()
              ? wibDateAndTimeToIso(endDate.trim() || startDate, endTime.trim())
              : null,
          }),
    };

    if (isEditing && editingEvent) {
      updateMutation.mutate(
        { id: editingEvent.sourceId, input: payload },
        {
          onSuccess: (updated) => {
            onOpenChange(false);
            onSaved?.(`operational_event:${updated.id}`);
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: (created) => {
          onOpenChange(false);
          onSaved?.(`operational_event:${created.id}`);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl p-6 max-h-[90dvh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-primary/15 text-foreground flex items-center justify-center shrink-0">
              <HugeiconsIcon
                icon={isEditing ? Edit02Icon : Calendar03Icon}
                className="size-4.5"
                aria-hidden="true"
              />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {isEditing ? "Edit Agenda Operasional" : "Tambah Agenda Manual"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Jadwal tersimpan dengan acuan zona waktu{" "}
                <span className="font-mono font-semibold">Asia/Jakarta (WIB)</span>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form ref={formRef} noValidate onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Judul Agenda */}
          <div className="space-y-1.5">
            <Label htmlFor="op-event-title" className="text-xs font-semibold text-foreground">
              Judul Acara <span className="text-destructive">*</span>
            </Label>
            <Input
              id="op-event-title"
              name="title"
              required
              maxLength={180}
              value={title}
              aria-invalid={showTitleErr ? "true" : undefined}
              aria-describedby={showTitleErr ? "op-event-title-error" : undefined}
              onBlur={() => markTouched("title")}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Misal: Demo UAT Sprint 2 atau Rapat Mingguan Internal"
              className="h-9 text-xs rounded-xl"
              disabled={isSubmitting}
            />
            {showTitleErr && titleError && (
              <p
                id="op-event-title-error"
                role="alert"
                className="text-[11px] text-destructive flex items-center gap-1"
              >
                <HugeiconsIcon
                  icon={AlertCircleIcon}
                  className="size-3 shrink-0"
                  aria-hidden="true"
                />
                <span>{titleError}</span>
              </p>
            )}
          </div>

          {/* Tipe Agenda */}
          <div className="space-y-1.5">
            <Label htmlFor="op-event-type" className="text-xs font-semibold text-foreground">
              Tipe Agenda <span className="text-destructive">*</span>
            </Label>
            <Select
              value={eventType}
              onValueChange={(val) => setEventType(val as OperationalEventType)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="op-event-type" className="w-full h-9 text-xs rounded-xl">
                <SelectValue placeholder="Pilih tipe agenda" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt} className="text-xs">
                    {OPERATIONAL_EVENT_TYPE_LABELS[opt]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pilihan Proyek Searchable + Internal Kantor (projectId = null) */}
          <div className="space-y-1.5">
            <Label htmlFor="op-event-project" className="text-xs font-semibold text-foreground">
              Proyek Terkait (Opsional)
            </Label>
            <Popover open={projectPickerOpen} onOpenChange={setProjectPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="op-event-project"
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={projectPickerOpen}
                  disabled={isSubmitting}
                  className="w-full h-9 px-3 rounded-xl text-xs font-normal justify-between"
                >
                  <span className="truncate text-left">
                    {selectedProject
                      ? `${selectedProject.name} (${PROJECT_STATUS_LABELS[selectedProject.status]})`
                      : "Internal Kantor (Tanpa Proyek)"}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                    {selectedProject ? "Proyek" : "Internal"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 rounded-2xl p-3 space-y-2">
                <Input
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Cari nama proyek atau klien..."
                  aria-label="Cari proyek terkait"
                  className="h-8 text-xs rounded-xl"
                />
                <div className="max-h-52 overflow-y-auto space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProjectId(null);
                      setProjectPickerOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      projectId === null
                        ? "bg-primary/15 text-foreground font-semibold"
                        : "hover:bg-muted/60"
                    }`}
                  >
                    <span>Internal Kantor (Tanpa Proyek)</span>
                    <Badge variant="secondary" className="text-[10px] rounded-full">
                      Internal
                    </Badge>
                  </button>

                  {filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => {
                        setProjectId(project.id);
                        setProjectPickerOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-colors ${
                        projectId === project.id
                          ? "bg-primary/15 text-foreground font-semibold"
                          : "hover:bg-muted/60"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="block truncate font-medium">{project.name}</span>
                        <span className="block truncate text-[10px] text-muted-foreground">
                          {project.clientName}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px] rounded-full shrink-0">
                        {PROJECT_STATUS_LABELS[project.status]}
                      </Badge>
                    </button>
                  ))}

                  {filteredProjects.length === 0 && (
                    <p className="text-[11px] text-muted-foreground text-center py-2">
                      Tidak ada proyek cocok.
                    </p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Toggle Sepanjang Hari (All Day) */}
          <div className="rounded-2xl border border-border bg-muted/25 p-3">
            <label
              htmlFor="op-event-allday"
              className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer"
            >
              <Checkbox
                id="op-event-allday"
                checked={allDay}
                onCheckedChange={(val) => handleToggleAllDay(Boolean(val))}
                disabled={isSubmitting}
              />
              <span>Sepanjang Hari (All Day · Tanggal Kalender WIB)</span>
            </label>
          </div>

          {/* Jadwal All Day vs Terjadwal WIB */}
          {allDay ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="op-event-allday-start"
                  className="text-xs font-semibold text-foreground"
                >
                  Tanggal Mulai (WIB) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="op-event-allday-start"
                  type="date"
                  required
                  value={allDayStartDate}
                  aria-invalid={showAllDayStartErr ? "true" : undefined}
                  aria-describedby={
                    showAllDayStartErr ? "op-event-allday-start-err" : undefined
                  }
                  onBlur={() => markTouched("allDayStartDate")}
                  onChange={(e) => setAllDayStartDate(e.target.value)}
                  className="h-9 text-xs font-mono rounded-xl"
                  disabled={isSubmitting}
                />
                {showAllDayStartErr && allDayStartError && (
                  <p
                    id="op-event-allday-start-err"
                    role="alert"
                    className="text-[11px] text-destructive flex items-center gap-1"
                  >
                    <HugeiconsIcon
                      icon={AlertCircleIcon}
                      className="size-3 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{allDayStartError}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="op-event-allday-end"
                  className="text-xs font-semibold text-foreground"
                >
                  Tanggal Selesai (WIB)
                </Label>
                <Input
                  id="op-event-allday-end"
                  type="date"
                  value={allDayEndDate}
                  aria-invalid={showAllDayEndErr ? "true" : undefined}
                  aria-describedby={
                    showAllDayEndErr ? "op-event-allday-end-err" : undefined
                  }
                  onBlur={() => markTouched("allDayEndDate")}
                  onChange={(e) => setAllDayEndDate(e.target.value)}
                  className="h-9 text-xs font-mono rounded-xl"
                  disabled={isSubmitting}
                />
                {showAllDayEndErr && allDayEndError && (
                  <p
                    id="op-event-allday-end-err"
                    role="alert"
                    className="text-[11px] text-destructive flex items-center gap-1"
                  >
                    <HugeiconsIcon
                      icon={AlertCircleIcon}
                      className="size-3 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{allDayEndError}</span>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="op-event-start-date"
                    className="text-xs font-semibold text-foreground"
                  >
                    Tanggal Mulai (WIB) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="op-event-start-date"
                    type="date"
                    required
                    value={startDate}
                    aria-invalid={showTimedStartErr ? "true" : undefined}
                    aria-describedby={showTimedStartErr ? "op-event-start-err" : undefined}
                    onBlur={() => markTouched("startDate")}
                    onChange={(e) => {
                      const nextDate = e.target.value;
                      setStartDate(nextDate);
                      if (!endDate || endDate < nextDate) {
                        setEndDate(nextDate);
                      }
                    }}
                    className="h-9 text-xs font-mono rounded-xl"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="op-event-start-time"
                    className="text-xs font-semibold text-foreground"
                  >
                    Jam Mulai (WIB) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="op-event-start-time"
                    type="time"
                    required
                    value={startTime}
                    aria-invalid={showTimedStartErr ? "true" : undefined}
                    aria-describedby={showTimedStartErr ? "op-event-start-err" : undefined}
                    onBlur={() => markTouched("startTime")}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-9 text-xs font-mono rounded-xl"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              {showTimedStartErr && timedStartError && (
                <p
                  id="op-event-start-err"
                  role="alert"
                  className="text-[11px] text-destructive flex items-center gap-1"
                >
                  <HugeiconsIcon
                    icon={AlertCircleIcon}
                    className="size-3 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{timedStartError}</span>
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="op-event-end-date"
                    className="text-xs font-semibold text-foreground"
                  >
                    Tanggal Selesai (Opsional)
                  </Label>
                  <Input
                    id="op-event-end-date"
                    type="date"
                    value={endDate}
                    aria-invalid={showTimedEndErr ? "true" : undefined}
                    aria-describedby={showTimedEndErr ? "op-event-end-err" : undefined}
                    onBlur={() => markTouched("endDate")}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9 text-xs font-mono rounded-xl"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="op-event-end-time"
                    className="text-xs font-semibold text-foreground"
                  >
                    Jam Selesai (Opsional)
                  </Label>
                  <Input
                    id="op-event-end-time"
                    type="time"
                    value={endTime}
                    aria-invalid={showTimedEndErr ? "true" : undefined}
                    aria-describedby={showTimedEndErr ? "op-event-end-err" : undefined}
                    onBlur={() => markTouched("endTime")}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-9 text-xs font-mono rounded-xl"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              {showTimedEndErr && timedEndError && (
                <p
                  id="op-event-end-err"
                  role="alert"
                  className="text-[11px] text-destructive flex items-center gap-1"
                >
                  <HugeiconsIcon
                    icon={AlertCircleIcon}
                    className="size-3 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{timedEndError}</span>
                </p>
              )}
            </div>
          )}

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <Label htmlFor="op-event-desc" className="text-xs font-semibold text-foreground">
              Deskripsi / Catatan Meeting (Opsional)
            </Label>
            <Textarea
              id="op-event-desc"
              rows={3}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agenda pembahasan, peserta yang diundang, atau tautan meeting..."
              className="text-xs rounded-xl"
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="rounded-full h-9 px-4 text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="rounded-full h-9 px-5 text-xs font-semibold shadow-xs"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Agenda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
