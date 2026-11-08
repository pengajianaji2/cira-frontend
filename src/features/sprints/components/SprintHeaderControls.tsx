"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  PlayIcon,
  CheckmarkCircle02Icon,
  ReplayIcon,
  Calendar03Icon,
  Flag01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sprint } from "../types/sprints.types";
import {
  useDeleteSprintMutation,
  useReopenSprintMutation,
} from "../queries/sprints.queries";
import { CloseSprintModal } from "./CloseSprintModal";
import { StartSprintModal } from "./StartSprintModal";

interface SprintHeaderControlsProps {
  projectId: string;
  sprints: Sprint[];
  selectedSprintId: string | null;
  onSelectSprint: (sprintId: string | null) => void;
  onOpenCreateSprint: () => void;
}

export function SprintHeaderControls({
  projectId,
  sprints,
  selectedSprintId,
  onSelectSprint,
  onOpenCreateSprint,
}: SprintHeaderControlsProps) {
  const [completeModalSprint, setCompleteModalSprint] = useState<Sprint | null>(null);
  const [startModalSprint, setStartModalSprint] = useState<Sprint | null>(null);

  const reopenMutation = useReopenSprintMutation(projectId);
  const deleteMutation = useDeleteSprintMutation(projectId);

  const activeSprint = sprints.find((s) => s.status === "active");
  const selectedSprint = sprints.find((s) => s.id === selectedSprintId) || null;

  const handleReopenSprint = (sprintId: string) => {
    if (window.confirm("Buka kembali sprint ini ke tahap perencanaan (planning)? Progres proyek akan disesuaikan otomatis.")) {
      reopenMutation.mutate(sprintId);
    }
  };

  const handleDeleteSprint = (sprint: Sprint) => {
    if (window.confirm(`Hapus sprint "${sprint.name}"? Task di dalamnya akan dialihkan ke Backlog.`)) {
      deleteMutation.mutate(sprint.id, {
        onSuccess: () => {
          if (selectedSprintId === sprint.id) {
            onSelectSprint(null);
          }
        },
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-semibold">
            Aktif Berjalan
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 text-[10px] font-semibold">
            Selesai
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">
            Perencanaan
          </Badge>
        );
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-3">
      {/* Selector & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-foreground whitespace-nowrap">
            Tampilan Sprint:
          </span>
          <Select
            value={selectedSprintId || "all"}
            onValueChange={(val) => onSelectSprint(val === "all" ? null : val)}
          >
            <SelectTrigger className="w-full sm:w-[260px] rounded-xl text-xs h-9 bg-background">
              <SelectValue placeholder="Pilih Sprint / Tampilan" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="text-xs font-medium">
                🎯 Semua Task (Keseluruhan Proyek)
              </SelectItem>
              {sprints.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-xs">
                  {s.status === "active" ? "🟢" : s.status === "completed" ? "🟣" : "⚪"}{" "}
                  {s.name} ({s.tasks?.length || 0} task)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenCreateSprint}
            className="rounded-full text-xs h-9 px-3.5 border-dashed border-primary/50 text-primary hover:bg-primary/5 font-semibold cursor-pointer"
          >
            <HugeiconsIcon icon={Add01Icon} className="size-3.5 mr-1" />
            + Buat Sprint Baru
          </Button>
        </div>
      </div>

      {/* Selected / Current Sprint Detail Card */}
      {selectedSprint ? (
        <div className="bg-muted/30 border border-border/80 rounded-xl p-3.5 space-y-2.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <HugeiconsIcon icon={Flag01Icon} className="size-4 text-primary shrink-0" />
                <h4 className="text-sm font-bold text-foreground">{selectedSprint.name}</h4>
                {getStatusBadge(selectedSprint.status)}
              </div>
              {selectedSprint.goal && (
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                  {selectedSprint.goal}
                </p>
              )}
            </div>

            {/* Sprint Status Actions */}
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              {selectedSprint.status === "planning" && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setStartModalSprint(selectedSprint)}
                  className="rounded-full text-xs h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  <HugeiconsIcon icon={PlayIcon} className="size-3.5 mr-1.5" />
                  Mulai Sprint
                </Button>
              )}

              {selectedSprint.status === "active" && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setCompleteModalSprint(selectedSprint)}
                  className="rounded-full text-xs h-8 px-3.5 bg-primary text-primary-foreground font-semibold cursor-pointer"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 mr-1.5" />
                  Selesaikan Sprint
                </Button>
              )}

              {selectedSprint.status === "completed" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleReopenSprint(selectedSprint.id)}
                  disabled={reopenMutation.isPending}
                  className="rounded-full text-xs h-8 px-3 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <HugeiconsIcon icon={ReplayIcon} className="size-3.5 mr-1.5" />
                  Buka Kembali
                </Button>
              )}

              {selectedSprint.status !== "active" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDeleteSprint(selectedSprint)}
                  disabled={deleteMutation.isPending}
                  className="rounded-lg text-muted-foreground hover:text-destructive cursor-pointer"
                  title="Hapus Sprint"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
            {(selectedSprint.startDate || selectedSprint.endDate) && (
              <span className="flex items-center gap-1">
                <HugeiconsIcon icon={Calendar03Icon} className="size-3" />
                {selectedSprint.startDate
                  ? new Date(selectedSprint.startDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })
                  : "Mulai fleksibel"}{" "}
                —{" "}
                {selectedSprint.endDate
                  ? new Date(selectedSprint.endDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Selesai fleksibel"}
              </span>
            )}
            <span>•</span>
            <span>
              Total Beban: <strong>{selectedSprint.totalPoints ?? 0} Story Points</strong>
            </span>
            <span>•</span>
            <span>
              Tuntas:{" "}
              <strong>
                {selectedSprint.completedTasks ?? 0} / {selectedSprint.totalTasks ?? 0} task
              </strong>
            </span>
          </div>
        </div>
      ) : activeSprint ? (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground">Sprint Berjalan Saat Ini:</span>
            <strong className="text-foreground">{activeSprint.name}</strong>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelectSprint(activeSprint.id)}
            className="text-[11px] h-7 px-2.5 text-primary hover:underline font-semibold cursor-pointer"
          >
            Fokus ke Sprint Ini →
          </Button>
        </div>
      ) : null}

      {/* Close Sprint Modal dengan resolusi task TODO (BR-SPRINT-04 & BR-SPRINT-05) */}
      {completeModalSprint && (
        <CloseSprintModal
          projectId={projectId}
          sprint={completeModalSprint}
          allSprints={sprints}
          isOpen={true}
          onClose={() => setCompleteModalSprint(null)}
        />
      )}

      {/* Start Sprint Modal dengan input tanggal valid (BR-SPRINT-02) */}
      {startModalSprint && (
        <StartSprintModal
          projectId={projectId}
          sprint={startModalSprint}
          activeSprint={activeSprint}
          isOpen={true}
          onClose={() => setStartModalSprint(null)}
        />
      )}
    </div>
  );
}
