"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, MailSend01Icon } from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useCreateStatusRequestMutation } from "../queries/governance.queries";
import { ProjectStatus } from "../types/projects.types";

interface RequestStatusDialogProps {
  projectId: string;
  currentStatus: ProjectStatus;
  trigger?: React.ReactNode;
}

const statusOptions: { value: ProjectStatus; label: string; desc: string }[] = [
  { value: "lead", label: "Lead", desc: "Tahap inisiasi prospek dan penawaran" },
  { value: "active", label: "Active", desc: "Tahap pengerjaan sprint & modul aktif" },
  { value: "completed", label: "Completed", desc: "Tahap serah terima dan proyek selesai" },
  { value: "cancelled", label: "Cancelled", desc: "Proyek dihentikan atau dibatalkan" },
];

export function RequestStatusDialog({
  projectId,
  currentStatus,
  trigger,
}: RequestStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<ProjectStatus | "">("");
  const [reason, setReason] = useState("");

  const createRequestMutation = useCreateStatusRequestMutation(projectId);

  const availableOptions = statusOptions.filter((opt) => opt.value !== currentStatus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStatus || !reason.trim()) return;

    createRequestMutation.mutate(
      {
        targetStatus,
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTargetStatus("");
          setReason("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full text-xs h-8 px-3 border-border text-foreground hover:bg-muted font-medium"
          >
            <HugeiconsIcon icon={MailSend01Icon} className="size-3.5 mr-1.5" />
            Ajukan Perubahan Status
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Pengajuan Perubahan Status Proyek
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Perubahan status proyek memerlukan konsensus voting dari seluruh anggota roster.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            {/* Status Flow Indicator */}
            <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-2xl border border-border text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground block font-medium">Status Saat Ini:</span>
                <Badge variant="outline" className="text-xs capitalize font-semibold mt-0.5">
                  {currentStatus}
                </Badge>
              </div>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground shrink-0 mx-2" />
              <div>
                <span className="text-[10px] text-muted-foreground block font-medium">Target Status:</span>
                <Badge className="text-xs capitalize font-bold mt-0.5 bg-primary/20 text-primary">
                  {targetStatus || "Pilih Target"}
                </Badge>
              </div>
            </div>

            {/* Target Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Pilih Target Status Baru <span className="text-destructive">*</span>
              </label>
              <Select
                value={targetStatus}
                onValueChange={(val) => setTargetStatus(val as ProjectStatus)}
              >
                <SelectTrigger className="w-full text-xs rounded-xl h-10">
                  <SelectValue placeholder="Pilih target status baru..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {availableOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      <div className="py-0.5">
                        <span className="font-semibold block">{opt.label}</span>
                        <span className="text-[10px] text-muted-foreground block">{opt.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Alasan Pengajuan Status <span className="text-destructive">*</span>
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Jelaskan dasar pertimbangan (misal: DP telah terverifikasi, seluruh modul sprint telah selesai di-deploy)..."
                rows={3}
                required
                className="text-xs rounded-xl"
              />
              <span className="text-[10px] text-muted-foreground block">
                Minimal 3 karakter. Alasan akan dibaca oleh anggota roster saat melakukan voting.
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="rounded-full text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createRequestMutation.isPending || !targetStatus || reason.trim().length < 3}
              className="rounded-full text-xs font-semibold shadow-xs"
            >
              {createRequestMutation.isPending ? <Spinner className="size-3 mr-1" /> : null}
              Kirim Pengajuan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
