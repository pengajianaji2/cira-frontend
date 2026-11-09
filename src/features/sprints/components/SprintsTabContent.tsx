"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Delete02Icon,
  Edit02Icon,
  Flag01Icon,
  PlayIcon,
  ReplayIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  formatDateTimeWibDisplay,
  formatDateWibDisplay,
} from "@/shared/lib/business-date";
import { useMyPermissionsQuery } from "@/features/auth";
import { Sprint } from "../types/sprints.types";
import {
  useDeleteSprintMutation,
  useProjectSprintsQuery,
  useReopenSprintMutation,
} from "../queries/sprints.queries";
import { CumulativeProgressBar } from "./CumulativeProgressBar";
import { CreateSprintModal } from "./CreateSprintModal";
import { StartSprintModal } from "./StartSprintModal";
import { CloseSprintModal } from "./CloseSprintModal";

interface SprintsTabContentProps {
  project: {
    id: string;
    name: string;
    status: string;
  };
}

function getSprintTaskCount(sprint: Sprint): number {
  return sprint.totalTasks ?? sprint.tasks?.length ?? 0;
}

function getSprintCompletedTaskCount(sprint: Sprint): number {
  return sprint.completedTasks ?? 0;
}

function formatSprintDateRange(sprint: Sprint): string {
  if (!sprint.startDate && !sprint.endDate) {
    return "Tanggal belum ditentukan";
  }
  const startLabel = sprint.startDate
    ? formatDateWibDisplay(sprint.startDate)
    : "Mulai fleksibel";
  const endLabel = sprint.endDate
    ? formatDateWibDisplay(sprint.endDate)
    : "Selesai fleksibel";
  return `${startLabel} — ${endLabel}`;
}

/**
 * Konten tab Sprints pada detail proyek (US-2): menampilkan progres kumulatif proyek serta
 * seksi Sprint Aktif (maksimal 1), Sprint Perencanaan, dan Sprint Selesai lengkap dengan dialog konfirmasi.
 */
export function SprintsTabContent({ project }: SprintsTabContentProps) {
  const { data: permissions = [] } = useMyPermissionsQuery();
  const canWriteSprint = permissions.includes("sprints.write");
  const canDeleteSprint = permissions.includes("sprints.delete");

  const {
    data: sprints = [],
    isLoading,
    isError,
    refetch,
  } = useProjectSprintsQuery(project.id);

  const reopenMutation = useReopenSprintMutation(project.id);
  const deleteMutation = useDeleteSprintMutation(project.id);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [sprintToEdit, setSprintToEdit] = useState<Sprint | null>(null);
  const [startModalSprint, setStartModalSprint] = useState<Sprint | null>(null);
  const [closeModalSprint, setCloseModalSprint] = useState<Sprint | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "reopen" | "delete";
    sprint: Sprint;
  } | null>(null);

  const { activeSprints, planningSprints, completedSprints, activeSprint } =
    useMemo(() => {
      const active = sprints.filter((s) => s.status === "active");
      const planning = sprints.filter((s) => s.status === "planning");
      const completed = sprints.filter((s) => s.status === "completed");
      return {
        activeSprints: active,
        planningSprints: planning,
        completedSprints: completed,
        activeSprint: active[0] ?? null,
      };
    }, [sprints]);

  const isConfirmPending = reopenMutation.isPending || deleteMutation.isPending;

  const handleOpenCreateModal = () => {
    setSprintToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (sprint: Sprint) => {
    setSprintToEdit(sprint);
    setIsFormModalOpen(true);
  };

  const handleConfirmAction = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirmAction) return;

    if (confirmAction.type === "reopen") {
      reopenMutation.mutate(confirmAction.sprint.id, {
        onSuccess: () => setConfirmAction(null),
      });
    } else {
      deleteMutation.mutate(confirmAction.sprint.id, {
        onSuccess: () => setConfirmAction(null),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[320px] flex flex-col items-center justify-center gap-3 bg-card border border-border rounded-3xl p-8">
        <Spinner className="size-6 text-primary" />
        <p className="text-xs text-muted-foreground">Memuat daftar sprint proyek...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="bg-card border border-destructive/30 rounded-3xl p-8 text-center space-y-3"
      >
        <p className="text-sm font-bold text-destructive">
          Gagal memuat data sprint proyek.
        </p>
        <p className="text-xs text-muted-foreground">
          Periksa koneksi Anda lalu coba muat ulang data sprint.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="rounded-full text-xs h-9 px-4"
        >
          Muat Ulang
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Aksi Tab Sprints */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Flag01Icon} className="size-4.5" aria-hidden="true" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Siklus &amp; Manajemen Sprint
            </h2>
          </div>
          <p className="text-xs text-muted-foreground pl-11.5">
            Kelola Sprint Perencanaan, aktivasi jadwal WIB, penutupan manual atomik, dan buka kembali sprint selesai.
          </p>
        </div>

        {canWriteSprint && (
          <Button
            type="button"
            size="sm"
            onClick={handleOpenCreateModal}
            className="rounded-full text-xs h-9 px-4 font-semibold self-start sm:self-auto shrink-0 cursor-pointer"
          >
            <HugeiconsIcon icon={Add01Icon} className="size-3.5 mr-1.5" aria-hidden="true" />
            + Buat Sprint Baru
          </Button>
        )}
      </div>

      {/* Ringkasan Progres Kumulatif & Breakdown Status Sprint */}
      <CumulativeProgressBar
        projectId={project.id}
        activeSprintName={activeSprint?.name}
        completedCount={completedSprints.length}
        activeCount={activeSprints.length}
        planningCount={planningSprints.length}
      />

      {/* SEKSI 1: SPRINT AKTIF */}
      <section aria-labelledby="active-sprint-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 id="active-sprint-heading" className="text-sm font-bold text-foreground">
            Sprint Aktif
          </h3>
          <span className="text-xs text-muted-foreground">
            Maksimal 1 sprint berjalan bersamaan
          </span>
        </div>

        {activeSprint ? (
          <div className="bg-emerald-500/5 border-2 border-emerald-500/30 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-emerald-600 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-white" aria-hidden="true" />
                    Aktif Berjalan
                  </Badge>
                  <h4 className="text-base font-bold text-foreground">
                    {activeSprint.name}
                  </h4>
                </div>

                {activeSprint.goal && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {activeSprint.goal}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                    <HugeiconsIcon
                      icon={Calendar03Icon}
                      className="size-3.5 text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                    {formatSprintDateRange(activeSprint)}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-[11px]">
                    {getSprintCompletedTaskCount(activeSprint)} /{" "}
                    {getSprintTaskCount(activeSprint)} task selesai
                  </span>
                  <span>•</span>
                  <span className="font-mono text-[11px]">
                    {activeSprint.totalPoints ?? 0} Story Points
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  asChild
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs h-9 px-3.5"
                >
                  <Link href={`/projects/${project.id}?tab=tasks`}>
                    Lihat Checklist Task
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="size-3.5 ml-1"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>

                {canWriteSprint && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditModal(activeSprint)}
                      className="rounded-full text-xs h-9 px-3.5 cursor-pointer"
                    >
                      <HugeiconsIcon
                        icon={Edit02Icon}
                        className="size-3.5 mr-1.5"
                        aria-hidden="true"
                      />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setCloseModalSprint(activeSprint)}
                      className="rounded-full text-xs h-9 px-4 bg-primary text-primary-foreground font-semibold cursor-pointer"
                    >
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        className="size-3.5 mr-1.5"
                        aria-hidden="true"
                      />
                      Tutup Sprint
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-dashed border-border rounded-3xl p-6 text-center space-y-1.5">
            <p className="text-xs font-semibold text-foreground">
              Belum Ada Sprint yang Aktif Saat Ini
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Aktifkan salah satu sprint dari bagian Sprint Perencanaan di bawah agar tim dapat fokus mengeksekusi task pada siklus ini.
            </p>
          </div>
        )}
      </section>

      {/* SEKSI 2: SPRINT PERENCANAAN */}
      <section aria-labelledby="planning-sprint-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 id="planning-sprint-heading" className="text-sm font-bold text-foreground">
              Sprint Perencanaan
            </h3>
            <Badge variant="secondary" className="text-[11px] font-mono rounded-full px-2 py-0">
              {planningSprints.length}
            </Badge>
          </div>
          {activeSprint && planningSprints.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              Tutup sprint aktif terlebih dahulu sebelum mengaktifkan sprint baru
            </span>
          )}
        </div>

        {planningSprints.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-3xl p-8 text-center space-y-3">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <HugeiconsIcon icon={Clock01Icon} className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">
                Belum Ada Sprint Perencanaan
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Rencanakan siklus kerja berikutnya dengan nama dan sasaran sprint; tanggal boleh dilengkapi saat siap diaktifkan.
              </p>
            </div>
            {canWriteSprint && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenCreateModal}
                className="rounded-full text-xs h-8 px-4"
              >
                <HugeiconsIcon icon={Add01Icon} className="size-3.5 mr-1.5" aria-hidden="true" />
                Buat Sprint Perencanaan
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {planningSprints.map((sprint) => (
              <div
                key={sprint.id}
                className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">{sprint.name}</h4>
                    <Badge
                      variant="outline"
                      className="text-[10px] rounded-full bg-muted text-muted-foreground"
                    >
                      Perencanaan
                    </Badge>
                  </div>

                  {sprint.goal && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {sprint.goal}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-1">
                    <span className="inline-flex items-center gap-1">
                      <HugeiconsIcon
                        icon={Calendar03Icon}
                        className="size-3.5"
                        aria-hidden="true"
                      />
                      {formatSprintDateRange(sprint)}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{getSprintTaskCount(sprint)} task</span>
                    <span>•</span>
                    <span className="font-mono">{sprint.totalPoints ?? 0} SP</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {canWriteSprint && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(sprint)}
                        className="rounded-full text-xs h-8.5 px-3.5 cursor-pointer"
                      >
                        <HugeiconsIcon
                          icon={Edit02Icon}
                          className="size-3.5 mr-1.5"
                          aria-hidden="true"
                        />
                        Edit
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setStartModalSprint(sprint)}
                        className="rounded-full text-xs h-8.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                      >
                        <HugeiconsIcon
                          icon={PlayIcon}
                          className="size-3.5 mr-1.5"
                          aria-hidden="true"
                        />
                        Mulai / Aktifkan Sprint
                      </Button>
                    </>
                  )}

                  {canDeleteSprint && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setConfirmAction({ type: "delete", sprint })}
                      disabled={isConfirmPending}
                      aria-label={`Hapus sprint "${sprint.name}"`}
                      title="Hapus Sprint"
                      className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="size-4" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SEKSI 3: SPRINT SELESAI */}
      <section aria-labelledby="completed-sprint-heading" className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 id="completed-sprint-heading" className="text-sm font-bold text-foreground">
            Sprint Selesai
          </h3>
          <Badge variant="secondary" className="text-[11px] font-mono rounded-full px-2 py-0">
            {completedSprints.length}
          </Badge>
        </div>

        {completedSprints.length === 0 ? (
          <div className="bg-card border border-border/80 rounded-3xl p-6 text-center text-xs text-muted-foreground">
            Belum ada sprint yang diselesaikan pada proyek ini.
          </div>
        ) : (
          <div className="space-y-2.5">
            {completedSprints.map((sprint) => (
              <div
                key={sprint.id}
                className="bg-card border border-border/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-foreground">
                      {sprint.name}
                    </h4>
                    <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold rounded-full">
                      Selesai
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span>Jadwal: {formatSprintDateRange(sprint)}</span>
                    <span>•</span>
                    <span>
                      Diselesaikan:{" "}
                      <strong className="text-foreground font-mono">
                        {formatDateTimeWibDisplay(sprint.completedAt)}
                      </strong>
                    </span>
                    <span>•</span>
                    <span className="font-mono">
                      {getSprintCompletedTaskCount(sprint)} / {getSprintTaskCount(sprint)} task ({sprint.totalPoints ?? 0} SP)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {canWriteSprint && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmAction({ type: "reopen", sprint })}
                      disabled={isConfirmPending}
                      className="rounded-full text-xs h-8 px-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <HugeiconsIcon
                        icon={ReplayIcon}
                        className="size-3.5 mr-1.5"
                        aria-hidden="true"
                      />
                      Buka Kembali
                    </Button>
                  )}

                  {canDeleteSprint && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setConfirmAction({ type: "delete", sprint })}
                      disabled={isConfirmPending}
                      aria-label={`Hapus sprint "${sprint.name}"`}
                      title="Hapus Sprint"
                      className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="size-4" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Dialog Buat / Edit Sprint */}
      <CreateSprintModal
        projectId={project.id}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSprintToEdit(null);
        }}
        sprintToEdit={sprintToEdit}
      />

      {/* Dialog Mulai / Aktifkan Sprint */}
      {startModalSprint && (
        <StartSprintModal
          projectId={project.id}
          sprint={startModalSprint}
          activeSprint={activeSprint}
          isOpen={true}
          onClose={() => setStartModalSprint(null)}
        />
      )}

      {/* Dialog Tutup Sprint */}
      {closeModalSprint && (
        <CloseSprintModal
          projectId={project.id}
          sprint={closeModalSprint}
          allSprints={sprints}
          isOpen={true}
          onClose={() => setCloseModalSprint(null)}
        />
      )}

      {/* AlertDialog Konfirmasi Reopen / Delete Sprint */}
      <AlertDialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => {
          if (!open && !isConfirmPending) {
            setConfirmAction(null);
          }
        }}
      >
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              {confirmAction?.type === "reopen"
                ? "Buka Kembali Sprint Selesai?"
                : "Hapus Sprint?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {confirmAction?.type === "reopen"
                ? `Sprint "${confirmAction.sprint.name}" akan dikembalikan ke tahap perencanaan (planning) dan persentase progres proyek akan dihitung ulang secara otomatis.`
                : `Apakah Anda yakin ingin menghapus sprint "${confirmAction?.sprint.name}"? Task yang tersisa di dalam sprint ini akan dialihkan kembali ke Backlog.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={isConfirmPending}
              className="rounded-full text-xs h-9"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              variant={confirmAction?.type === "delete" ? "destructive" : "default"}
              disabled={isConfirmPending}
              onClick={handleConfirmAction}
              className="rounded-full text-xs h-9 font-semibold"
            >
              {isConfirmPending && <Spinner className="size-3.5 mr-1.5" />}
              {confirmAction?.type === "reopen"
                ? "Ya, Buka Kembali"
                : "Ya, Hapus Sprint"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
