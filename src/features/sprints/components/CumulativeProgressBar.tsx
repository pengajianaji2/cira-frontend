"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Rocket01Icon,
  CheckmarkCircle02Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { useProjectProgressQuery } from "../queries/sprints.queries";
import { Badge } from "@/components/ui/badge";

interface CumulativeProgressBarProps {
  projectId: string;
  activeSprintName?: string;
}

export function CumulativeProgressBar({
  projectId,
  activeSprintName,
}: CumulativeProgressBarProps) {
  const { data: progressData, isLoading } = useProjectProgressQuery(projectId);

  const progress = progressData?.progress ?? 0;
  const completedSprintCount = progressData?.completedSprintCount ?? 0;
  const totalSprintCount = progressData?.totalSprintCount ?? 0;

  const getProgressColor = (val: number) => {
    if (val >= 100) return "from-emerald-500 to-teal-500";
    if (val >= 75) return "from-primary to-indigo-500";
    if (val >= 40) return "from-blue-500 to-primary";
    return "from-slate-500 to-blue-500";
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-3 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={Rocket01Icon} className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-foreground tracking-tight">
                Progres Proyek
              </h3>
              {activeSprintName && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 rounded-md font-medium bg-muted/50 border-border"
                >
                  🟢 Sprint Aktif: {activeSprintName}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Dihitung berdasarkan proporsi Sprint selesai terhadap seluruh Sprint (BR-PROJECT-01).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xl font-extrabold tracking-tight text-foreground font-mono">
            {isLoading ? "..." : `${progress}%`}
          </span>
          <Badge
            variant="secondary"
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border-primary/20"
          >
            {completedSprintCount} / {totalSprintCount} Sprint
          </Badge>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden p-0.5 border border-border/50">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(
            progress
          )} transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      {/* Quick Metrics Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" />
            Sprint Selesai: {completedSprintCount}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <HugeiconsIcon icon={Calendar03Icon} className="size-3" />
            Total Sprint: {totalSprintCount}
          </span>
        </div>
        <div className="font-mono text-[10px] text-muted-foreground/80">
          Rumus: (Sprint Selesai / Total Seluruh Sprint) × 100%
        </div>
      </div>
    </div>
  );
}
