"use client";

import React, { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarEvent } from "../types/operations.types";
import { useCancelOperationalEventMutation } from "../queries/operations.queries";

interface CancelAgendaDialogProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled?: () => void;
}

export function CancelAgendaDialog({
  event,
  open,
  onOpenChange,
  onCancelled,
}: CancelAgendaDialogProps) {
  const [cancelReason, setCancelReason] = useState("");
  const cancelMutation = useCancelOperationalEventMutation();

  useEffect(() => {
    if (open) {
      setCancelReason("");
    }
  }, [open, event?.sourceId]);

  if (!event || event.sourceType !== "operational_event") return null;

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    cancelMutation.mutate(
      {
        id: event.sourceId,
        input: cancelReason.trim() ? { cancelReason: cancelReason.trim() } : {},
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          onCancelled?.();
        },
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl max-w-md">
        <AlertDialogHeader>
          <div className="size-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-1">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-5.5" aria-hidden="true" />
          </div>
          <AlertDialogTitle className="text-base font-bold text-foreground">
            Batalkan Agenda Operasional?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Agenda <strong className="text-foreground">&ldquo;{event.title}&rdquo;</strong> akan
            diubah statusnya menjadi{" "}
            <span className="font-mono text-foreground font-semibold">cancelled</span> tanpa
            dihapus permanen dari database demi menjaga jejak audit.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="cancel-agenda-reason" className="text-xs font-semibold text-foreground">
            Alasan Pembatalan (Opsional)
          </Label>
          <Input
            id="cancel-agenda-reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Misal: Klien menjadwal ulang ke minggu depan"
            className="h-9 text-xs rounded-xl"
            maxLength={1000}
            disabled={cancelMutation.isPending}
          />
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            disabled={cancelMutation.isPending}
            className="rounded-full text-xs h-9"
          >
            Kembali
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={cancelMutation.isPending}
            onClick={handleConfirm}
            className="rounded-full text-xs h-9 font-semibold"
          >
            {cancelMutation.isPending ? "Membatalkan..." : "Ya, Batalkan Agenda"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
