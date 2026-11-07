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

  // Cek jika trigger berbasis sprint
  const isSprintTrigger = term.triggerType === "sprint";
  const linkedSprint = isSprintTrigger
    ? sprints.find((s) => s.id === term.triggerSprintId) || term.triggerSprint
    : null;

  const isSprintCompleted = linkedSprint?.status === "completed";
  const canUpload = !isSprintTrigger || isSprintCompleted;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      toast.error("Ukuran berkas melebihi batas maksimum 10MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Harap pilih berkas BAST terlebih dahulu");
      return;
    }

    if (!canUpload) {
      toast.error("Sprint terkait belum berstatus Selesai (Completed). BAST belum dapat diunggah.");
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
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Upload04Icon} className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Unggah Bukti BAST Termin #{term.termNumber}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {term.title} (Bobot {term.percentage}%)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Peringatan Prasyarat Sprint */}
          {isSprintTrigger && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                isSprintCompleted
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-200"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-200"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                <HugeiconsIcon
                  icon={isSprintCompleted ? CheckmarkCircle02Icon : AlertCircleIcon}
                  className="size-4"
                />
              </div>
              <div className="space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <HugeiconsIcon icon={FastForwardIcon} className="size-3" />
                  Trigger Modul Sprint: {linkedSprint?.name || "Sprint Terkait"}
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {isSprintCompleted
                    ? "Sprint telah ditandai Selesai (Completed). Anda dapat mengunggah dokumen BAST untuk mengubah status termin ke Siap Ditagih."
                    : `Sprint masih berstatus '${linkedSprint?.status || "Belum Selesai"}'. Seluruh task sprint harus diselesaikan terlebih dahulu sebelum BAST dapat diserahkan.`}
                </p>
              </div>
            </div>
          )}

          {/* Area Unggah Berkas */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => canUpload && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              !canUpload
                ? "bg-muted/30 border-muted opacity-60 cursor-not-allowed"
                : dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-card hover:bg-muted/20"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              disabled={!canUpload}
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <HugeiconsIcon icon={File01Icon} className="size-5.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground truncate max-w-[260px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || "Dokumen"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="rounded-full text-[11px] h-7 px-3 text-destructive hover:bg-destructive/10"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3 mr-1" />
                  Ganti File
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="size-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                  <HugeiconsIcon icon={Upload04Icon} className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Klik untuk pilih dokumen BAST atau seret ke sini
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Mendukung PDF, PNG, JPG hingga 10MB
                  </p>
                </div>
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
              disabled={!selectedFile || !canUpload || uploadMutation.isPending}
              className="rounded-full text-xs h-8.5 px-4 font-semibold shadow-xs"
            >
              {uploadMutation.isPending ? "Mengunggah..." : "Unggah & Tandai Siap Ditagih"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
