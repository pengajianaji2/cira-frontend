"use client";

import React, { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  diffDaysInclusive,
  formatDateWibDisplay,
  formatMonthYearWib,
  isValidDateOnly,
} from "@/shared/lib/business-date";
import { Project } from "@/features/projects";
import {
  CalendarProjectStatus,
  CalendarSourceType,
  INTERNAL_PROJECT_SENTINEL,
  MAX_CALENDAR_RANGE_DAYS,
} from "../types/operations.types";
import {
  PROJECT_STATUS_LABELS,
  SOURCE_TYPE_LABELS,
} from "../utils/calendar.helpers";

export type CalendarViewMode = "grid" | "list";

const ALL_SOURCE_TYPES: CalendarSourceType[] = [
  "sprint",
  "payment_term",
  "invoice",
  "operational_event",
];

const ALL_PROJECT_STATUSES: CalendarProjectStatus[] = [
  "active",
  "lead",
  "completed",
  "cancelled",
];

interface CalendarHeaderControlsProps {
  from: string;
  to: string;
  isCustomRange: boolean;
  anchorYear: number;
  anchorMonth: number;
  selectedTypes: CalendarSourceType[];
  selectedProjectIds: string[];
  selectedProjectStatuses: CalendarProjectStatus[];
  includeCancelled: boolean;
  viewMode: CalendarViewMode;
  projects: Project[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onApplyCustomRange: (from: string, to: string) => void;
  onToggleType: (type: CalendarSourceType) => void;
  onResetTypes: () => void;
  onChangeProjectIds: (ids: string[]) => void;
  onChangeProjectStatuses: (statuses: CalendarProjectStatus[]) => void;
  onChangeIncludeCancelled: (val: boolean) => void;
  onChangeViewMode: (mode: CalendarViewMode) => void;
}

export function CalendarHeaderControls({
  from,
  to,
  isCustomRange,
  anchorYear,
  anchorMonth,
  selectedTypes,
  selectedProjectIds,
  selectedProjectStatuses,
  includeCancelled,
  viewMode,
  projects,
  onPrevMonth,
  onNextMonth,
  onToday,
  onApplyCustomRange,
  onToggleType,
  onResetTypes,
  onChangeProjectIds,
  onChangeProjectStatuses,
  onChangeIncludeCancelled,
  onChangeViewMode,
}: CalendarHeaderControlsProps) {
  const [rangeOpen, setRangeOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [projectSearch, setProjectSearch] = useState("");

  useEffect(() => {
    setDraftFrom(from);
    setDraftTo(to);
    setRangeError(null);
  }, [from, to, rangeOpen]);

  const activeWindowDays =
    isValidDateOnly(from) && isValidDateOnly(to) ? diffDaysInclusive(from, to) : 0;

  const headingLabel = isCustomRange
    ? `${formatDateWibDisplay(from)} – ${formatDateWibDisplay(to)}`
    : formatMonthYearWib(anchorYear, anchorMonth);

  const handleRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidDateOnly(draftFrom) || !isValidDateOnly(draftTo)) {
      setRangeError("Format tanggal mulai dan selesai harus YYYY-MM-DD.");
      return;
    }
    if (draftFrom > draftTo) {
      setRangeError("Tanggal mulai tidak boleh melebihi tanggal selesai.");
      return;
    }
    const span = diffDaysInclusive(draftFrom, draftTo);
    if (span > MAX_CALENDAR_RANGE_DAYS) {
      setRangeError(
        `Rentang tanggal maksimal ${MAX_CALENDAR_RANGE_DAYS} hari (saat ini ${span} hari).`
      );
      return;
    }
    setRangeError(null);
    onApplyCustomRange(draftFrom, draftTo);
    setRangeOpen(false);
  };

  const filteredProjects = projects.filter((p) => {
    const statusMatched = selectedProjectStatuses.includes(p.status);
    if (!statusMatched) return false;
    const q = projectSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q)
    );
  });

  const toggleProjectId = (id: string) => {
    if (selectedProjectIds.includes(id)) {
      onChangeProjectIds(selectedProjectIds.filter((item) => item !== id));
    } else {
      onChangeProjectIds([...selectedProjectIds, id]);
    }
  };

  const toggleProjectStatus = (status: CalendarProjectStatus) => {
    if (selectedProjectStatuses.includes(status)) {
      if (selectedProjectStatuses.length === 1) return; // Pertahankan minimal 1 status proyek
      onChangeProjectStatuses(
        selectedProjectStatuses.filter((item) => item !== status)
      );
    } else {
      onChangeProjectStatuses([...selectedProjectStatuses, status]);
    }
  };

  const activeFilterCount =
    selectedProjectIds.length +
    (selectedProjectStatuses.length === 1 && selectedProjectStatuses[0] === "active"
      ? 0
      : 1) +
    (includeCancelled ? 1 : 0);

  return (
    <section
      className="bg-card border border-border rounded-3xl p-4 md:p-6 shadow-xs space-y-4"
      aria-labelledby="calendar-controls-heading"
    >
      <h2 id="calendar-controls-heading" className="sr-only">
        Navigasi rentang waktu, pengalih tampilan, dan filter kalender
      </h2>
      {/* Baris 1: Navigasi Waktu (<= 90 Hari), Pengalih Tampilan, & Filter Proyek */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background p-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onPrevMonth}
              aria-label="Bulan sebelumnya"
              className="rounded-full size-11 md:size-9"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" aria-hidden="true" />
            </Button>
            <span className="px-2.5 text-xs md:text-sm font-bold text-foreground min-w-[130px] text-center">
              {headingLabel}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onNextMonth}
              aria-label="Bulan berikutnya"
              className="rounded-full size-11 md:size-9"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToday}
            className="rounded-full h-11 md:h-9 px-3.5 text-xs font-medium"
          >
            Hari Ini
          </Button>

          <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={isCustomRange ? "secondary" : "outline"}
                size="sm"
                className="rounded-full h-11 md:h-9 px-3.5 text-xs font-mono"
              >
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  className="size-3.5 mr-1.5"
                  aria-hidden="true"
                />
                <span>
                  {activeWindowDays} hari (Maks. {MAX_CALENDAR_RANGE_DAYS})
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-80 max-w-[calc(100vw-2rem)] rounded-2xl p-4"
            >
              <form noValidate onSubmit={handleRangeSubmit} className="space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    Atur Jendela Tanggal Kustom
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Rentang maksimal {MAX_CALENDAR_RANGE_DAYS} hari sesuai batas performa server.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="cal-range-from" className="text-[11px] font-semibold">
                      Dari (WIB)
                    </Label>
                    <Input
                      id="cal-range-from"
                      type="date"
                      value={draftFrom}
                      onChange={(e) => {
                        setDraftFrom(e.target.value);
                        setRangeError(null);
                      }}
                      className="h-9 text-xs font-mono rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cal-range-to" className="text-[11px] font-semibold">
                      Sampai (WIB)
                    </Label>
                    <Input
                      id="cal-range-to"
                      type="date"
                      value={draftTo}
                      onChange={(e) => {
                        setDraftTo(e.target.value);
                        setRangeError(null);
                      }}
                      className="h-9 text-xs font-mono rounded-xl"
                    />
                  </div>
                </div>

                {rangeError && (
                  <p
                    role="alert"
                    className="text-[11px] text-status-danger-text flex items-start gap-1.5"
                  >
                    <HugeiconsIcon
                      icon={AlertCircleIcon}
                      className="size-3.5 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{rangeError}</span>
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setRangeOpen(false)}
                    className="rounded-full h-8 px-3 text-xs"
                  >
                    Batal
                  </Button>
                  <Button type="submit" size="xs" className="rounded-full h-8 px-3 text-xs">
                    Terapkan Rentang
                  </Button>
                </div>
              </form>
            </PopoverContent>
          </Popover>
        </div>

        {/* Pengalih Mode Tampilan & Filter Proyek */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="hidden md:inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/40 p-0.5"
            role="group"
            aria-label="Mode tampilan kalender"
          >
            <button
              type="button"
              onClick={() => onChangeViewMode("grid")}
              aria-pressed={viewMode === "grid"}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Kalender
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode("list")}
              aria-pressed={viewMode === "list"}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                viewMode === "list"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Daftar Agenda
            </button>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full h-11 md:h-9 px-3.5 text-xs font-medium"
              >
                <HugeiconsIcon icon={FilterIcon} className="size-3.5 mr-1.5" aria-hidden="true" />
                <span>Filter Proyek</span>
                {activeFilterCount > 0 ? (
                  <Badge variant="secondary" className="ml-1.5 text-[10px] rounded-full px-1.5">
                    {selectedProjectIds.length > 0
                      ? `${selectedProjectIds.length} dipilih`
                      : "Kustom"}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="ml-1.5 text-[10px] rounded-full px-1.5">
                    Aktif + Internal
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-80 max-w-[calc(100vw-2rem)] rounded-2xl p-4 space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Status Proyek</span>
                  <button
                    type="button"
                    onClick={() => {
                      onChangeProjectStatuses(["active"]);
                      onChangeProjectIds([]);
                      onChangeIncludeCancelled(false);
                    }}
                    className="text-[11px] font-medium text-accent-foreground hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Reset Default
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {ALL_PROJECT_STATUSES.map((status) => {
                    const checked = selectedProjectStatuses.includes(status);
                    return (
                      <label
                        key={status}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border/70 text-xs cursor-pointer hover:bg-muted/40"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleProjectStatus(status)}
                        />
                        <span>{PROJECT_STATUS_LABELS[status]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 border-t border-border/70 pt-2.5">
                <Label htmlFor="cal-project-search" className="text-xs font-bold text-foreground">
                  Pilih Proyek Spesifik / Internal
                </Label>
                <Input
                  id="cal-project-search"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Cari nama proyek atau klien..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="h-9 text-xs rounded-xl bg-background"
                />

                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 text-xs cursor-pointer">
                    <Checkbox
                      checked={selectedProjectIds.includes(INTERNAL_PROJECT_SENTINEL)}
                      onCheckedChange={() => toggleProjectId(INTERNAL_PROJECT_SENTINEL)}
                    />
                    <span className="font-semibold text-foreground">
                      Internal Agensi (Tanpa Proyek)
                    </span>
                  </label>

                  {filteredProjects.map((project) => (
                    <label
                      key={project.id}
                      className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/50 text-xs cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedProjectIds.includes(project.id)}
                        onCheckedChange={() => toggleProjectId(project.id)}
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-foreground block truncate">
                          {project.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground block truncate">
                          {project.clientName} · {PROJECT_STATUS_LABELS[project.status]}
                        </span>
                      </div>
                    </label>
                  ))}

                  {filteredProjects.length === 0 && (
                    <p className="text-[11px] text-muted-foreground py-2 text-center">
                      Tidak ada proyek cocok dengan filter status/pencarian.
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-border/70 pt-2.5">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox
                    checked={includeCancelled}
                    onCheckedChange={(val) => onChangeIncludeCancelled(Boolean(val))}
                  />
                  <span>Tampilkan agenda berstatus dibatalkan</span>
                </label>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Baris 2: Filter Tipe Acara */}
      <div
        role="group"
        aria-label="Filter sumber acara kalender"
        className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/70"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mr-1">
          Sumber Acara:
        </span>
        <button
          type="button"
          onClick={onResetTypes}
          aria-pressed={selectedTypes.length === ALL_SOURCE_TYPES.length}
          className={`min-h-11 md:min-h-8 px-3 py-1 rounded-full text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            selectedTypes.length === ALL_SOURCE_TYPES.length
              ? "bg-primary text-primary-foreground border-primary font-semibold"
              : "bg-background text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          Semua Tipe
        </button>

        {ALL_SOURCE_TYPES.map((type) => {
          const active = selectedTypes.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => onToggleType(type)}
              aria-pressed={active}
              className={`min-h-11 md:min-h-8 px-3 py-1 rounded-full text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                active
                  ? "bg-secondary text-secondary-foreground border-secondary font-semibold"
                  : "bg-background text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {SOURCE_TYPE_LABELS[type]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
