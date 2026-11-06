"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Time04Icon } from "@hugeicons/core-free-icons";
import { Project } from "@/features/projects";
import { ActivityTimeline } from "./ActivityTimeline";

interface ActivityTabContentProps {
  project: Project;
}

export function ActivityTabContent({ project }: ActivityTabContentProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner / Intro */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Time04Icon} className="size-4.5" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Riwayat Aktivitas & Audit Log</h2>
          </div>
          <p className="text-xs text-muted-foreground pl-11">
            Transparansi seluruh perubahan status proyek, pembayaran termin, task board, dan upload aset secara kronologis.
          </p>
        </div>
      </div>

      {/* Main Timeline */}
      <ActivityTimeline projectId={project.id} />
    </div>
  );
}
