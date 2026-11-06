"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useCreatePaymentMutation } from "../queries/finance.queries";

interface CreatePaymentDialogProps {
  projectId: string;
  contractValue?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePaymentDialog({
  projectId,
  contractValue = 0,
  open,
  onOpenChange,
}: CreatePaymentDialogProps) {
  const [title, setTitle] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const createMutation = useCreatePaymentMutation();

  const handlePercentageQuickPick = (pct: number) => {
    if (contractValue > 0) {
      const calculated = Math.round((contractValue * pct) / 100);
      setAmountStr(calculated.toString());
      if (!title) {
        setTitle(`Termin ${pct}%`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Nama termin pembayaran wajib diisi.");
      return;
    }

    const amount = Number(amountStr.replace(/[^0-9]/g, ""));
    if (!amount || amount <= 0) {
      setErrorMsg("Nominal pembayaran harus lebih besar dari Rp 0.");
      return;
    }

    createMutation.mutate(
      {
        projectId,
        input: {
          title: title.trim(),
          amount,
          dueDate: dueDate || undefined,
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setTitle("");
          setAmountStr("");
          setDueDate("");
          setNotes("");
          onOpenChange(false);
        },
        onError: (err: Error) => {
          setErrorMsg(err?.message || "Gagal menyimpan termin pembayaran.");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Add01Icon} className="size-4.5 text-primary" />
              Tambah Termin Pembayaran
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Catat rencana pembayaran termin baru untuk proyek ini (Status awal: Pending).
            </DialogDescription>
          </DialogHeader>

          {errorMsg && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-3 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="payment-title" className="text-xs font-semibold">
                Nama / Judul Termin <span className="text-destructive">*</span>
              </Label>
              <Input
                id="payment-title"
                placeholder="Contoh: Termin 1 (DP 50%)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>

            {/* Quick Percentage Buttons */}
            {contractValue > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground text-[11px]">Hitung cepat:</span>
                {[20, 30, 50].map((pct) => (
                  <Button
                    key={pct}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePercentageQuickPick(pct)}
                    className="text-[11px] h-6 px-2.5 rounded-full"
                  >
                    {pct}% Kontrak
                  </Button>
                ))}
              </div>
            )}

            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="payment-amount" className="text-xs font-semibold">
                Nominal Pembayaran (Rp) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="payment-amount"
                  type="number"
                  placeholder="22500000"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="h-9 text-xs pl-9 rounded-xl font-medium"
                  required
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label htmlFor="payment-dueDate" className="text-xs font-semibold">
                Estimasi Jatuh Tempo (Opsional)
              </Label>
              <Input
                id="payment-dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="payment-notes" className="text-xs font-semibold">
                Catatan / Syarat Termin (Opsional)
              </Label>
              <Textarea
                id="payment-notes"
                placeholder="Contoh: Dibayarkan setelah verifikasi desain wireframe dan skema database."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="text-xs rounded-xl resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-full text-xs h-8 px-4"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              className="rounded-full text-xs h-8 px-4 font-semibold"
            >
              {createMutation.isPending ? (
                <Spinner className="size-3.5 mr-1.5" />
              ) : (
                <HugeiconsIcon icon={Add01Icon} className="size-3.5 mr-1.5" />
              )}
              Simpan Termin
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
