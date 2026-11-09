import {
  addDaysDateOnly,
  extractWibDateOnly,
  formatDateTimeWibDisplay,
  formatDateWibDisplay,
  formatTimeWibDisplay,
  isValidDateOnly,
} from "@/shared/lib/business-date";
import {
  CalendarEvent,
  CalendarProjectStatus,
  CalendarSourceType,
  OperationalEventType,
} from "../types/operations.types";

export const SOURCE_TYPE_LABELS: Record<CalendarSourceType, string> = {
  sprint: "Sprint",
  payment_term: "Termin Ready",
  invoice: "Invoice Jatuh Tempo",
  operational_event: "Agenda Internal / Proyek",
};

export const OPERATIONAL_EVENT_TYPE_LABELS: Record<OperationalEventType, string> = {
  client_demo: "Demo Klien",
  deployment: "Deployment",
  maintenance: "Maintenance",
  meeting: "Meeting",
};

export const PROJECT_STATUS_LABELS: Record<CalendarProjectStatus, string> = {
  active: "Aktif",
  lead: "Lead",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const WEEKDAY_LABELS_MON_FIRST = [
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
  "Min",
] as const;

export interface EventVisualMeta {
  chipClass: string;
  dotClass: string;
  badgeVariantLabel: string;
}

/**
 * Menentukan styling & label non-warna (WCAG 1.4.1) untuk setiap jenis acara kalender.
 */
export function getCalendarEventVisual(event: CalendarEvent): EventVisualMeta {
  if (event.status === "cancelled") {
    return {
      chipClass:
        "bg-muted/70 text-muted-foreground border-border/80 line-through opacity-80",
      dotClass: "bg-muted-foreground",
      badgeVariantLabel: "Dibatalkan",
    };
  }

  if (event.sourceType === "invoice") {
    if (event.overdue) {
      return {
        chipClass:
          "bg-destructive/15 text-destructive border-destructive/40 font-semibold",
        dotClass: "bg-destructive",
        badgeVariantLabel: "Invoice Overdue",
      };
    }
    if (event.status === "paid") {
      return {
        chipClass:
          "bg-emerald-500/12 text-emerald-800 dark:text-emerald-200 border-emerald-500/30",
        dotClass: "bg-emerald-500",
        badgeVariantLabel: "Invoice Lunas",
      };
    }
    return {
      chipClass:
        "bg-zinc-900/8 text-foreground dark:bg-zinc-100/10 border-border",
      dotClass: "bg-foreground",
      badgeVariantLabel: "Invoice Jatuh Tempo",
    };
  }

  if (event.sourceType === "payment_term") {
    return {
      chipClass:
        "bg-blue-500/12 text-blue-800 dark:text-blue-200 border-blue-500/30",
      dotClass: "bg-blue-500",
      badgeVariantLabel: "Termin Ready",
    };
  }

  if (event.sourceType === "sprint") {
    return {
      chipClass:
        "bg-secondary/15 text-foreground dark:bg-secondary/40 border-border",
      dotClass:
        event.status === "active"
          ? "bg-emerald-500"
          : event.status === "completed"
          ? "bg-muted-foreground"
          : "bg-amber-500",
      badgeVariantLabel: `Sprint (${event.status})`,
    };
  }

  const eventType = event.metadata?.eventType ?? "meeting";
  switch (eventType) {
    case "client_demo":
      return {
        chipClass:
          "bg-orange-500/12 text-orange-800 dark:text-orange-200 border-orange-500/30",
        dotClass: "bg-orange-500",
        badgeVariantLabel: OPERATIONAL_EVENT_TYPE_LABELS.client_demo,
      };
    case "deployment":
      return {
        chipClass:
          "bg-purple-500/12 text-purple-800 dark:text-purple-200 border-purple-500/30",
        dotClass: "bg-purple-500",
        badgeVariantLabel: OPERATIONAL_EVENT_TYPE_LABELS.deployment,
      };
    case "maintenance":
      return {
        chipClass:
          "bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/35",
        dotClass: "bg-amber-500",
        badgeVariantLabel: OPERATIONAL_EVENT_TYPE_LABELS.maintenance,
      };
    case "meeting":
    default:
      return {
        chipClass:
          "bg-blue-500/10 text-blue-800 dark:text-blue-200 border-blue-500/25",
        dotClass: "bg-blue-500",
        badgeVariantLabel: OPERATIONAL_EVENT_TYPE_LABELS.meeting,
      };
  }
}

/**
 * Mengekstrak rentang tanggal awal dan akhir WIB (`YYYY-MM-DD`) suatu acara kalender serta penanda multi-hari.
 *
 * @param event - Item acara kalender dari feed teragregasi.
 */
export function getEventWibDateSpan(event: CalendarEvent): {
  startDate: string;
  endDate: string;
  isMultiDay: boolean;
} {
  const startDate = extractWibDateOnly(event.startAt);
  const endDateRaw = event.endAt ? extractWibDateOnly(event.endAt) : startDate;
  const endDate = endDateRaw && endDateRaw >= startDate ? endDateRaw : startDate;
  return {
    startDate,
    endDate,
    isMultiDay: Boolean(startDate && endDate && endDate > startDate),
  };
}

/**
 * Memformat jadwal acara kalender (sepanjang hari maupun jam terjadwal WIB) untuk ditampilkan pada UI drawer/daftar.
 */
export function formatEventWibSchedule(event: CalendarEvent): string {
  const span = getEventWibDateSpan(event);
  if (event.allDay) {
    if (span.isMultiDay) {
      return `${formatDateWibDisplay(span.startDate)} – ${formatDateWibDisplay(span.endDate)} · Sepanjang Hari (WIB)`;
    }
    return `${formatDateWibDisplay(span.startDate)} · Sepanjang Hari (WIB)`;
  }

  const startFormatted = formatDateTimeWibDisplay(event.startAt);
  if (!event.endAt) return startFormatted;

  const endDateOnly = extractWibDateOnly(event.endAt);
  if (endDateOnly === span.startDate) {
    const endTime = formatTimeWibDisplay(event.endAt);
    return endTime ? `${startFormatted} – ${endTime}` : startFormatted;
  }
  return `${startFormatted} – ${formatDateTimeWibDisplay(event.endAt)}`;
}

/** Menghasilkan label singkat non-warna untuk badge sel tanggal kalender (overdue, dibatalkan, multi-hari, atau jam WIB). */
export function getEventDayBadgeLabel(event: CalendarEvent, cellDate: string): string {
  const span = getEventWibDateSpan(event);
  if (event.overdue) return "[Terlambat / Overdue]";
  if (event.status === "cancelled") return "[Dibatalkan]";
  if (span.isMultiDay) {
    if (cellDate === span.startDate) return "Mulai";
    if (cellDate === span.endDate) return "Selesai";
    return "Lanjutan";
  }
  if (event.allDay) {
    return event.sourceType === "operational_event" ? "All Day" : "";
  }
  return formatTimeWibDisplay(event.startAt).replace(" WIB", "");
}

export interface MonthCell {
  dateOnly: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  inRequestedRange: boolean;
}

export interface MonthMatrix {
  year: number;
  month: number; // 1..12
  key: string; // YYYY-MM
  cells: MonthCell[]; // kelipatan 7 (Senin -> Minggu)
}

/**
 * Membangun daftar matriks bulan kalender (Senin-pertama) untuk seluruh bulan yang tercakup oleh [from, to].
 */
export function buildMonthMatricesForRange(
  fromDateOnly: string,
  toDateOnly: string
): MonthMatrix[] {
  if (
    !isValidDateOnly(fromDateOnly) ||
    !isValidDateOnly(toDateOnly) ||
    fromDateOnly > toDateOnly
  ) {
    return [];
  }

  const [startY, startM] = fromDateOnly.split("-").map(Number);
  const [endY, endM] = toDateOnly.split("-").map(Number);

  const matrices: MonthMatrix[] = [];
  let cursorYear = startY;
  let cursorMonth = startM;

  while (cursorYear < endY || (cursorYear === endY && cursorMonth <= endM)) {
    const firstOfMonth = `${String(cursorYear).padStart(4, "0")}-${String(
      cursorMonth
    ).padStart(2, "0")}-01`;
    const lastDayNum = new Date(Date.UTC(cursorYear, cursorMonth, 0)).getUTCDate();
    const lastOfMonth = `${String(cursorYear).padStart(4, "0")}-${String(
      cursorMonth
    ).padStart(2, "0")}-${String(lastDayNum).padStart(2, "0")}`;

    // Konversi getUTCDay() (0=Min..6=Sab) -> Monday-first offset (0=Sen..6=Min)
    const firstUtcDay = new Date(Date.UTC(cursorYear, cursorMonth - 1, 1)).getUTCDay();
    const leadingPadding = (firstUtcDay + 6) % 7;

    const lastUtcDay = new Date(
      Date.UTC(cursorYear, cursorMonth - 1, lastDayNum)
    ).getUTCDay();
    const trailingPadding = (7 - ((lastUtcDay + 6) % 7 + 1)) % 7;

    const gridStart = addDaysDateOnly(firstOfMonth, -leadingPadding);
    const totalCells = leadingPadding + lastDayNum + trailingPadding;
    const cells: MonthCell[] = [];

    for (let i = 0; i < totalCells; i += 1) {
      const dateOnly = addDaysDateOnly(gridStart, i);
      const dayNumber = Number(dateOnly.slice(8, 10));
      const inCurrentMonth = dateOnly >= firstOfMonth && dateOnly <= lastOfMonth;
      const inRequestedRange = dateOnly >= fromDateOnly && dateOnly <= toDateOnly;
      cells.push({
        dateOnly,
        dayNumber,
        inCurrentMonth,
        inRequestedRange,
      });
    }

    matrices.push({
      year: cursorYear,
      month: cursorMonth,
      key: `${cursorYear}-${String(cursorMonth).padStart(2, "0")}`,
      cells,
    });

    cursorMonth += 1;
    if (cursorMonth > 12) {
      cursorMonth = 1;
      cursorYear += 1;
    }
  }

  return matrices;
}

/**
 * Mengelompokkan array acara kalender ke setiap tanggal YYYY-MM-DD yang tumpang-tindih di rentang [from, to].
 */
export function groupEventsByDayWib(
  events: CalendarEvent[],
  fromDateOnly: string,
  toDateOnly: string
): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const span = getEventWibDateSpan(event);
    if (!span.startDate) continue;

    const clippedStart =
      span.startDate < fromDateOnly ? fromDateOnly : span.startDate;
    const clippedEnd = span.endDate > toDateOnly ? toDateOnly : span.endDate;
    if (clippedStart > clippedEnd) continue;

    let cursor = clippedStart;
    while (cursor <= clippedEnd) {
      const list = map.get(cursor);
      if (list) {
        list.push(event);
      } else {
        map.set(cursor, [event]);
      }
      cursor = addDaysDateOnly(cursor, 1);
    }
  }

  return map;
}
