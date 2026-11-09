"use client";

import React, { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Building02Icon, Calendar03Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/shared/components";
import {
  formatDateWibDisplay,
  formatMonthYearWib,
  getBusinessDateWib,
} from "@/shared/lib/business-date";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "../types/operations.types";
import {
  buildMonthMatricesForRange,
  formatEventWibSchedule,
  getCalendarEventVisual,
  getEventDayBadgeLabel,
  groupEventsByDayWib,
  WEEKDAY_LABELS_MON_FIRST,
} from "../utils/calendar.helpers";
import { CalendarViewMode } from "./CalendarHeaderControls";

interface CalendarMonthGridProps {
  from: string;
  to: string;
  events: CalendarEvent[];
  viewMode: CalendarViewMode;
  canManageEvents: boolean;
  onSelectEvent: (event: CalendarEvent) => void;
  onCreateEventForDate?: (dateOnly: string) => void;
}

const MAX_PILLS_PER_CELL = 4;

export function CalendarMonthGrid({
  from,
  to,
  events,
  viewMode,
  canManageEvents,
  onSelectEvent,
  onCreateEventForDate,
}: CalendarMonthGridProps) {
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const todayWib = getBusinessDateWib();

  const monthMatrices = useMemo(
    () => buildMonthMatricesForRange(from, to),
    [from, to]
  );

  const eventsByDay = useMemo(
    () => groupEventsByDayWib(events, from, to),
    [events, from, to]
  );

  const orderedListDays = useMemo(() => {
    return Array.from(eventsByDay.entries()).sort(([dayA], [dayB]) =>
      dayA.localeCompare(dayB)
    );
  }, [eventsByDay]);

  const toggleDayExpand = (dateOnly: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dateOnly]: !prev[dateOnly],
    }));
  };

  if (events.length === 0 && viewMode === "list") {
    return (
      <EmptyState
        icon={
          <div className="size-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
            <HugeiconsIcon icon={Calendar03Icon} className="size-7" aria-hidden="true" />
          </div>
        }
        title="Tidak Ada Jadwal pada Rentang Ini"
        description={`Tidak ada Sprint, Termin Ready, Invoice Jatuh Tempo, atau Agenda Manual pada ${formatDateWibDisplay(from)} – ${formatDateWibDisplay(to)}.`}
        action={
          canManageEvents && onCreateEventForDate ? (
            <Button
              type="button"
              size="sm"
              className="rounded-full text-xs h-9 px-4 font-semibold"
              onClick={() => onCreateEventForDate(todayWib >= from && todayWib <= to ? todayWib : from)}
            >
              + Buat Agenda Manual
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      {events.length === 0 && viewMode === "grid" && (
        <div
          role="status"
          className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2"
        >
          <span>
            Belum ada acara kalender yang cocok dengan filter pada{" "}
            <strong className="text-foreground">
              {formatDateWibDisplay(from)} – {formatDateWibDisplay(to)}
            </strong>
            .
          </span>
          {canManageEvents && onCreateEventForDate && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="rounded-full h-8 px-3 text-xs"
              onClick={() =>
                onCreateEventForDate(todayWib >= from && todayWib <= to ? todayWib : from)
              }
            >
              + Tambah Agenda di Rentang Ini
            </Button>
          )}
        </div>
      )}

      {/* Tampilan Desktop Grid (md+ dan viewMode === "grid") */}
      {viewMode === "grid" && (
        <div className="hidden md:block space-y-6">
          {monthMatrices.map((matrix) => (
            <Card
              key={matrix.key}
              className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs"
            >
              {monthMatrices.length > 1 && (
                <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground">
                    {formatMonthYearWib(matrix.year, matrix.month)}
                  </h2>
                  <span className="text-[11px] font-mono text-muted-foreground">WIB</span>
                </div>
              )}

              {/* Header Hari (Senin - Minggu) */}
              <div
                className="grid grid-cols-7 border-b border-border bg-muted/40"
                role="row"
              >
                {WEEKDAY_LABELS_MON_FIRST.map((dayLabel) => (
                  <div
                    key={dayLabel}
                    className="py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-r last:border-r-0 border-border/60"
                  >
                    {dayLabel}
                  </div>
                ))}
              </div>

              {/* Matriks Sel Tanggal */}
              <div className="grid grid-cols-7 divide-x divide-y divide-border/70">
                {matrix.cells.map((cell) => {
                  const isToday = cell.dateOnly === todayWib;
                  const dayEvents = cell.inRequestedRange
                    ? eventsByDay.get(cell.dateOnly) ?? []
                    : [];
                  const isExpanded = Boolean(expandedDays[cell.dateOnly]);
                  const visibleEvents = isExpanded
                    ? dayEvents
                    : dayEvents.slice(0, MAX_PILLS_PER_CELL);
                  const hiddenCount = dayEvents.length - visibleEvents.length;

                  return (
                    <div
                      key={cell.dateOnly}
                      className={cn(
                        "min-h-[132px] p-2 flex flex-col gap-1.5 transition-colors",
                        !cell.inCurrentMonth || !cell.inRequestedRange
                          ? "bg-muted/25 text-muted-foreground/60"
                          : isToday
                          ? "bg-primary/5"
                          : "bg-card"
                      )}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center text-xs font-mono leading-none",
                            isToday
                              ? "size-6 rounded-full bg-primary text-primary-foreground font-bold"
                              : cell.inCurrentMonth && cell.inRequestedRange
                              ? "font-semibold text-foreground"
                              : "text-muted-foreground/70"
                          )}
                        >
                          {cell.dayNumber}
                        </span>

                        <div className="flex items-center gap-1">
                          {isToday && (
                            <span className="text-[10px] font-semibold text-foreground/80">
                              Hari Ini
                            </span>
                          )}
                          {canManageEvents &&
                            cell.inRequestedRange &&
                            onCreateEventForDate && (
                              <button
                                type="button"
                                onClick={() => onCreateEventForDate(cell.dateOnly)}
                                aria-label={`Tambah agenda pada ${formatDateWibDisplay(cell.dateOnly)}`}
                                title="Tambah agenda pada tanggal ini"
                                className="size-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center text-xs font-semibold transition-colors"
                              >
                                +
                              </button>
                            )}
                        </div>
                      </div>

                      <div className="space-y-1 flex-1">
                        {visibleEvents.map((ev) => {
                          const visual = getCalendarEventVisual(ev);
                          const tagLabel = getEventDayBadgeLabel(ev, cell.dateOnly);
                          return (
                            <button
                              key={`${cell.dateOnly}-${ev.id}`}
                              type="button"
                              onClick={() => onSelectEvent(ev)}
                              title={`${ev.title} — ${formatEventWibSchedule(ev)}`}
                              aria-label={`${visual.badgeVariantLabel}: ${ev.title}. ${formatEventWibSchedule(ev)}`}
                              className={cn(
                                "w-full text-left rounded-lg border px-2 py-1 text-[11px] leading-snug transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                visual.chipClass
                              )}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className={cn("size-1.5 rounded-full shrink-0", visual.dotClass)}
                                  aria-hidden="true"
                                />
                                <span className="truncate font-medium flex-1">
                                  {ev.title}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-1 mt-0.5 text-[10px] opacity-85">
                                <span className="truncate">
                                  {ev.project ? ev.project.name : "Internal Agensi"}
                                </span>
                                {tagLabel && (
                                  <span className="font-mono shrink-0">{tagLabel}</span>
                                )}
                              </div>
                            </button>
                          );
                        })}

                        {hiddenCount > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleDayExpand(cell.dateOnly)}
                            aria-expanded={false}
                            className="w-full text-left px-2 py-1 text-[11px] font-semibold text-foreground/80 hover:text-foreground hover:bg-muted/60 rounded-md"
                          >
                            +{hiddenCount} acara lainnya
                          </button>
                        )}
                        {isExpanded && dayEvents.length > MAX_PILLS_PER_CELL && (
                          <button
                            type="button"
                            onClick={() => toggleDayExpand(cell.dateOnly)}
                            aria-expanded={true}
                            className="w-full text-left px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground rounded-md"
                          >
                            Tampilkan ringkas
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tampilan Mobile Stack (< md) ATAU Desktop Mode Daftar */}
      <div className={cn(viewMode === "list" ? "block" : "block md:hidden", "space-y-3")}>
        {orderedListDays.length === 0 ? (
          <EmptyState
            compact
            icon={
              <div className="size-11 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
                <HugeiconsIcon icon={Calendar03Icon} className="size-5.5" aria-hidden="true" />
              </div>
            }
            title="Tidak Ada Agenda di Rentang Ini"
            description={`${formatDateWibDisplay(from)} – ${formatDateWibDisplay(to)} belum memiliki item yang sesuai filter.`}
          />
        ) : (
          orderedListDays.map(([dateOnly, dayEvents]) => {
            const isToday = dateOnly === todayWib;
            return (
              <Card
                key={dateOnly}
                className={cn(
                  "rounded-2xl border p-3.5 md:p-4 space-y-2.5 shadow-2xs",
                  isToday ? "border-primary/45 bg-primary/4" : "border-border bg-card"
                )}
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs md:text-sm font-bold text-foreground">
                      {formatDateWibDisplay(dateOnly, { longMonth: true })}
                    </span>
                    {isToday && (
                      <Badge className="rounded-full text-[10px] font-bold">
                        Hari Ini
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {dayEvents.length} agenda
                  </span>
                </div>

                <div className="space-y-2">
                  {dayEvents.map((ev) => {
                    const visual = getCalendarEventVisual(ev);
                    const tagLabel = getEventDayBadgeLabel(ev, dateOnly);
                    return (
                      <button
                        key={`${dateOnly}-list-${ev.id}`}
                        type="button"
                        onClick={() => onSelectEvent(ev)}
                        className={cn(
                          "w-full text-left rounded-xl border p-3 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          visual.chipClass
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn("size-2 rounded-full shrink-0", visual.dotClass)}
                              aria-hidden="true"
                            />
                            <span className="text-[11px] font-bold uppercase tracking-wide">
                              {visual.badgeVariantLabel}
                            </span>
                          </div>
                          {tagLabel && (
                            <span className="text-[11px] font-mono font-semibold">
                              {tagLabel}
                            </span>
                          )}
                        </div>

                        <p className="text-xs md:text-sm font-semibold mt-1 break-words">
                          {ev.title}
                        </p>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] opacity-90">
                          <span className="inline-flex items-center gap-1">
                            <HugeiconsIcon
                              icon={Building02Icon}
                              className="size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            <span>
                              {ev.project ? ev.project.name : "Internal Agensi (Tanpa Proyek)"}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1 font-mono">
                            <HugeiconsIcon
                              icon={Clock01Icon}
                              className="size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            <span>{formatEventWibSchedule(ev)}</span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
