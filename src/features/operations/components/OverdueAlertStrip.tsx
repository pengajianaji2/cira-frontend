"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateWibDisplay } from "@/shared/lib/business-date";
import { formatRupiah } from "@/features/finance";
import { CalendarEvent } from "../types/operations.types";

interface OverdueAlertStripProps {
  overdueCarryover: CalendarEvent[];
  inRangeEvents: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

export function OverdueAlertStrip({
  overdueCarryover,
  inRangeEvents,
  onSelectEvent,
}: OverdueAlertStripProps) {
  const overdueItems = useMemo(() => {
    const map = new Map<string, CalendarEvent>();
    for (const item of overdueCarryover) {
      map.set(item.sourceId, item);
    }
    for (const ev of inRangeEvents) {
      if (ev.sourceType === "invoice" && ev.overdue) {
        map.set(ev.sourceId, ev);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.startAt.localeCompare(b.startAt));
  }, [overdueCarryover, inRangeEvents]);

  if (overdueItems.length === 0) return null;

  return (
    <section
      aria-label="Peringatan Invoice Terlambat"
      className="rounded-2xl border border-destructive/35 bg-destructive/8 p-4 space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-4.5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xs md:text-sm font-bold text-foreground">
                {overdueItems.length} Invoice Melewati Jatuh Tempo (WIB)
              </h2>
              <Badge
                variant="destructive"
                className="text-[10px] font-bold uppercase tracking-wide rounded-full"
              >
                [Terlambat / Overdue]
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Invoice belum berstatus lunas meskipun melewati tanggal jatuh tempo (Asia/Jakarta).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {overdueItems.map((inv) => {
          const amount = inv.metadata?.amount;
          return (
            <div
              key={inv.id}
              className="rounded-xl border border-destructive/25 bg-card p-3 flex flex-col justify-between gap-2 shadow-2xs"
            >
              <button
                type="button"
                onClick={() => onSelectEvent(inv)}
                className="text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-destructive">
                    [Terlambat / Overdue]
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    JT: {formatDateWibDisplay(inv.startAt)}
                  </span>
                </div>
                <p className="text-xs font-semibold text-foreground group-hover:underline mt-0.5 line-clamp-1">
                  {inv.metadata?.invoiceNumber || `Termin #${inv.metadata?.termNumber ?? "-"}`} ·{" "}
                  {inv.project?.name || "Proyek"}
                </p>
                {typeof amount === "number" && (
                  <p className="font-mono text-xs font-semibold text-foreground mt-1">
                    {formatRupiah(amount)}
                  </p>
                )}
              </button>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => onSelectEvent(inv)}
                  className="text-[11px] h-7 px-2 rounded-full"
                >
                  Detail
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="xs"
                  className="text-[11px] h-7 px-2.5 rounded-full border-destructive/30 text-foreground"
                >
                  <Link href={inv.href}>
                    <span>Tab Keuangan</span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="size-3 ml-1"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
