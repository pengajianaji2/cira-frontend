"use client";

import React, { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit02Icon } from "@hugeicons/core-free-icons";
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
import { Spinner } from "@/components/ui/spinner";
import { useUpdateContractValueMutation } from "../queries/finance.queries";

interface UpdateContractValueDialogProps {
  projectId: string;
  currentValue?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateContractValueDialog({
  projectId,
  currentValue = 0,
  open,
  onOpenChange,
}: UpdateContractValueDialogProps) {
  const [valStr, setValStr] = useState(currentValue.toString());
  const updateMutation = useUpdateContractValueMutation();

  useEffect(() => {
    setValStr(currentValue.toString());
  }, [currentValue, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(valStr.replace(/[^0-9]/g, ""));
    updateMutation.mutate(
      {
        projectId,
        contractValue: num,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Edit02Icon} className="size-4.5 text-primary" />
              Ubah Nilai Kontrak Proyek
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Perbarui nilai kesepakatan kontrak finansial resmi untuk proyek ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="contract-value-input" className="text-xs font-semibold">
              Total Nilai Kontrak (Rp)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                Rp
              </span>
              <Input
                id="contract-value-input"
                type="number"
                value={valStr}
                onChange={(e) => setValStr(e.target.value)}
                placeholder="45000000"
                className="h-9 text-xs pl-9 rounded-xl font-semibold"
                required
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
              disabled={updateMutation.isPending}
              className="rounded-full text-xs h-8 px-4 font-semibold"
            >
              {updateMutation.isPending ? (
                <Spinner className="size-3.5 mr-1.5" />
              ) : null}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
