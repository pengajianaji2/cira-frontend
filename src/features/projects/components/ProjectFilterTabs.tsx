"use client";

import React from "react";
import { Project, ProjectStatus } from "../types/projects.types";
import { cn } from "@/lib/utils";
import { useGlobalState } from "@/shared/components/state/GlobalStateProvider";

export type FilterStatus = "all" | ProjectStatus;

export interface ProjectFilterTabsProps {
  currentFilter?: FilterStatus;
  onFilterChange?: (status: FilterStatus) => void;
  projects?: Project[];
  counts?: Partial<Record<FilterStatus, number>>;
}

export function ProjectFilterTabs({
  currentFilter,
  onFilterChange,
  projects = [],
  counts: suppliedCounts,
}: ProjectFilterTabsProps) {
  const globalState = useGlobalState();

  const activeFilter = currentFilter ?? globalState.filterStatus;
  const handleFilterChange = (key: FilterStatus) => {
    if (onFilterChange) {
      onFilterChange(key);
    }
    globalState.setFilterStatus(key);
  };

  const localCounts = {
    all: projects.length,
    lead: projects.filter((p) => p.status === "lead").length,
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    cancelled: projects.filter((p) => p.status === "cancelled").length,
  };
  const counts = {
    all: suppliedCounts?.all ?? localCounts.all,
    lead: suppliedCounts?.lead ?? localCounts.lead,
    active: suppliedCounts?.active ?? localCounts.active,
    completed: suppliedCounts?.completed ?? localCounts.completed,
    cancelled: suppliedCounts?.cancelled ?? localCounts.cancelled,
  };

  const tabs: { key: FilterStatus; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: counts.all },
    { key: "lead", label: "Lead", count: counts.lead },
    { key: "active", label: "Active", count: counts.active },
    { key: "completed", label: "Completed", count: counts.completed },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  return (
    <div
      role="group"
      aria-label="Filter status proyek"
      className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar"
    >
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => handleFilterChange(tab.key)}
            className={cn(
              "min-h-11 sm:min-h-9 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-primary text-primary-foreground border border-primary shadow-xs font-semibold"
                : "bg-background text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "size-5 rounded-full text-[10px] flex items-center justify-center font-bold",
                isActive
                  ? "bg-foreground/10 text-primary-foreground"
                  : "bg-card text-foreground/80 border border-border"
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
