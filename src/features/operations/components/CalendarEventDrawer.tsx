"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  Building02Icon,
  Calendar02Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Edit02Icon,
  Link01Icon,
  Notification01Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  formatDateTimeWibDisplay,
  formatDateWibDisplay,
} from "@/shared/lib/business-date";
import { formatRupiah } from "@/features/finance";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "../types/operations.types";
import { useRecordReminderMutation } from "../queries/operations.queries";
import {
  formatEventWibSchedule,
  getCalendarEventVisual,
  SOURCE_TYPE_LABELS,
} from "../utils/calendar.helpers";

interface CalendarEventDrawerProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManageEvents: boolean;
  onRequestEdit: (event: CalendarEvent) => void;
  onRequestCancel: (event: CalendarEvent) => void;
}

export function CalendarEventDrawer({
  event,
  open,
  onOpenChange,
  canManageEvents,
  onRequestEdit,
  onRequestCancel,
}: CalendarEventDrawerProps) {
  const [reminderNote, setReminderNote] = useState("");
  const remindMutation = useRecordReminderMutation();

  useEffect(() => {
    if (open) {
      setReminderNote("");
    }
  }, [open, event?.id]);

  if (!event) return null;

  const visual = getCalendarEventVisual(event);
  const isManualEvent = event.sourceType === "operational_event";
  const isCancelled = event.status === "cancelled";

  const handleRecordReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManualEvent || isCancelled) return;
    remindMutation.mutate(
      {
        id: event.sourceId,
        input: reminderNote.trim() ? { note: reminderNote.trim() } : {},
      },
      {
        onSuccess: () => {
          setReminderNote("");
        },
      }
    );
  };

  const deepLinkLabel =
    event.sourceType === "sprint"
      ? "Buka Tab Sprint"
      : event.sourceType === "payment_term" || event.sourceType === "invoice"
      ? "Buka Tab Keuangan & Invoice"
      : "Buka Halaman Proyek";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full h-[100dvh] max-h-[100dvh] sm:max-w-lg overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-0 flex flex-col"
      >
        <SheetHeader className="p-4 sm:p-6 pb-4 border-b border-border space-y-3">
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <Badge
              variant="outline"
              className={cn("rounded-full text-[11px] font-semibold", visual.chipClass)}
            >
              {SOURCE_TYPE_LABELS[event.sourceType]} · {visual.badgeVariantLabel}
            </Badge>

            {event.overdue && (
              <Badge
                variant="destructive"
                className="rounded-full text-[11px] font-bold"
              >
                [Terlambat / Overdue]
              </Badge>
            )}

            {isCancelled && (
              <Badge variant="secondary" className="rounded-full text-[11px] font-bold">
                [Dibatalkan]
              </Badge>
            )}
          </div>

          <SheetTitle className="text-lg font-bold text-foreground leading-snug">
            {event.title}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground flex items-center gap-1.5">
            <HugeiconsIcon icon={Clock01Icon} className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{formatEventWibSchedule(event)}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Peringatan Overdue WCAG 1.4.1 */}
          {event.overdue && (
            <div
              role="status"
              className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-start gap-2.5"
            >
              <HugeiconsIcon
                icon={AlertCircleIcon}
                className="size-4 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="space-y-0.5">
                <p className="font-bold">[Terlambat / Overdue]</p>
                <p className="text-foreground/90">
                  Invoice ini melewati jatuh tempo pada{" "}
                  <span className="font-mono font-semibold">
                    {formatDateWibDisplay(event.metadata?.invoiceDueDate || event.startAt)}
                  </span>{" "}
                  (WIB) dan belum ditandai lunas.
                </p>
              </div>
            </div>
          )}

          {/* Ringkasan Proyek / Scope Internal */}
          <div className="rounded-2xl border border-border bg-muted/25 p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Keterkaitan Proyek
              </span>
              {event.project ? (
                <Badge variant="outline" className="text-[10px] rounded-full capitalize">
                  Status: {event.project.status || "-"}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] rounded-full">
                  Internal Agensi
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <HugeiconsIcon
                icon={event.project ? Calendar02Icon : Building02Icon}
                className="size-4 text-muted-foreground shrink-0"
                aria-hidden="true"
              />
              <span>
                {event.project ? event.project.name : "Internal Agensi (Tanpa Proyek)"}
              </span>
            </div>

            <div className="text-xs text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
              <span>Status Item</span>
              <span className="font-mono font-semibold text-foreground">{event.status}</span>
            </div>
          </div>

          {/* Detail Termin / Invoice jika bersumber finance */}
          {(event.sourceType === "payment_term" || event.sourceType === "invoice") && (
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Rincian Keuangan
              </h3>
              <dl className="grid grid-cols-2 gap-y-2 text-xs">
                <dt className="text-muted-foreground">Termin</dt>
                <dd className="text-right font-mono font-semibold text-foreground">
                  #{event.metadata?.termNumber ?? "-"}
                </dd>

                {typeof event.metadata?.amount === "number" && (
                  <>
                    <dt className="text-muted-foreground">Nominal</dt>
                    <dd className="text-right font-mono font-bold text-foreground">
                      {formatRupiah(event.metadata.amount)}
                    </dd>
                  </>
                )}

                {event.metadata?.invoiceNumber && (
                  <>
                    <dt className="text-muted-foreground">Nomor Invoice</dt>
                    <dd className="text-right font-mono font-semibold text-foreground">
                      {event.metadata.invoiceNumber}
                    </dd>
                  </>
                )}

                {event.metadata?.invoiceDueDate && (
                  <>
                    <dt className="text-muted-foreground">Jatuh Tempo (WIB)</dt>
                    <dd className="text-right font-mono font-semibold text-foreground">
                      {formatDateWibDisplay(event.metadata.invoiceDueDate)}
                    </dd>
                  </>
                )}

                {event.metadata?.paidAt && (
                  <>
                    <dt className="text-muted-foreground">Dilunasi Pada</dt>
                    <dd className="text-right font-mono font-semibold text-emerald-700">
                      {formatDateTimeWibDisplay(event.metadata.paidAt)}
                    </dd>
                  </>
                )}
              </dl>
            </div>
          )}

          {/* Catatan / Deskripsi Agenda Manual */}
          {isManualEvent && (
            <div className="space-y-4">
              {event.metadata?.description && (
                <div className="rounded-2xl border border-border bg-card p-4 space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Catatan Agenda
                  </h3>
                  <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                    {event.metadata.description}
                  </p>
                </div>
              )}

              {/* Riwayat Pembatalan Soft Status */}
              {isCancelled && (
                <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-1.5">
                  <p className="text-xs font-bold text-foreground">
                    Agenda Telah Dibatalkan (Soft Cancel)
                  </p>
                  {event.metadata?.cancelledAt && (
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Waktu pembatalan: {formatDateTimeWibDisplay(event.metadata.cancelledAt)}
                    </p>
                  )}
                  {event.metadata?.cancelReason && (
                    <p className="text-xs text-foreground">
                      Alasan: {event.metadata.cancelReason}
                    </p>
                  )}
                </div>
              )}

              {/* Pencatatan Tindak Lanjut Manual (BR-CAL-11) */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={Notification01Icon}
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                    <h3 className="text-xs font-bold text-foreground">
                      Log Tindak Lanjut Manual
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono rounded-full">
                    {event.metadata?.reminderCount ?? 0}x dicatat
                  </Badge>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Hanya mencatat tindakan follow-up manual pada log internal Cira PM (tidak
                  mengirim notifikasi WhatsApp, SMS, atau Email otomatis).
                </p>

                {event.metadata?.lastRemindedAt && (
                  <div className="rounded-xl bg-muted/40 p-2.5 text-[11px] space-y-0.5">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        className="size-3.5 text-emerald-600"
                        aria-hidden="true"
                      />
                      <span>
                        Terakhir: {formatDateTimeWibDisplay(event.metadata.lastRemindedAt)}
                      </span>
                    </div>
                    {event.metadata.reminderNote && (
                      <p className="text-muted-foreground pl-5">
                        Catatan: {event.metadata.reminderNote}
                      </p>
                    )}
                  </div>
                )}

                {canManageEvents && !isCancelled && (
                  <form onSubmit={handleRecordReminder} className="space-y-2 pt-1">
                    <div className="space-y-1">
                      <Label htmlFor="drawer-reminder-note" className="text-[11px] font-medium">
                        Catatan Tindak Lanjut (Opsional)
                      </Label>
                      <Input
                        id="drawer-reminder-note"
                        value={reminderNote}
                        onChange={(e) => setReminderNote(e.target.value)}
                        placeholder="Misal: Sudah follow-up PIC klien via grup"
                        className="h-8.5 text-xs rounded-xl"
                        maxLength={1000}
                        disabled={remindMutation.isPending}
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="outline"
                      size="xs"
                      disabled={remindMutation.isPending}
                      className="rounded-full h-8 px-3.5 text-xs font-semibold"
                    >
                      {remindMutation.isPending
                        ? "Mencatat..."
                        : "Catat Tindak Lanjut Manual"}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Deep link ke modul sumber proyek */}
          {event.project && (
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="w-full rounded-full h-10 text-xs font-semibold justify-center"
            >
              <Link href={event.href}>
                <HugeiconsIcon icon={Link01Icon} className="size-4 mr-1.5" aria-hidden="true" />
                {deepLinkLabel}
              </Link>
            </Button>
          )}
        </div>

        {/* Footer aksi khusus OperationalEvent */}
        {isManualEvent && canManageEvents && !isCancelled && (
          <SheetFooter className="p-4 sm:p-6 pt-4 border-t border-border flex-row items-center justify-between gap-2 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRequestCancel(event)}
              className="rounded-full h-9 px-4 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              Batalkan Agenda
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onRequestEdit(event)}
              className="rounded-full h-9 px-4 text-xs font-semibold"
            >
              <HugeiconsIcon icon={Edit02Icon} className="size-3.5 mr-1.5" aria-hidden="true" />
              Edit Agenda
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
