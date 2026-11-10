"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface TabContentSkeletonProps {
  tab?: "prd" | "tasks" | "sprints" | "finance" | "assets" | "activity" | string;
  className?: string;
}

export function TabContentSkeleton({ tab = "prd", className }: TabContentSkeletonProps) {
  if (tab === "prd") {
    return (
      <div className={cn("space-y-4", className)}>
        {/* PRD action bar skeleton */}
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-5 w-32 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
        </div>

        {/* PRD split editor skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
          <div className="bg-card border border-border rounded-3xl p-5 space-y-3">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
            <Skeleton className="h-64 w-full rounded-2xl mt-4" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
          <div className="bg-card border border-border rounded-3xl p-5 space-y-3">
            <Skeleton className="h-7 w-48 rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <div className="pt-4 space-y-2">
              <Skeleton className="h-5 w-1/3 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-4/5 rounded-md" />
            </div>
            <div className="pt-4 space-y-2">
              <Skeleton className="h-5 w-1/4 rounded-md" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "tasks") {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Search & Add task control bar */}
        <div className="bg-card border border-border rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Skeleton className="h-9 w-full sm:w-80 rounded-xl" />
          <Skeleton className="h-9 w-44 rounded-full" />
        </div>

        {/* Seksi 1: Sprint Aktif Checklist skeleton */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-5 w-44 rounded-md" />
              </div>
              <Skeleton className="h-3.5 w-64 rounded-md" />
            </div>
            <div className="space-y-1.5 min-w-[180px]">
              <Skeleton className="h-3.5 w-32 rounded-md ml-auto" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-background"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="size-4.5 rounded-md shrink-0" />
                  <Skeleton className="h-4 w-56 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-14 rounded-md" />
                  <Skeleton className="h-5 w-12 rounded-md" />
                  <Skeleton className="h-7 w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seksi 2: Backlog Proyek Checklist skeleton */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
            <Skeleton className="size-4 rounded-md" />
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <div className="space-y-2">
            {[1, 2].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-background"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="size-4.5 rounded-md shrink-0" />
                  <Skeleton className="h-4 w-64 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <Skeleton className="h-7 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tab === "sprints") {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Top action header skeleton */}
        <div className="bg-card border border-border rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-2">
            <Skeleton className="h-5 w-52 rounded-lg" />
            <Skeleton className="h-3.5 w-80 rounded-md" />
          </div>
          <Skeleton className="h-9 w-36 rounded-full" />
        </div>

        {/* Cumulative progress bar skeleton */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-48 rounded-md" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-28 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
        </div>

        {/* Sprint list cards skeleton */}
        <div className="space-y-3">
          {[1, 2].map((card) => (
            <div
              key={card}
              className="bg-card border border-border rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-40 rounded-md" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-72 rounded-md" />
                <Skeleton className="h-3 w-48 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24 rounded-full" />
                <Skeleton className="h-9 w-36 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === "finance") {
    return (
      <div className={cn("space-y-5", className)}>
        {/* Finance stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-3xl p-5 space-y-2 shadow-xs"
            >
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-7 w-36 rounded-lg" />
              <Skeleton className="h-2.5 w-28 rounded-md" />
            </div>
          ))}
        </div>

        {/* Milestone list skeleton */}
        <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-full" />
          </div>
          {[1, 2, 3].map((row) => (
            <div
              key={row}
              className="h-16 rounded-2xl border border-border/80 bg-muted/20 p-4 flex items-center justify-between"
            >
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40 rounded-md" />
                <Skeleton className="h-3 w-28 rounded-md" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === "assets") {
    return (
      <div className={cn("space-y-5", className)}>
        {/* Dropzone skeleton */}
        <div className="h-36 rounded-3xl border-2 border-dashed border-border bg-card shadow-xs flex flex-col items-center justify-center gap-2 p-6">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-4 w-52 rounded-md" />
          <Skeleton className="h-3 w-36 rounded-md" />
        </div>

        {/* Asset cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs space-y-2 p-2"
            >
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-3.5 w-3/4 rounded-md mx-1" />
              <Skeleton className="h-2.5 w-1/2 rounded-md mx-1 mb-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === "activity") {
    return (
      <div className={cn("bg-card border border-border rounded-3xl p-6 space-y-6 shadow-xs", className)}>
        <Skeleton className="h-6 w-40 rounded-lg" />
        <div className="space-y-6 pl-4 border-l-2 border-border/60">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative pl-6 space-y-2">
              <div className="absolute -left-[31px] top-1 size-3.5 rounded-full bg-border" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
              <Skeleton className="h-3 w-4/5 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback generic tab skeleton
  return (
    <div className={cn("bg-card border border-border rounded-3xl p-8 space-y-4 shadow-xs", className)}>
      <Skeleton className="h-6 w-48 rounded-lg" />
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-3/4 rounded-md" />
      <Skeleton className="h-48 w-full rounded-2xl mt-4" />
    </div>
  );
}

/**
 * Kerangka pemuatan (*skeleton*) kartu header workspace seragam yang meniru dimensi `PageHeaderCard`
 * untuk mencegah pergeseran tata letak saat data halaman masih dimuat.
 */
export function PageHeaderSkeleton({
  hasAction = false,
  className,
}: {
  hasAction?: boolean;
  className?: string;
}) {
  return (
    <div
      data-slot="page-header-skeleton"
      className={cn(
        "bg-card border border-border rounded-3xl p-5 md:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        className,
      )}
    >
      <div className="flex items-start gap-3.5 flex-1">
        <Skeleton className="size-10 md:size-11 rounded-2xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-7 w-52 rounded-lg" />
          <Skeleton className="h-4 w-full max-w-md rounded-md" />
        </div>
      </div>
      {hasAction ? <Skeleton className="h-9 w-40 rounded-full shrink-0" /> : null}
    </div>
  );
}

export function CardSkeleton({
  lines = 3,
  hasHeader = true,
  className,
}: {
  lines?: number;
  hasHeader?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("bg-card border border-border rounded-3xl p-6 space-y-4 shadow-xs", className)}>
      {hasHeader && (
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <Skeleton className="h-5 w-40 rounded-lg" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      )}
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-4 rounded-md", i === lines - 1 ? "w-2/3" : "w-full")}
          />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({
  rows = 4,
  cols = 5,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card overflow-hidden shadow-xs", className)}>
      <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24 rounded-md" />
        ))}
      </div>
      <div className="divide-y divide-border/60">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn("h-4 rounded-md", c === 0 ? "w-32" : "w-20")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
