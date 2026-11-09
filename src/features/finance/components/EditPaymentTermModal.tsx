"use client";

import React, { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Edit02Icon,
  AlertCircleIcon,
  Calendar01Icon,
  FastForwardIcon,
  InformationCircleIcon,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { isValidDateOnly } from "@/shared/lib/business-date";
import { PaymentTerm, TermTriggerType, UpdateTermInput } from "../types/finance.types";
import { useUpdateTermMutation } from "../queries/finance.queries";
import { extractDateOnly, formatRupiah } from "../utils/finance.formatters";

interface EditPaymentTermModalProps {
  projectId: string;
  term: PaymentTerm | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPaymentTermModal({
  projectId,
  term,
  open,
  onOpenChange,
}: EditPaymentTermModalProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [triggerType, setTriggerType] = useState<TermTriggerType>("manual");
  const [triggerDate, setTriggerDate] = useState("");
  const [requiredCompletedSprints, setRequiredCompletedSprints] = useState("1");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const updateTermMutation = useUpdateTermMutation();

  useEffect(() => {
    if (open && term) {
      setTitle(term.title);
      setNotes(term.notes || "");
      setTriggerType(term.triggerType);
      setTriggerDate(extractDateOnly(term.triggerDate || term.dueDate));
      setRequiredCompletedSprints(
        term.requiredCompletedSprints != null ? String(term.requiredCompletedSprints) : "1"
      );
      setTouched({});
      setSubmitted(false);
    }
  }, [open, term]);

  if (!term) return null;

  const canEditTrigger = term.status === "planned" && !term.isLocked;

  const titleError = !title.trim() ? "Judul termin wajib diisi." : null;
  const dateError =
    canEditTrigger && triggerType === "date"
      ? !triggerDate.trim()
        ? "Tanggal pemicu (WIB) wajib dipilih."
        : !isValidDateOnly(triggerDate.trim())
        ? "Format tanggal harus YYYY-MM-DD."
        : null
      : null;

  const sprintValue = Number(requiredCompletedSprints);
  const sprintError =
    canEditTrigger && triggerType === "sprint"
      ? !requiredCompletedSprints.trim() || !Number.isInteger(sprintValue) || sprintValue < 1
        ? "Masukkan bilangan bulat positif minimal 1 sprint."
        : null
      : null;

  const showTitleErr = (touched.title || submitted) && Boolean(titleError);
  const showDateErr = (touched.triggerDate || submitted) && Boolean(dateError);
  const showSprintErr = (touched.requiredCompletedSprints || submitted) && Boolean(sprintError);

  const markTouched = (field: string) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  };

  const handleTriggerChange = (nextType: TermTriggerType) => {
    setTriggerType(nextType);
    if (nextType === "sprint") {
      const parsed = Number(requiredCompletedSprints);
      if (!Number.isInteger(parsed) || parsed < 1) {
        setRequiredCompletedSprints("1");
      }
      setTriggerDate("");
    } else if (nextType === "date") {
      setRequiredCompletedSprints("");
    } else {
      setTriggerDate("");
      setRequiredCompletedSprints("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (titleError || dateError || sprintError) {
      toast.error(titleError || dateError || sprintError || "Periksa isian termin.");
      requestAnimationFrame(() => {
        const firstInvalid = formRef.current?.querySelector<HTMLElement>(
          '[aria-invalid="true"]'
        );
        firstInvalid?.focus();
      });
      return;
    }

    const input: UpdateTermInput = {
      title: title.trim(),
      notes: notes.trim() ? notes.trim() : null,
    };

    if (canEditTrigger) {
      input.triggerType = triggerType;
      if (triggerType === "date") {
        input.triggerDate = triggerDate.trim();
        input.requiredCompletedSprints = null;
      } else if (triggerType === "sprint") {
        input.triggerDate = null;
        input.requiredCompletedSprints = Number(requiredCompletedSprints);
      } else {
        input.triggerDate = null;
        input.requiredCompletedSprints = null;
      }
    }

    updateTermMutation.mutate(
      {
        termId: term.id,
        projectId,
        input,
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
      <DialogContent className="max-w-lg rounded-3xl p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Edit02Icon} className="size-4.5" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Ubah Termin #{term.termNumber}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Bobot <span className="font-mono font-semibold">{term.percentage}%</span> •{" "}
                <span className="font-mono font-semibold">{formatRupiah(term.amount)}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form ref={formRef} noValidate onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="edit-term-title" className="text-xs font-semibold text-foreground">
              Nama / Deskripsi Termin <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-term-title"
              required
              value={title}
              aria-invalid={showTitleErr ? "true" : undefined}
              aria-describedby={showTitleErr ? "edit-term-title-error" : undefined}
              onBlur={() => markTouched("title")}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-xs rounded-xl"
            />
            {showTitleErr && titleError && (
              <p
                id="edit-term-title-error"
                role="alert"
                className="text-[11px] text-destructive flex items-center gap-1"
              >
                <HugeiconsIcon icon={AlertCircleIcon} className="size-3 shrink-0" aria-hidden="true" />
                <span>{titleError}</span>
              </p>
            )}
          </div>

          {canEditTrigger ? (
            <>
              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold text-foreground">
                  Pemicu Kesiapan Termin (Tepat Satu)
                </legend>
                <RadioGroup
                  value={triggerType}
                  onValueChange={(val) => handleTriggerChange(val as TermTriggerType)}
                  className="grid grid-cols-1 gap-2"
                >
                  <Label
                    htmlFor="edit-trigger-manual"
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer ${
                      triggerType === "manual"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <RadioGroupItem id="edit-trigger-manual" value="manual" />
                    <div className="text-xs">
                      <span className="font-semibold text-foreground">Manual</span>
                      <span className="text-muted-foreground ml-1.5">
                        (Ditandai siap secara manual oleh Owner/Operasional)
                      </span>
                    </div>
                  </Label>

                  <Label
                    htmlFor="edit-trigger-sprint"
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer ${
                      triggerType === "sprint"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <RadioGroupItem id="edit-trigger-sprint" value="sprint" />
                    <div className="text-xs flex items-center gap-1.5">
                      <HugeiconsIcon icon={FastForwardIcon} className="size-3.5 text-primary" aria-hidden="true" />
                      <span className="font-semibold text-foreground">Jumlah Sprint Selesai</span>
                    </div>
                  </Label>

                  <Label
                    htmlFor="edit-trigger-date"
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer ${
                      triggerType === "date"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <RadioGroupItem id="edit-trigger-date" value="date" />
                    <div className="text-xs flex items-center gap-1.5">
                      <HugeiconsIcon icon={Calendar01Icon} className="size-3.5 text-primary" aria-hidden="true" />
                      <span className="font-semibold text-foreground">Tanggal Target (WIB)</span>
                    </div>
                  </Label>
                </RadioGroup>
              </fieldset>

              {triggerType === "sprint" && (
                <div className="space-y-1">
                  <Label
                    htmlFor="edit-term-sprint-count"
                    className="text-xs font-semibold text-foreground"
                  >
                    Target Jumlah Sprint Selesai <span className="text-destructive">*</span>
                  </Label>
                  <span id="edit-sprint-hint" className="text-[11px] text-muted-foreground block">
                    Minimal 1 sprint selesai. Jika sudah tercapai, status otomatis menjadi Siap Ditagih.
                  </span>
                  <Input
                    id="edit-term-sprint-count"
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    required
                    value={requiredCompletedSprints}
                    aria-invalid={showSprintErr ? "true" : undefined}
                    aria-describedby={showSprintErr ? "edit-sprint-error" : "edit-sprint-hint"}
                    onBlur={() => markTouched("requiredCompletedSprints")}
                    onChange={(e) => setRequiredCompletedSprints(e.target.value)}
                    className="h-9 text-xs font-mono rounded-xl"
                  />
                  {showSprintErr && sprintError && (
                    <p
                      id="edit-sprint-error"
                      role="alert"
                      className="text-[11px] text-destructive flex items-center gap-1"
                    >
                      <HugeiconsIcon icon={AlertCircleIcon} className="size-3 shrink-0" aria-hidden="true" />
                      <span>{sprintError}</span>
                    </p>
                  )}
                </div>
              )}

              {triggerType === "date" && (
                <div className="space-y-1">
                  <Label
                    htmlFor="edit-term-trigger-date"
                    className="text-xs font-semibold text-foreground"
                  >
                    Tanggal Pemicu Kesiapan (WIB) <span className="text-destructive">*</span>
                  </Label>
                  <span id="edit-date-hint" className="text-[11px] text-muted-foreground block">
                    Dievaluasi pada zona waktu Asia/Jakarta (WIB).
                  </span>
                  <Input
                    id="edit-term-trigger-date"
                    type="date"
                    required
                    value={triggerDate}
                    aria-invalid={showDateErr ? "true" : undefined}
                    aria-describedby={showDateErr ? "edit-date-error" : "edit-date-hint"}
                    onBlur={() => markTouched("triggerDate")}
                    onChange={(e) => setTriggerDate(e.target.value)}
                    className="h-9 text-xs font-mono rounded-xl"
                  />
                  {showDateErr && dateError && (
                    <p
                      id="edit-date-error"
                      role="alert"
                      className="text-[11px] text-destructive flex items-center gap-1"
                    >
                      <HugeiconsIcon icon={AlertCircleIcon} className="size-3 shrink-0" aria-hidden="true" />
                      <span>{dateError}</span>
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div
              role="status"
              className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-900 flex items-start gap-2"
            >
              <HugeiconsIcon icon={InformationCircleIcon} className="size-4 shrink-0 text-sky-600 mt-0.5" aria-hidden="true" />
              <span>
                Termin sudah berstatus <strong>Siap Ditagih</strong>, sehingga konfigurasi pemicu tidak dapat diubah lagi. Anda tetap dapat memperbarui nama atau catatan termin.
              </span>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="edit-term-notes" className="text-xs font-semibold text-foreground">
              Catatan Termin (Opsional)
            </Label>
            <Input
              id="edit-term-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan..."
              className="h-9 text-xs rounded-xl"
            />
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-full text-xs h-8.5 px-4"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateTermMutation.isPending}
              className="rounded-full text-xs h-8.5 px-4 font-semibold shadow-xs"
            >
              {updateTermMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
