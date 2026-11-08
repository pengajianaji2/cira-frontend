"use client";

import React, { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Coins01Icon,
  Image01Icon,
  Folder01Icon,
  Task01Icon,
  Time04Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { useActivitiesQuery } from "../queries/activity.queries";
import { ActivityCategory, ActivityLog } from "../types/activity.types";

interface ActivityTimelineProps {
  projectId: string;
}

const CATEGORY_TABS: { id: ActivityCategory; label: string }[] = [
  { id: "all", label: "Semua Aktivitas" },
  { id: "finance", label: "Keuangan" },
  { id: "project", label: "Proyek" },
  { id: "task", label: "Task Board" },
  { id: "asset", label: "Aset Desain" },
];

function getCategoryConfig(category: ActivityLog["category"]) {
  switch (category) {
    case "finance":
      return {
        label: "Keuangan",
        icon: Coins01Icon,
        colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        badgeVariant: "outline" as const,
      };
    case "project":
      return {
        label: "Proyek",
        icon: Folder01Icon,
        colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        badgeVariant: "outline" as const,
      };
    case "task":
      return {
        label: "Task",
        icon: Task01Icon,
        colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        badgeVariant: "outline" as const,
      };
    case "asset":
      return {
        label: "Aset",
        icon: Image01Icon,
        colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        badgeVariant: "outline" as const,
      };
    default:
      return {
        label: "Umum",
        icon: Folder01Icon,
        colorClass: "bg-muted text-muted-foreground border-border",
        badgeVariant: "outline" as const,
      };
  }
}

function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ActivityTimeline({ projectId }: ActivityTimelineProps) {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>("all");
  const { data: activities = [], isLoading, isError } = useActivitiesQuery(
    projectId,
    selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Filter Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <HugeiconsIcon icon={FilterIcon} className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Filter Kategori</h3>
            <p className="text-[11px] text-muted-foreground">
              Menampilkan {activities.length} catatan riwayat aktivitas
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/50">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <Button
                key={tab.id}
                type="button"
                variant={isSelected ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(tab.id)}
                className={`text-xs h-7 px-3 rounded-lg font-medium transition-all ${
                  isSelected
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Timeline Content */}
      {isLoading ? (
        <div className="min-h-[260px] flex flex-col items-center justify-center gap-3 bg-card border border-border rounded-2xl p-12">
          <Spinner className="size-6 text-primary" />
          <p className="text-xs text-muted-foreground">Memuat riwayat aktivitas...</p>
        </div>
      ) : isError ? (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 text-center text-destructive">
          <p className="text-xs font-medium">Gagal memuat log aktivitas.</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-card border border-border border-dashed rounded-3xl p-12 text-center">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <HugeiconsIcon icon={Time04Icon} className="size-6" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">Belum Ada Aktivitas</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {selectedCategory === "all"
              ? "Seluruh tindakan penting terkait proyek, pembayaran, task, dan aset akan tercatat di sini secara otomatis."
              : `Belum ada log aktivitas untuk kategori "${selectedCategory}".`}
          </p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-[17px] sm:before:left-[21px] before:top-3 before:bottom-3 before:w-0.5 before:bg-border/80">
          {activities.map((item) => {
            const config = getCategoryConfig(item.category);
            const actor = item.user ?? { name: "Pengguna", role: "Anggota" };
            let relativeTime = "";
            let fullTime = "";
            try {
              const d = new Date(item.createdAt);
              relativeTime = formatDistanceToNow(d, {
                addSuffix: true,
                locale: idLocale,
              });
              fullTime = format(d, "dd MMMM yyyy, HH:mm", { locale: idLocale });
            } catch {
              relativeTime = item.createdAt;
              fullTime = item.createdAt;
            }

            return (
              <div key={item.id} className="relative group">
                {/* Node Icon on vertical line */}
                <div
                  className={`absolute -left-[25px] sm:-left-[29px] top-1 size-8 rounded-full border flex items-center justify-center bg-background shadow-xs transition-transform group-hover:scale-110 ${config.colorClass}`}
                >
                  <HugeiconsIcon icon={config.icon} className="size-3.5" />
                </div>

                {/* Card Container */}
                <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs transition-all hover:border-border hover:shadow-sm space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {item.action}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${config.colorClass}`}
                      >
                        {config.label}
                      </Badge>
                    </div>

                    <div
                      className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
                      title={fullTime}
                    >
                      <HugeiconsIcon icon={Time04Icon} className="size-3 text-muted-foreground/70" />
                      <span>{relativeTime}</span>
                    </div>
                  </div>

                  <p className="text-xs text-foreground/90 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6 text-[10px] font-bold">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(actor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {actor.name}
                        </span>
                        <span>•</span>
                        <span className="text-[11px]">{actor.role}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
