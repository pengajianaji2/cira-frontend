"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Rocket01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  PlayCircleIcon,
} from "@hugeicons/core-free-icons";
import {
  useProjectProgressQuery,
  useProjectSprintsQuery,
} from "../queries/sprints.queries";
import { Badge } from "@/components/ui/badge";

interface CumulativeProgressBarProps {
  projectId: string;
  activeSprintName?: string;
  completedCount?: number;
  activeCount?: number;
  planningCount?: number;
}

/**
 * Bilah indikator progres kumulatif proyek berbasis rasio `completedSprintCount / totalSprintCount * 100%` (AC-2.5)
 * beserta rincian jumlah sprint selesai, aktif, dan perencanaan.
 */
export function CumulativeProgressBar({
  projectId,
  activeSprintName,
  completedCount: completedCountProp,
  activeCount: activeCountProp,
  planningCount: planningCountProp,
}: CumulativeProgressBarProps) {
  const { data: progressData, isLoading: isProgressLoading } =
    useProjectProgressQuery(projectId);
  const { data: sprints = [] } = useProjectSprintsQuery(projectId);

  const progress = progressData?.progress ?? 0;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const derivedCompleted = sprints.filter((s) => s.status === "completed").length;
  const derivedActive = sprints.filter((s) => s.status === "active").length;
  const derivedPlanning = sprints.filter((s) => s.status === "planning").length;

  const completedCount =
    completedCountProp ?? progressData?.completedSprintCount ?? derivedCompleted;
  const activeCount = activeCountProp ?? derivedActive;
  const planningCount = planningCountProp ?? derivedPlanning;
  const totalSprintCount =
    progressData?.totalSprintCount ?? completedCount + activeCount + planningCount;

  const progressFillClass =
    progress >= 100 ? "bg-emerald-600" : "bg-primary";

  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3.5 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={Rocket01Icon} className="size-4.5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-foreground tracking-tight">
                Progres Proyek
              </h3>
              {activeSprintName && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-700 border-emerald-500/30 inline-flex items-center gap-1.5"
                >
                  <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  Sprint Aktif: {activeSprintName}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dihitung berdasarkan rasio sprint selesai terhadap total seluruh sprint (BR-PROJECT-01).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto pl-11 sm:pl-0">
          <span className="text-2xl font-extrabold tracking-tight text-foreground font-mono">
            {isProgressLoading ? "..." : `${progress}%`}
          </span>
          <Badge
            variant="secondary"
            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono"
          >
            {completedCount} / {totalSprintCount} Sprint
          </Badge>
        </div>
      </div>

      {/* Visual Solid Progress Bar */}
      <div
        role="progressbar"
        aria-label="Progres penyelesaian sprint proyek"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedProgress}
        className="w-full bg-muted h-2.5 rounded-full overflow-hidden border border-border/60"
      >
        <div
          className={`h-full rounded-full ${progressFillClass} transition-all duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {/* Breakdown Status Footer (Selesai, Aktif, Perencanaan) */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-2 border-t border-border/50">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" aria-hidden="true" />
            <span>{completedCount} Selesai</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
            <HugeiconsIcon icon={PlayCircleIcon} className="size-3.5" aria-hidden="true" />
            <span>{activeCount} Aktif</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground font-medium">
            <HugeiconsIcon icon={Clock01Icon} className="size-3.5" aria-hidden="true" />
            <span>{planningCount} Perencanaan</span>
          </span>
        </div>
        <div className="font-mono text-[11px] text-muted-foreground/80">
          Rumus: (Sprint Selesai / Total Sprint) × 100%
        </div>
      </div>
    </div>
  );
}
