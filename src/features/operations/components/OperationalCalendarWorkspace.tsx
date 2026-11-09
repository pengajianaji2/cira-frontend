"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CardSkeleton, LocalizedComponentError } from "@/shared/components";
import {
  getCurrentYearMonthWib,
  getMonthBoundsWib,
} from "@/shared/lib/business-date";
import { useMyPermissionsQuery } from "@/features/auth";
import { useProjectsQuery } from "@/features/projects";
import {
  CalendarEvent,
  CalendarProjectStatus,
  CalendarSourceType,
} from "../types/operations.types";
import { useOperationalCalendarQuery } from "../queries/operations.queries";
import { CalendarAccessDenied } from "./CalendarAccessDenied";
import {
  CalendarHeaderControls,
  CalendarViewMode,
} from "./CalendarHeaderControls";
import { OverdueAlertStrip } from "./OverdueAlertStrip";
import { CalendarMonthGrid } from "./CalendarMonthGrid";
import { CalendarEventDrawer } from "./CalendarEventDrawer";
import { OperationalEventModal } from "./OperationalEventModal";
import { CancelAgendaDialog } from "./CancelAgendaDialog";

const DEFAULT_TYPES: CalendarSourceType[] = [
  "sprint",
  "payment_term",
  "invoice",
  "operational_event",
];

/**
 * Ruang kerja utama Kalender Operasional (`/operations/calendar`): mengatur filter rentang WIB <= 90 hari,
 * tampilan grid bulanan vs daftar kronologis, strip alert invoice overdue, drawer detail, serta modal agenda manual.
 */
export function OperationalCalendarWorkspace() {
  const searchParams = useSearchParams();
  const deepLinkedEventId = searchParams.get("eventId");

  const { data: permissions = [], isLoading: isPermissionsLoading } =
    useMyPermissionsQuery();

  const canReadCalendar = permissions.includes("operations.calendar.read");
  const canManageEvents = permissions.includes("operations.events.manage");

  const initialYearMonth = useMemo(() => getCurrentYearMonthWib(), []);
  const initialBounds = useMemo(
    () => getMonthBoundsWib(initialYearMonth.year, initialYearMonth.month),
    [initialYearMonth]
  );

  const [anchorYear, setAnchorYear] = useState(initialYearMonth.year);
  const [anchorMonth, setAnchorMonth] = useState(initialYearMonth.month);
  const [from, setFrom] = useState(initialBounds.from);
  const [to, setTo] = useState(initialBounds.to);
  const [isCustomRange, setIsCustomRange] = useState(false);

  const [selectedTypes, setSelectedTypes] =
    useState<CalendarSourceType[]>(DEFAULT_TYPES);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectedProjectStatuses, setSelectedProjectStatuses] = useState<
    CalendarProjectStatus[]
  >(["active"]);
  const [includeCancelled, setIncludeCancelled] = useState(false);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("grid");

  // Drawer & Modal states (simpan ID agar sinkron otomatis saat React Query refetch)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [handledDeepLinkId, setHandledDeepLinkId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(
    undefined
  );

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellingEvent, setCancellingEvent] = useState<CalendarEvent | null>(
    null
  );

  const calendarFilters = useMemo(
    () => ({
      from,
      to,
      types: selectedTypes,
      projectIds:
        selectedProjectIds.length > 0 ? selectedProjectIds : undefined,
      projectStatuses: selectedProjectStatuses,
      includeCancelled,
    }),
    [
      from,
      to,
      selectedTypes,
      selectedProjectIds,
      selectedProjectStatuses,
      includeCancelled,
    ]
  );

  const calendarQuery = useOperationalCalendarQuery(calendarFilters, {
    enabled: canReadCalendar,
  });

  // Ambil daftar proyek untuk multi-select filter & selector modal (hanya jika berizin)
  const projectsQuery = useProjectsQuery();
  const projects = canReadCalendar ? projectsQuery.data ?? [] : [];

  const allEvents = useMemo(
    () => calendarQuery.data?.events ?? [],
    [calendarQuery.data?.events]
  );
  const overdueCarryover = useMemo(
    () => calendarQuery.data?.overdueCarryover ?? [],
    [calendarQuery.data?.overdueCarryover]
  );

  // Sinkronkan event terpilih dengan feed terbaru (termasuk overdueCarryover)
  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return (
      allEvents.find((ev) => ev.id === selectedEventId) ??
      overdueCarryover.find((ev) => ev.id === selectedEventId) ??
      null
    );
  }, [selectedEventId, allEvents, overdueCarryover]);

  // Buka drawer otomatis bila ada query param ?eventId=<id>
  useEffect(() => {
    if (!deepLinkedEventId || handledDeepLinkId === deepLinkedEventId) return;
    if (allEvents.length === 0) return;
    const match = allEvents.find(
      (ev) => ev.sourceId === deepLinkedEventId || ev.id === deepLinkedEventId
    );
    if (match) {
      setSelectedEventId(match.id);
      setDrawerOpen(true);
      setHandledDeepLinkId(deepLinkedEventId);
    }
  }, [deepLinkedEventId, handledDeepLinkId, allEvents]);

  const handleShiftMonth = (delta: number) => {
    let nextMonth = anchorMonth + delta;
    let nextYear = anchorYear;
    while (nextMonth < 1) {
      nextMonth += 12;
      nextYear -= 1;
    }
    while (nextMonth > 12) {
      nextMonth -= 12;
      nextYear += 1;
    }
    const bounds = getMonthBoundsWib(nextYear, nextMonth);
    setAnchorYear(nextYear);
    setAnchorMonth(nextMonth);
    setFrom(bounds.from);
    setTo(bounds.to);
    setIsCustomRange(false);
  };

  const handleToday = () => {
    const current = getCurrentYearMonthWib();
    const bounds = getMonthBoundsWib(current.year, current.month);
    setAnchorYear(current.year);
    setAnchorMonth(current.month);
    setFrom(bounds.from);
    setTo(bounds.to);
    setIsCustomRange(false);
  };

  const handleApplyCustomRange = (nextFrom: string, nextTo: string) => {
    const [yStr, mStr] = nextFrom.split("-");
    setAnchorYear(Number(yStr));
    setAnchorMonth(Number(mStr));
    setFrom(nextFrom);
    setTo(nextTo);
    setIsCustomRange(true);
  };

  const handleToggleType = (type: CalendarSourceType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev; // Pertahankan minimal 1 tipe acara
        return prev.filter((item) => item !== type);
      }
      return [...prev, type];
    });
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEventId(event.id);
    setDrawerOpen(true);
  };

  const handleOpenCreateModal = (dateOnly?: string) => {
    setEditingEvent(null);
    setModalDefaultDate(dateOnly);
    setModalOpen(true);
  };

  const handleRequestEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setModalDefaultDate(undefined);
    setModalOpen(true);
  };

  const handleRequestCancel = (event: CalendarEvent) => {
    setCancellingEvent(event);
    setCancelDialogOpen(true);
  };

  if (isPermissionsLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-5">
        <CardSkeleton lines={3} />
        <CardSkeleton lines={8} hasHeader={false} />
      </div>
    );
  }

  const queryError = calendarQuery.error as (Error & { status?: number }) | null;
  if (!canReadCalendar || queryError?.status === 403) {
    return (
      <div className="max-w-7xl mx-auto">
        <CalendarAccessDenied />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <CalendarHeaderControls
        from={from}
        to={to}
        isCustomRange={isCustomRange}
        anchorYear={anchorYear}
        anchorMonth={anchorMonth}
        selectedTypes={selectedTypes}
        selectedProjectIds={selectedProjectIds}
        selectedProjectStatuses={selectedProjectStatuses}
        includeCancelled={includeCancelled}
        viewMode={viewMode}
        canManageEvents={canManageEvents}
        projects={projects}
        onPrevMonth={() => handleShiftMonth(-1)}
        onNextMonth={() => handleShiftMonth(1)}
        onToday={handleToday}
        onApplyCustomRange={handleApplyCustomRange}
        onToggleType={handleToggleType}
        onResetTypes={() => setSelectedTypes(DEFAULT_TYPES)}
        onChangeProjectIds={setSelectedProjectIds}
        onChangeProjectStatuses={setSelectedProjectStatuses}
        onChangeIncludeCancelled={setIncludeCancelled}
        onChangeViewMode={setViewMode}
        onOpenCreateModal={() => handleOpenCreateModal(undefined)}
      />

      {calendarQuery.isLoading ? (
        <div className="space-y-4">
          <CardSkeleton lines={2} />
          <CardSkeleton lines={10} />
        </div>
      ) : calendarQuery.isError ? (
        <LocalizedComponentError
          title="Gagal Memuat Kalender Operasional"
          message={
            queryError?.message ||
            "Terjadi gangguan saat mengambil agregasi kalender."
          }
          onRetry={() => void calendarQuery.refetch()}
          isRetrying={calendarQuery.isFetching}
        />
      ) : (
        <>
          <OverdueAlertStrip
            overdueCarryover={overdueCarryover}
            inRangeEvents={allEvents}
            onSelectEvent={handleSelectEvent}
          />

          <CalendarMonthGrid
            from={from}
            to={to}
            events={allEvents}
            viewMode={viewMode}
            canManageEvents={canManageEvents}
            onSelectEvent={handleSelectEvent}
            onCreateEventForDate={(dateOnly) => handleOpenCreateModal(dateOnly)}
          />
        </>
      )}

      <CalendarEventDrawer
        event={selectedEvent}
        open={drawerOpen && Boolean(selectedEvent)}
        onOpenChange={setDrawerOpen}
        canManageEvents={canManageEvents}
        onRequestEdit={handleRequestEdit}
        onRequestCancel={handleRequestCancel}
      />

      <OperationalEventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editingEvent={editingEvent}
        defaultDateOnly={modalDefaultDate}
        projects={projects}
        onSaved={(savedId) => {
          setSelectedEventId(savedId);
        }}
      />

      <CancelAgendaDialog
        event={cancellingEvent}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onCancelled={() => {
          if (!includeCancelled) {
            setDrawerOpen(false);
          }
        }}
      />
    </div>
  );
}
