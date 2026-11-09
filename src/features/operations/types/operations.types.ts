export const INTERNAL_PROJECT_SENTINEL = "__internal__";
export const MAX_CALENDAR_RANGE_DAYS = 90;

export type CalendarSourceType =
  | "sprint"
  | "payment_term"
  | "invoice"
  | "operational_event";

export type OperationalEventType =
  | "client_demo"
  | "deployment"
  | "maintenance"
  | "meeting";

export type OperationalEventStatus = "scheduled" | "cancelled";

export type CalendarProjectStatus = "lead" | "active" | "completed" | "cancelled";

export interface CalendarEventMetadata {
  eventType?: OperationalEventType;
  description?: string | null;
  termNumber?: number;
  amount?: number;
  invoiceNumber?: string | null;
  invoiceDueDate?: string | null;
  paidAt?: string | null;
  reminderCount?: number;
  lastRemindedAt?: string | null;
  reminderNote?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
}

export interface CalendarEvent {
  id: string;
  sourceType: CalendarSourceType;
  sourceId: string;
  title: string;
  startAt: string;
  endAt?: string | null;
  allDay: boolean;
  project?: { id: string; name: string; status?: string } | null;
  status: string;
  overdue?: boolean;
  href: string;
  metadata?: CalendarEventMetadata;
}

export interface CalendarQueryFilters {
  from: string;
  to: string;
  types?: CalendarSourceType[];
  projectIds?: string[];
  projectStatuses?: CalendarProjectStatus[];
  includeCancelled?: boolean;
}

export interface CalendarFeedResponse {
  range: {
    from: string;
    to: string;
    timezone: "Asia/Jakarta";
  };
  events: CalendarEvent[];
  overdueCarryover: CalendarEvent[];
}

export interface OperationalEventRecord {
  id: string;
  title: string;
  eventType: OperationalEventType;
  description: string | null;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  allDayStartDate: string | null;
  allDayEndDate: string | null;
  projectId: string | null;
  status: OperationalEventStatus;
  reminderCount?: number;
  lastRemindedAt?: string | null;
  reminderNote?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  project?: { id: string; name: string; status: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOperationalEventInput {
  title: string;
  eventType: OperationalEventType;
  description?: string | null;
  projectId?: string | null;
  allDay: boolean;
  allDayStartDate?: string;
  allDayEndDate?: string | null;
  startAt?: string;
  endAt?: string | null;
}

export interface UpdateOperationalEventInput {
  title?: string;
  eventType?: OperationalEventType;
  description?: string | null;
  projectId?: string | null;
  allDay?: boolean;
  allDayStartDate?: string;
  allDayEndDate?: string | null;
  startAt?: string;
  endAt?: string | null;
}

export interface CancelOperationalEventInput {
  cancelReason?: string;
}

export interface RecordReminderInput {
  note?: string;
}
