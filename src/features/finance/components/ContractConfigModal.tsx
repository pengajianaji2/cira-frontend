"use client";

import React, { useState, useEffect, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Delete02Icon,
  Coins01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  InformationCircleIcon,
  Calendar01Icon,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { isValidDateOnly } from "@/shared/lib/business-date";
import {
  PaymentTerm,
  TermTriggerType,
  TerminInput,
} from "../types/finance.types";
import { useCreateContractMutation } from "../queries/finance.queries";
import { extractDateOnly, formatRupiah } from "../utils/finance.formatters";

interface ContractConfigModalProps {
  projectId: string;
  initialContractValue: number;
  existingTerms?: PaymentTerm[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TermRowState {
  id?: string;
  title: string;
  percentage: number;
  triggerType: TermTriggerType;
  triggerDate: string;
  requiredCompletedSprints: string;
  notes: string;
  isLocked?: boolean;
}

const DEFAULT_TEMPLATE_TERMS: TermRowState[] = [
  {
    title: "Termin 1 - DP Kick-off",
    percentage: 30,
    triggerType: "manual",
    triggerDate: "",
    requiredCompletedSprints: "",
    notes: "Down payment sebelum pengerjaan proyek dimulai",
  },
  {
    title: "Termin 2 - Penyelesaian Tahap Inti",
    percentage: 40,
    triggerType: "sprint",
    triggerDate: "",
    requiredCompletedSprints: "1",
    notes: "Siap ditagih setelah target jumlah sprint selesai tercapai",
  },
  {
    title: "Termin 3 - Pelunasan Akhir & Serah Terima",
    percentage: 30,
    triggerType: "date",
    triggerDate: "",
    requiredCompletedSprints: "",
    notes: "Pelunasan akhir sesuai jadwal serah terima proyek",
  },
];

export function ContractConfigModal({
  projectId,
  initialContractValue,
  existingTerms = [],
  open,
  onOpenChange,
}: ContractConfigModalProps) {
  const [contractValueInput, setContractValueInput] = useState<string>(
    initialContractValue > 0 ? String(initialContractValue) : ""
  );
  const [terms, setTerms] = useState<TermRowState[]>(DEFAULT_TEMPLATE_TERMS);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const wasOpenRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const createContractMutation = useCreateContractMutation();

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setContractValueInput(initialContractValue > 0 ? String(initialContractValue) : "");
      setTouched({});
      setSubmitted(false);

      if (existingTerms.length > 0) {
        setTerms(
          existingTerms.map((t) => ({
            id: t.id,
            title: t.title,
            percentage: t.percentage,
            triggerType: t.triggerType,
            triggerDate: extractDateOnly(t.triggerDate || t.dueDate),
            requiredCompletedSprints:
              t.requiredCompletedSprints != null
                ? String(t.requiredCompletedSprints)
                : t.triggerType === "sprint"
                ? "1"
                : "",
            notes: t.notes || "",
            isLocked: t.isLocked,
          }))
        );
      } else {
        setTerms(DEFAULT_TEMPLATE_TERMS.map((item) => ({ ...item })));
      }
    }
    wasOpenRef.current = open;
  }, [open, initialContractValue, existingTerms]);

  const contractValue = Number(contractValueInput) || 0;
  const totalPercentage = terms.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0);
  const isExact100 = Math.abs(totalPercentage - 100) < 0.001;
  const hasLockedTerms = terms.some((t) => t.isLocked);

  const markTouched = (key: string) => {
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  };

  const getContractValueError = (): string | null => {
    if (!contractValueInput.trim() || contractValue <= 0) {
      return "Nilai kontrak proyek wajib lebih dari Rp 0.";
    }
    return null;
  };

  const getRowErrors = (term: TermRowState) => {
    const errors: {
      title?: string;
      percentage?: string;
      triggerDate?: string;
      requiredCompletedSprints?: string;
    } = {};

    if (!term.title.trim()) {
      errors.title = "Nama termin wajib diisi.";
    }
    if (!term.percentage || term.percentage <= 0 || term.percentage > 100) {
      errors.percentage = "Bobot harus 1–100%.";
    }
    if (term.triggerType === "date") {
      if (!term.triggerDate.trim()) {
        errors.triggerDate = "Tanggal pemicu (WIB) wajib dipilih.";
      } else if (!isValidDateOnly(term.triggerDate.trim())) {
        errors.triggerDate = "Gunakan format tanggal YYYY-MM-DD yang valid.";
      }
    }
    if (term.triggerType === "sprint") {
      const parsed = Number(term.requiredCompletedSprints);
      if (
        !term.requiredCompletedSprints.trim() ||
        !Number.isInteger(parsed) ||
        parsed < 1
      ) {
        errors.requiredCompletedSprints =
          "Masukkan bilangan bulat positif minimal 1 sprint selesai.";
      }
    }

    return errors;
  };

  const calculateRowAmount = (index: number, percentage: number): number => {
    if (contractValue <= 0 || terms.length === 0) return 0;

    if (index === terms.length - 1) {
      let sumPrev = 0;
      for (let i = 0; i < terms.length - 1; i++) {
        sumPrev += Math.round((contractValue * ((Number(terms[i].percentage) || 0) / 100)) * 100) / 100;
      }
      return Math.max(0, Math.round((contractValue - sumPrev) * 100) / 100);
    }

    return Math.round((contractValue * ((Number(percentage) || 0) / 100)) * 100) / 100;
  };

  const handleAddTerm = () => {
    const remaining = Math.max(0, 100 - totalPercentage);
    const nextNumber = terms.length + 1;
    setTerms((prev) => [
      ...prev,
      {
        title: `Termin ${nextNumber}`,
        percentage: remaining > 0 ? remaining : 10,
        triggerType: "manual",
        triggerDate: "",
        requiredCompletedSprints: "",
        notes: "",
      },
    ]);
  };

  const handleRemoveTerm = (index: number) => {
    if (terms.length <= 1) {
      toast.error("Minimal harus ada 1 termin pembayaran dalam kontrak.");
      return;
    }
    if (terms[index]?.isLocked) {
      toast.error("Termin yang sudah terkunci atau memiliki invoice tidak dapat dihapus.");
      return;
    }
    setTerms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (
    index: number,
    patch: Partial<TermRowState>
  ) => {
    setTerms((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const handleTriggerTypeChange = (index: number, nextType: TermTriggerType) => {
    setTerms((prev) => {
      const next = [...prev];
      const current = next[index];
      if (nextType === "date") {
        next[index] = {
          ...current,
          triggerType: "date",
          requiredCompletedSprints: "",
        };
      } else if (nextType === "sprint") {
        const currentSprints = Number(current.requiredCompletedSprints);
        next[index] = {
          ...current,
          triggerType: "sprint",
          triggerDate: "",
          requiredCompletedSprints:
            Number.isInteger(currentSprints) && currentSprints >= 1
              ? String(currentSprints)
              : "1",
        };
      } else {
        next[index] = {
          ...current,
          triggerType: "manual",
          triggerDate: "",
          requiredCompletedSprints: "",
        };
      }
      return next;
    });
  };

  const focusFirstInvalidControl = () => {
    requestAnimationFrame(() => {
      const firstInvalid = formRef.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]'
      );
      firstInvalid?.focus();
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (hasLockedTerms) {
      toast.error(
        "Kontrak tidak dapat disusun ulang karena sudah ada termin yang terkunci invoice."
      );
      return;
    }

    const contractErr = getContractValueError();
    if (contractErr) {
      toast.error(contractErr);
      focusFirstInvalidControl();
      return;
    }

    if (terms.length === 0) {
      toast.error("Minimal harus ada 1 termin pembayaran.");
      return;
    }

    if (!isExact100) {
      toast.error(
        `Total persentase seluruh termin wajib tepat 100%. Saat ini: ${totalPercentage}%.`
      );
      focusFirstInvalidControl();
      return;
    }

    for (let i = 0; i < terms.length; i++) {
      const errs = getRowErrors(terms[i]);
      const firstError =
        errs.title || errs.percentage || errs.triggerDate || errs.requiredCompletedSprints;
      if (firstError) {
        toast.error(`Termin #${i + 1}: ${firstError}`);
        focusFirstInvalidControl();
        return;
      }
    }

    const payloadTerms: TerminInput[] = terms.map((t) => {
      const base = {
        title: t.title.trim(),
        percentage: Number(t.percentage),
        triggerType: t.triggerType,
        notes: t.notes.trim() ? t.notes.trim() : null,
      };

      if (t.triggerType === "date") {
        return {
          ...base,
          triggerDate: t.triggerDate.trim(),
          requiredCompletedSprints: null,
        };
      }

      if (t.triggerType === "sprint") {
        return {
          ...base,
          triggerDate: null,
          requiredCompletedSprints: Number(t.requiredCompletedSprints),
        };
      }

      return {
        ...base,
        triggerDate: null,
        requiredCompletedSprints: null,
      };
    });

    createContractMutation.mutate(
      {
        projectId,
        input: {
          contractValue,
          terms: payloadTerms,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const contractErr = getContractValueError();
  const showContractErr = (touched["contractValue"] || submitted) && Boolean(contractErr);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-3xl">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-card">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Coins01Icon} className="size-4.5" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Konfigurasi Kontrak & Termin Berbobot 100%
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Tetapkan nilai kontrak dan pilih tepat satu pemicu kesiapan tiap termin (Tanggal WIB, Jumlah Sprint Selesai, atau Manual).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form ref={formRef} noValidate onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {hasLockedTerms && (
            <div
              role="status"
              className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200"
            >
              <HugeiconsIcon
                icon={InformationCircleIcon}
                className="size-4 shrink-0 text-amber-600 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold">Sebagian Termin Sudah Terkunci Invoice</p>
                <p className="opacity-90 mt-0.5">
                  Konfigurasi kontrak berbobot 100% tidak dapat di-reset setelah ada invoice terbit. Gunakan aksi edit per baris pada termin yang masih terbuka.
                </p>
              </div>
            </div>
          )}

          {/* Bagian Nilai Kontrak */}
          <div className="bg-muted/40 p-4.5 rounded-2xl border border-border space-y-2.5">
            <Label htmlFor="contract-value-input" className="text-xs font-semibold text-foreground">
              Total Nilai Kontrak Proyek (IDR) <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              <div className="space-y-1">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    id="contract-value-input"
                    name="contractValue"
                    type="number"
                    min={1}
                    step={1000}
                    required
                    disabled={hasLockedTerms}
                    value={contractValueInput}
                    aria-invalid={showContractErr ? "true" : undefined}
                    aria-describedby={showContractErr ? "contract-value-error" : "contract-value-hint"}
                    onBlur={() => markTouched("contractValue")}
                    onChange={(e) => setContractValueInput(e.target.value)}
                    placeholder="Contoh: 50000000"
                    className="pl-10 text-sm font-mono font-semibold rounded-xl h-10"
                  />
                </div>
                {showContractErr && contractErr ? (
                  <p
                    id="contract-value-error"
                    role="alert"
                    className="text-[11px] text-destructive flex items-center gap-1"
                  >
                    <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>{contractErr}</span>
                  </p>
                ) : (
                  <p id="contract-value-hint" className="text-[11px] text-muted-foreground">
                    Masukkan nilai kontrak total dalam Rupiah.
                  </p>
                )}
              </div>

              <div className="text-xs text-muted-foreground sm:pt-2.5">
                Format Resmi:{" "}
                <span className="font-mono font-bold text-foreground text-sm">
                  {formatRupiah(contractValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Indikator Validasi Total Persentase 100% */}
          <div className="bg-card border border-border p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-foreground">Validasi Total Bobot Termin:</span>
                {isExact100 ? (
                  <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" aria-hidden="true" />
                    Tepat 100% (Valid)
                  </Badge>
                ) : (
                  <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5" aria-hidden="true" />
                    Total: {totalPercentage}% (Wajib 100%)
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isExact100
                  ? "Seluruh termin telah memenuhi syarat 100%. Baris termin terakhir menyerap selisih pembulatan rupiah."
                  : totalPercentage < 100
                  ? `Masih kurang ${100 - totalPercentage}% lagi untuk mencapai total 100%.`
                  : `Kelebihan ${totalPercentage - 100}%. Kurangi persentase pada salah satu termin.`}
              </p>
            </div>

            {!hasLockedTerms && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTerm}
                className="rounded-full text-xs h-8.5 px-3.5 font-medium shrink-0 self-start sm:self-auto"
              >
                <HugeiconsIcon icon={Add01Icon} className="size-3.5 mr-1.5" aria-hidden="true" />
                Tambah Baris Termin
              </Button>
            )}
          </div>

          {/* Daftar Baris Termin */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-foreground flex items-center justify-between gap-2">
              <span>Rincian Tiap Termin ({terms.length} Termin)</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                Pemicu tanggal dievaluasi otomatis harian pada zona waktu Asia/Jakarta (WIB)
              </span>
            </div>

            <div className="space-y-3">
              {terms.map((term, index) => {
                const rowAmount = calculateRowAmount(index, term.percentage);
                const isLast = index === terms.length - 1;
                const rowErrors = getRowErrors(term);

                const showTitleErr =
                  (touched[`title-${index}`] || submitted) && Boolean(rowErrors.title);
                const showPctErr =
                  (touched[`percentage-${index}`] || submitted) && Boolean(rowErrors.percentage);
                const showDateErr =
                  (touched[`triggerDate-${index}`] || submitted) && Boolean(rowErrors.triggerDate);
                const showSprintErr =
                  (touched[`requiredCompletedSprints-${index}`] || submitted) &&
                  Boolean(rowErrors.requiredCompletedSprints);

                const rowDisabled = Boolean(term.isLocked || hasLockedTerms);

                return (
                  <div
                    key={term.id ?? `row-${index}`}
                    className={`p-4 rounded-2xl border transition-all space-y-4 ${
                      term.isLocked
                        ? "bg-muted/30 border-muted opacity-80"
                        : "bg-card border-border hover:border-primary/40 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="size-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center font-mono">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          {term.title || `Termin #${index + 1}`}
                        </span>
                        {isLast && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-2 rounded-full">
                            Penyerap Pembulatan
                          </Badge>
                        )}
                        {term.isLocked && (
                          <Badge variant="outline" className="text-[10px] py-0 px-2 rounded-full text-amber-600 border-amber-500/30">
                            Terkunci (Invoiced)
                          </Badge>
                        )}
                      </div>

                      {!rowDisabled && terms.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Hapus baris termin #${index + 1}`}
                          onClick={() => handleRemoveTerm(index)}
                          className="size-7 text-muted-foreground hover:text-destructive rounded-lg"
                        >
                          <HugeiconsIcon icon={Delete02Icon} className="size-3.5" aria-hidden="true" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                      {/* Judul Termin */}
                      <div className="sm:col-span-5 space-y-1">
                        <Label
                          htmlFor={`term-title-${index}`}
                          className="text-[11px] font-medium text-muted-foreground"
                        >
                          Nama / Deskripsi Termin <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`term-title-${index}`}
                          required
                          disabled={rowDisabled}
                          value={term.title}
                          aria-invalid={showTitleErr ? "true" : undefined}
                          aria-describedby={showTitleErr ? `term-title-error-${index}` : undefined}
                          onBlur={() => markTouched(`title-${index}`)}
                          onChange={(e) => handleUpdateRow(index, { title: e.target.value })}
                          placeholder="Contoh: Termin 1 - DP 30%"
                          className="h-9 text-xs rounded-xl"
                        />
                        {showTitleErr && (
                          <p
                            id={`term-title-error-${index}`}
                            className="text-[11px] text-destructive flex items-center gap-1"
                          >
                            <HugeiconsIcon icon={AlertCircleIcon} className="size-3 shrink-0" aria-hidden="true" />
                            <span>{rowErrors.title}</span>
                          </p>
                        )}
                      </div>

                      {/* Bobot % */}
                      <div className="sm:col-span-3 space-y-1">
                        <Label
                          htmlFor={`term-pct-${index}`}
                          className="text-[11px] font-medium text-muted-foreground"
                        >
                          Bobot (%) <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id={`term-pct-${index}`}
                            type="number"
                            min={1}
                            max={100}
                            step={1}
                            required
                            disabled={rowDisabled}
                            value={term.percentage || ""}
                            aria-invalid={showPctErr ? "true" : undefined}
                            aria-describedby={showPctErr ? `term-pct-error-${index}` : undefined}
                            onBlur={() => markTouched(`percentage-${index}`)}
                            onChange={(e) =>
                              handleUpdateRow(index, { percentage: Number(e.target.value) || 0 })
                            }
                            className="h-9 text-xs font-mono font-semibold rounded-xl pr-7"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted-foreground">
                            %
                          </span>
                        </div>
                        {showPctErr && (
                          <p
                            id={`term-pct-error-${index}`}
                            className="text-[11px] text-destructive flex items-center gap-1"
                          >
                            <HugeiconsIcon icon={AlertCircleIcon} className="size-3 shrink-0" aria-hidden="true" />
                            <span>{rowErrors.percentage}</span>
                          </p>
                        )}
                      </div>

                      {/* Nominal Rupiah */}
                      <div className="sm:col-span-4 space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground block">
                          Kalkulasi Nominal {isLast && "(Otomatis Pas)"}
                        </span>
                        <div className="h-9 px-3 rounded-xl bg-muted/60 border border-border flex items-center justify-between text-xs font-mono font-bold text-foreground">
                          <span>{formatRupiah(rowAmount)}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {term.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Radio Group Pemicu Tunggal (Selection Control Decision Matrix: 3 opsi -> RadioGroup terlihat) */}
                    <fieldset className="space-y-2">
                      <legend className="text-[11px] font-semibold text-foreground">
                        Aturan Pemicu Kesiapan (Pilih Tepat Satu)
                      </legend>

                      <RadioGroup
                        value={term.triggerType}
                        onValueChange={(val) =>
                          handleTriggerTypeChange(index, val as TermTriggerType)
                        }
                        disabled={rowDisabled}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                      >
                        <Label
                          htmlFor={`trigger-${index}-manual`}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                            term.triggerType === "manual"
                              ? "border-primary bg-primary/5"
                              : "border-border bg-background hover:bg-muted/30"
                          }`}
                        >
                          <RadioGroupItem
                            id={`trigger-${index}-manual`}
                            value="manual"
                            className="mt-0.5"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-foreground block">
                              Manual
                            </span>
                            <span className="text-[11px] font-normal text-muted-foreground block leading-snug">
                              Siap saat ditandai pengguna
                            </span>
                          </div>
                        </Label>

                        <Label
                          htmlFor={`trigger-${index}-sprint`}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                            term.triggerType === "sprint"
                              ? "border-primary bg-primary/5"
                              : "border-border bg-background hover:bg-muted/30"
                          }`}
                        >
                          <RadioGroupItem
                            id={`trigger-${index}-sprint`}
                            value="sprint"
                            className="mt-0.5"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                              <HugeiconsIcon icon={FastForwardIcon} className="size-3 text-primary" aria-hidden="true" />
                              Jumlah Sprint Selesai
                            </span>
                            <span className="text-[11px] font-normal text-muted-foreground block leading-snug">
                              Otomatis saat N sprint selesai
                            </span>
                          </div>
                        </Label>

                        <Label
                          htmlFor={`trigger-${index}-date`}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                            term.triggerType === "date"
                              ? "border-primary bg-primary/5"
                              : "border-border bg-background hover:bg-muted/30"
                          }`}
                        >
                          <RadioGroupItem
                            id={`trigger-${index}-date`}
                            value="date"
                            className="mt-0.5"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                              <HugeiconsIcon icon={Calendar01Icon} className="size-3 text-primary" aria-hidden="true" />
                              Tanggal (WIB)
                            </span>
                            <span className="text-[11px] font-normal text-muted-foreground block leading-snug">
                              Otomatis saat tanggal tiba
                            </span>
                          </div>
                        </Label>
                      </RadioGroup>
                    </fieldset>

                    {/* Input Parameter Sesuai Pemicu Terpilih + Catatan */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                      {term.triggerType === "sprint" && (
                        <div className="sm:col-span-5 space-y-1">
                          <Label
                            htmlFor={`term-sprint-threshold-${index}`}
                            className="text-[11px] font-medium text-foreground"
                          >
                            Target Jumlah Sprint Selesai <span className="text-destructive">*</span>
                          </Label>
                          <span
                            id={`term-sprint-hint-${index}`}
                            className="text-[11px] text-muted-foreground block"
                          >
                            Bilangan bulat positif minimal 1 (contoh: 2).
                          </span>
                          <Input
                            id={`term-sprint-threshold-${index}`}
                            type="number"
                            min={1}
                            step={1}
                            inputMode="numeric"
                            required
                            disabled={rowDisabled}
                            value={term.requiredCompletedSprints}
                            aria-invalid={showSprintErr ? "true" : undefined}
                            aria-describedby={
                              showSprintErr
                                ? `term-sprint-error-${index}`
                                : `term-sprint-hint-${index}`
                            }
                            onBlur={() => markTouched(`requiredCompletedSprints-${index}`)}
                            onChange={(e) =>
                              handleUpdateRow(index, {
                                requiredCompletedSprints: e.target.value,
                              })
                            }
                            placeholder="Contoh: 2"
                            className="h-9 text-xs font-mono rounded-xl"
                          />
                          {showSprintErr && (
                            <p
                              id={`term-sprint-error-${index}`}
                              role="alert"
                              className="text-[11px] text-destructive flex items-center gap-1"
                            >
                              <HugeiconsIcon icon={AlertCircleIcon} className="size-3 shrink-0" aria-hidden="true" />
                              <span>{rowErrors.requiredCompletedSprints}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {term.triggerType === "date" && (
                        <div className="sm:col-span-5 space-y-1">
                          <Label
                            htmlFor={`term-trigger-date-${index}`}
                            className="text-[11px] font-medium text-foreground"
                          >
                            Tanggal Pemicu Kesiapan (WIB) <span className="text-destructive">*</span>
                          </Label>
                          <span
                            id={`term-date-hint-${index}`}
                            className="text-[11px] text-muted-foreground block"
                          >
                            Format kalender Asia/Jakarta (terpisah dari jatuh tempo invoice).
                          </span>
                          <Input
                            id={`term-trigger-date-${index}`}
                            type="date"
                            required
                            disabled={rowDisabled}
                            value={term.triggerDate}
                            aria-invalid={showDateErr ? "true" : undefined}
                            aria-describedby={
                              showDateErr ? `term-date-error-${index}` : `term-date-hint-${index}`
                            }
                            onBlur={() => markTouched(`triggerDate-${index}`)}
                            onChange={(e) =>
                              handleUpdateRow(index, { triggerDate: e.target.value })
                            }
                            className="h-9 text-xs font-mono rounded-xl"
                          />
                          {showDateErr && (
                            <p
                              id={`term-date-error-${index}`}
                              role="alert"
                              className="text-[11px] text-destructive flex items-center gap-1"
                            >
                              <HugeiconsIcon icon={AlertCircleIcon} className="size-3 shrink-0" aria-hidden="true" />
                              <span>{rowErrors.triggerDate}</span>
                            </p>
                          )}
                        </div>
                      )}

                      <div
                        className={`${
                          term.triggerType === "manual" ? "sm:col-span-12" : "sm:col-span-7"
                        } space-y-1`}
                      >
                        <Label
                          htmlFor={`term-notes-${index}`}
                          className="text-[11px] font-medium text-muted-foreground"
                        >
                          Catatan Ketentuan Termin (Opsional)
                        </Label>
                        {term.triggerType !== "manual" && (
                          <span className="text-[11px] text-muted-foreground block">
                            Keterangan lingkup atau referensi untuk dokumen tagihan.
                          </span>
                        )}
                        <Input
                          id={`term-notes-${index}`}
                          disabled={rowDisabled}
                          value={term.notes}
                          onChange={(e) => handleUpdateRow(index, { notes: e.target.value })}
                          placeholder="Keterangan opsional untuk klien..."
                          className="h-9 text-xs rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border flex sm:justify-between items-center gap-3">
            <div className="text-xs text-muted-foreground hidden sm:block">
              {isExact100 ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" aria-hidden="true" />
                  Siap disimpan (100% tepat)
                </span>
              ) : (
                <span className="text-destructive font-semibold flex items-center gap-1">
                  <HugeiconsIcon icon={AlertCircleIcon} className="size-4" aria-hidden="true" />
                  Total bobot belum 100%
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="rounded-full text-xs h-9 px-4"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createContractMutation.isPending || hasLockedTerms}
                className="rounded-full text-xs h-9 px-5 font-semibold shadow-xs"
              >
                {createContractMutation.isPending ? "Menyimpan..." : "Simpan Kontrak & Termin 100%"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
