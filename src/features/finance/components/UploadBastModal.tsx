"use client";

import React, { useState, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Upload04Icon,
  File01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Cancel01Icon,
  FastForwardIcon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDateWibDisplay, getBusinessDateWib } from "@/shared/lib/business-date";
import { PaymentTerm } from "../types/finance.types";
import { useUploadBastFileMutation } from "../queries/finance.queries";
import { useProjectSprintsQuery } from "@/features/sprints";

interface UploadBastModalProps {
  projectId: string;
  term: PaymentTerm | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadBastModal({
  projectId,
  term,
  open,
  onOpenChange,
}: UploadBastModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadBastFileMutation();
  const { data: sprints = [] } = useProjectSprintsQuery(projectId);

  if (!term) return null;

  const isAlreadyReady = term.status === "ready";
  const completedSprintsCount = sprints.filter((s) => s.status === "completed").length;

  // Evaluasi prasyarat pemicu saat termin masih 'planned'
  const isSprintTrigger = term.triggerType === "sprint";
  const isDateTrigger = term.triggerType === "date" && Boolean(term.triggerDate);

  let sprintConditionMet = true;
  let sprintPrerequisiteText = "";
  if (isSprintTrigger && !isAlreadyReady) {
    if (term.requiredCompletedSprints && term.requiredCompletedSprints >= 1) {
      sprintConditionMet = completedSprintsCount >= term.requiredCompletedSprints;
      sprintPrerequisiteText = sprintConditionMet
        ? `Target ${term.requiredCompletedSprints} sprint selesai telah terpenuhi (${completedSprintsCount} sprint selesai).`
        : `Baru ${completedSprintsCount} dari ${term.requiredCompletedSprints} sprint selesai. Selesaikan sprint terkait terlebih dahulu sebelum menandai siap ditagih.`;
    } else if (term.triggerSprintId) {
      const linkedSprint = sprints.find((s) => s.id === term.triggerSprintId) || term.triggerSprint;
      sprintConditionMet = linkedSprint?.status === "completed";
      sprintPrerequisiteText = sprintConditionMet
        ? `Sprint "${linkedSprint?.name || "Terkait"}" telah selesai.`
        : `Sprint "${linkedSprint?.name || "Terkait"}" belum berstatus Selesai.`;
    }
  }

  let dateConditionMet = true;
  let datePrerequisiteText = "";
  if (isDateTrigger && !isAlreadyReady && term.triggerDate) {
    const todayWib = getBusinessDateWib();
    dateConditionMet = todayWib >= term.triggerDate;
    datePrerequisiteText = dateConditionMet
      ? `Tanggal pemicu ${formatDateWibDisplay(term.triggerDate)} (WIB) telah tercapai.`
      : `Tanggal pemicu ${formatDateWibDisplay(term.triggerDate)} (WIB) belum tiba (hari ini WIB: ${formatDateWibDisplay(todayWib)}).`;
  }

  const canUpload =
    isAlreadyReady ||
    ((!isSprintTrigger || sprintConditionMet) && (!isDateTrigger || dateConditionMet));

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canUpload) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!canUpload) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format berkas tidak valid. Harap unggah dokumen PDF atau gambar (JPG/PNG).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran berkas melebihi batas maksimum 10MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canUpload) {
      toast.error(
        sprintPrerequisiteText ||
          datePrerequisiteText ||
          "Prasyarat pemicu termin belum terpenuhi."
      );
      return;
    }

    if (!selectedFile) {
      toast.error("Harap pilih berkas BAST terlebih dahulu.");
      return;
    }

    uploadMutation.mutate(
      {
        termId: term.id,
        projectId,
        file: selectedFile,
      },
      {
        onSuccess: () => {
          setSelectedFile(null);
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) setSelectedFile(null);
        onOpenChange(val);
      }}
    >
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Upload04Icon} className="size-4.5" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Unggah Dokumen BAST (Opsional)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Termin #{term.termNumber}: {term.title} ({term.percentage}%)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {isSprintTrigger && !isAlreadyReady && (
            <div
              role="status"
              className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                sprintConditionMet
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200"
                  : "bg-destructive/10 border-destructive/20 text-destructive"
              }`}
            >
              <HugeiconsIcon
                icon={sprintConditionMet ? CheckmarkCircle02Icon : AlertCircleIcon}
                className="size-4 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <HugeiconsIcon icon={FastForwardIcon} className="size-3.5" aria-hidden="true" />
                  Pemicu Sprint ({term.requiredCompletedSprints ?? 1} Sprint Selesai)
                </div>
                <p className="text-[11px] leading-relaxed">{sprintPrerequisiteText}</p>
              </div>
            </div>
          )}

          {isDateTrigger && !isAlreadyReady && (
            <div
              role="status"
              className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                dateConditionMet
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200"
                  : "bg-destructive/10 border-destructive/20 text-destructive"
              }`}
            >
              <HugeiconsIcon
                icon={dateConditionMet ? CheckmarkCircle02Icon : AlertCircleIcon}
                className="size-4 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <HugeiconsIcon icon={Calendar01Icon} className="size-3.5" aria-hidden="true" />
                  Pemicu Tanggal (WIB)
                </div>
                <p className="text-[11px] leading-relaxed">{datePrerequisiteText}</p>
              </div>
            </div>
          )}

          {/* Area Unggah Berkas */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              !canUpload
                ? "bg-muted/30 border-muted opacity-60"
                : dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-card hover:bg-muted/20"
            }`}
          >
            <input
              ref={fileInputRef}
              id="bast-file-input"
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              disabled={!canUpload}
              onChange={handleFileChange}
              className="sr-only"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <HugeiconsIcon icon={File01Icon} className="size-5.5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground truncate max-w-[260px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="rounded-full text-[11px] h-7 px-3 text-destructive hover:bg-destructive/10"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3 mr-1" aria-hidden="true" />
                  Ganti File
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2.5">
                <div className="size-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                  <HugeiconsIcon icon={Upload04Icon} className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Seret berkas BAST ke area ini
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Mendukung PDF, PNG, JPG hingga 10MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canUpload}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full text-xs h-8 px-4"
                >
                  Pilih Berkas BAST
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-full text-xs h-8.5 px-3.5"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!canUpload || uploadMutation.isPending}
              className="rounded-full text-xs h-8.5 px-4 font-semibold shadow-xs"
            >
              {uploadMutation.isPending
                ? "Mengunggah..."
                : isAlreadyReady
                ? "Simpan Dokumen BAST"
                : "Unggah & Tandai Siap Ditagih"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
