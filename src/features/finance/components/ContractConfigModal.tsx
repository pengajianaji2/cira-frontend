"use client";

import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useProjectSprintsQuery } from "@/features/sprints";
import {
  PaymentTerm,
  TermTriggerType,
  TerminInput,
} from "../types/finance.types";
import { useCreateContractMutation } from "../queries/finance.queries";

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
  triggerSprintId?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  isLocked?: boolean;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ContractConfigModal({
  projectId,
  initialContractValue,
  existingTerms = [],
  open,
  onOpenChange,
}: ContractConfigModalProps) {
  const [contractValue, setContractValue] = useState<number>(initialContractValue || 0);
  const [terms, setTerms] = useState<TermRowState[]>([]);

  // Mengambil daftar sprint proyek untuk opsi trigger modul/sprint
  const { data: sprints = [] } = useProjectSprintsQuery(projectId);
  const createContractMutation = useCreateContractMutation();

  // Sinkronisasi data awal saat modal dibuka
  useEffect(() => {
    if (!open) return;

    setContractValue(initialContractValue || 0);

    if (existingTerms.length > 0) {
      setTerms(
        existingTerms.map((t) => ({
          id: t.id,
          title: t.title,
          percentage: t.percentage,
          triggerType: t.triggerType,
          triggerSprintId: t.triggerSprintId || undefined,
          dueDate: t.dueDate ? t.dueDate.split("T")[0] : undefined,
          notes: t.notes || undefined,
          isLocked: t.isLocked,
        }))
      );
    } else {
      // Default template 3 termin standar bertotal 100%
      setTerms([
        {
          title: "Termin 1 - DP Kick-off",
          percentage: 30,
          triggerType: "manual",
          notes: "Down payment sebelum pengerjaan proyek dimulai",
        },
        {
          title: "Termin 2 - Penyelesaian Modul Inti",
          percentage: 40,
          triggerType: "sprint",
          triggerSprintId: sprints[0]?.id || undefined,
          notes: "Diselesaikan setelah modul sprint utama selesai dan BAST disahkan",
        },
        {
          title: "Termin 3 - Pelunasan Akhir & Serah Terima",
          percentage: 30,
          triggerType: "date",
          notes: "Pelunasan setelah evaluasi final dan penandatanganan BAST akhir",
        },
      ]);
    }
  }, [open, initialContractValue, existingTerms, sprints]);

  // Kalkulasi total persentase
  const totalPercentage = terms.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0);
  const isExact100 = totalPercentage === 100;
  const hasLockedTerms = terms.some((t) => t.isLocked);

  // Kalkulasi nominal rupiah live per baris dengan penyerapan pembulatan pada baris terakhir
  const calculateRowAmount = (index: number, percentage: number): number => {
    if (!contractValue || contractValue <= 0) return 0;
    if (terms.length === 0) return 0;

    // Jika baris terakhir, serap selisih pembulatan rupiah
    if (index === terms.length - 1) {
      let sumPrev = 0;
      for (let i = 0; i < terms.length - 1; i++) {
        sumPrev += Math.round(((Number(terms[i].percentage) || 0) * contractValue) / 100);
      }
      return Math.max(0, contractValue - sumPrev);
    }

    return Math.round(((Number(percentage) || 0) * contractValue) / 100);
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
      },
    ]);
  };

  const handleRemoveTerm = (index: number) => {
    if (terms.length <= 1) {
      toast.error("Minimal harus ada 1 termin pembayaran");
      return;
    }
    if (terms[index]?.isLocked) {
      toast.error("Termin yang sudah terkunci atau memiliki invoice tidak dapat dihapus");
      return;
    }
    setTerms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (
    index: number,
    field: keyof TermRowState,
    value: string | number | undefined | null
  ) => {
    setTerms((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!contractValue || contractValue <= 0) {
      toast.error("Nilai kontrak proyek wajib lebih dari Rp 0");
      return;
    }

    if (terms.length === 0) {
      toast.error("Minimal harus ada 1 termin pembayaran");
      return;
    }

    if (!isExact100) {
      toast.error(
        `Total persentase seluruh termin wajib tepat 100%. Saat ini: ${totalPercentage}% (${
          totalPercentage < 100 ? `Kurang ${100 - totalPercentage}%` : `Lebih ${totalPercentage - 100}%`
        })`
      );
      return;
    }

    // Validasi field per termin
    for (let i = 0; i < terms.length; i++) {
      const t = terms[i];
      if (!t.title || t.title.trim().length < 2) {
        toast.error(`Nama Termin #${i + 1} wajib diisi minimal 2 karakter`);
        return;
      }
      if (!t.percentage || t.percentage <= 0 || t.percentage > 100) {
        toast.error(`Persentase Termin #${i + 1} harus antara 1% - 100%`);
        return;
      }
      if (t.triggerType === "sprint" && !t.triggerSprintId) {
        toast.error(`Pilih modul sprint untuk Termin #${i + 1}`);
        return;
      }
      if (t.triggerType === "date" && !t.dueDate) {
        toast.error(`Tentukan tanggal jatuh tempo untuk Termin #${i + 1}`);
        return;
      }
    }

    const payloadTerms: TerminInput[] = terms.map((t) => ({
      title: t.title.trim(),
      percentage: Number(t.percentage),
      triggerType: t.triggerType,
      triggerSprintId: t.triggerType === "sprint" ? t.triggerSprintId : null,
      dueDate: t.triggerType === "date" && t.dueDate ? new Date(t.dueDate).toISOString() : null,
      notes: t.notes ? t.notes.trim() : null,
    }));

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-3xl">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Coins01Icon} className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Konfigurasi Kontrak & Termin Berbobot 100%
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Tentukan nilai kontrak dan susun bobot seluruh termin hingga total tepat 100%. Sistem otomatis menyerap selisih pembulatan rupiah.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {hasLockedTerms && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
              <HugeiconsIcon icon={InformationCircleIcon} className="size-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold">Sebagian Termin Sudah Terkunci / Memiliki Invoice</p>
                <p className="opacity-90 mt-0.5">
                  Termin yang telah diterbitkan invoice resminya terkunci dari modifikasi untuk menjaga integritas audit trail finansial.
                </p>
              </div>
            </div>
          )}

          {/* Bagian Nilai Kontrak */}
          <div className="bg-muted/40 p-4.5 rounded-2xl border border-border space-y-3">
            <Label className="text-xs font-semibold text-foreground">Total Nilai Kontrak Proyek (IDR)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="number"
                  min={1000}
                  step={1000}
                  value={contractValue || ""}
                  onChange={(e) => setContractValue(Number(e.target.value) || 0)}
                  placeholder="Contoh: 50000000"
                  className="pl-10 text-sm font-semibold rounded-xl h-10"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Format Resmi:{" "}
                <span className="font-bold text-foreground text-sm">
                  {formatRupiah(contractValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Indikator Validasi Total Persentase 100% */}
          <div className="bg-card border border-border p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">Validasi Total Bobot Termin:</span>
                {isExact100 ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" />
                    Tepat 100% (Valid)
                  </Badge>
                ) : (
                  <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5" />
                    Total: {totalPercentage}% (Wajib 100%)
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isExact100
                  ? "Seluruh termin telah memenuhi syarat 100%. Baris termin terakhir menyerap selisih pembulatan nominal rupiah."
                  : totalPercentage < 100
                  ? `Masih kurang ${100 - totalPercentage}% lagi untuk mencapai total 100%.`
                  : `Kelebihan ${totalPercentage - 100}%. Harap kurangi persentase pada salah satu termin.`}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTerm}
              className="rounded-full text-xs h-8.5 px-3.5 font-medium shrink-0 self-start sm:self-auto"
            >
              <HugeiconsIcon icon={Add01Icon} className="size-3.5 mr-1.5" />
              Tambah Baris Termin
            </Button>
          </div>

          {/* Daftar Baris Termin */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Rincian Tiap Termin ({terms.length} Termin)</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                Termin terakhir otomatis menyerap selisih pembulatan nominal
              </span>
            </Label>

            <div className="space-y-3">
              {terms.map((term, index) => {
                const rowAmount = calculateRowAmount(index, term.percentage);
                const isLast = index === terms.length - 1;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-2xl border transition-all ${
                      term.isLocked
                        ? "bg-muted/30 border-muted opacity-80"
                        : "bg-card border-border hover:border-primary/40 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-border/60">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
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

                      {!term.isLocked && terms.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveTerm(index)}
                          className="size-7 text-muted-foreground hover:text-destructive rounded-lg"
                        >
                          <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Judul Termin */}
                      <div className="sm:col-span-5 space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Nama / Deskripsi Termin</Label>
                        <Input
                          disabled={term.isLocked}
                          value={term.title}
                          onChange={(e) => handleUpdateRow(index, "title", e.target.value)}
                          placeholder="Contoh: Termin 1 - DP 30%"
                          className="h-8.5 text-xs rounded-xl"
                        />
                      </div>

                      {/* Bobot % */}
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Bobot (%)</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            step={1}
                            disabled={term.isLocked}
                            value={term.percentage || ""}
                            onChange={(e) =>
                              handleUpdateRow(index, "percentage", Number(e.target.value) || 0)
                            }
                            className="h-8.5 text-xs font-semibold rounded-xl pr-6"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted-foreground">
                            %
                          </span>
                        </div>
                      </div>

                      {/* Nominal Rupiah (Otomatis) */}
                      <div className="sm:col-span-5 space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          Kalkulasi Nominal (Rp) {isLast && "(Otomatis Pas)"}
                        </Label>
                        <div className="h-8.5 px-3 rounded-xl bg-muted/60 border border-border flex items-center justify-between text-xs font-bold text-foreground">
                          <span>{formatRupiah(rowAmount)}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {term.percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Trigger Tipe */}
                      <div className="sm:col-span-4 space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Syarat Trigger Selesai</Label>
                        <Select
                          disabled={term.isLocked}
                          value={term.triggerType}
                          onValueChange={(val) =>
                            handleUpdateRow(index, "triggerType", val as TermTriggerType)
                          }
                        >
                          <SelectTrigger className="h-8.5 text-xs rounded-xl">
                            <SelectValue placeholder="Pilih trigger" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual / Konfirmasi</SelectItem>
                            <SelectItem value="sprint">Modul Selesai (Sprint)</SelectItem>
                            <SelectItem value="date">Batas Tanggal Jatuh Tempo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Parameter Trigger Spesifik */}
                      <div className="sm:col-span-8 space-y-1">
                        {term.triggerType === "sprint" && (
                          <>
                            <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <HugeiconsIcon icon={FastForwardIcon} className="size-3 text-primary" />
                              Pilih Sprint yang Harus Selesai
                            </Label>
                            {sprints.length > 0 ? (
                              <Select
                                disabled={term.isLocked}
                                value={term.triggerSprintId || ""}
                                onValueChange={(val) => handleUpdateRow(index, "triggerSprintId", val)}
                              >
                                <SelectTrigger className="h-8.5 text-xs rounded-xl">
                                  <SelectValue placeholder="Pilih sprint modul" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sprints.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                      {s.name} ({s.status === "completed" ? "Selesai" : s.status})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="h-8.5 px-3 rounded-xl bg-muted/40 border border-border flex items-center text-[11px] text-muted-foreground">
                                Belum ada sprint aktif di proyek ini. Buat sprint terlebih dahulu di tab Tasks.
                              </div>
                            )}
                          </>
                        )}

                        {term.triggerType === "date" && (
                          <>
                            <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <HugeiconsIcon icon={Calendar01Icon} className="size-3 text-primary" />
                              Tanggal Target Jatuh Tempo
                            </Label>
                            <Input
                              type="date"
                              disabled={term.isLocked}
                              value={term.dueDate || ""}
                              onChange={(e) => handleUpdateRow(index, "dueDate", e.target.value)}
                              className="h-8.5 text-xs rounded-xl"
                            />
                          </>
                        )}

                        {term.triggerType === "manual" && (
                          <>
                            <Label className="text-[11px] text-muted-foreground">
                              Catatan Ketentuan Termin
                            </Label>
                            <Input
                              disabled={term.isLocked}
                              value={term.notes || ""}
                              onChange={(e) => handleUpdateRow(index, "notes", e.target.value)}
                              placeholder="Keterangan opsional untuk klien..."
                              className="h-8.5 text-xs rounded-xl"
                            />
                          </>
                        )}
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
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                  Siap disimpan (100% tepat)
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                  <HugeiconsIcon icon={AlertCircleIcon} className="size-4" />
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
                disabled={!isExact100 || contractValue <= 0 || createContractMutation.isPending}
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
