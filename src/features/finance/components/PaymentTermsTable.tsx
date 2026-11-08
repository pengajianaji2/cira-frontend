"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Coins01Icon,
  Upload04Icon,
  File01Icon,
  PrinterIcon,
  LockKeyIcon,
  Delete02Icon,
  Calendar01Icon,
  FastForwardIcon,
  EyeIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Project } from "@/features/projects";
import { useMyPermissionsQuery } from "@/features/auth/queries/auth.queries";
import { PaymentTerm, TermStatus } from "../types/finance.types";
import { useDeleteTermMutation } from "../queries/finance.queries";
import { UploadBastModal } from "./UploadBastModal";
import { InvoicePdfModal } from "./InvoicePdfModal";

interface PaymentTermsTableProps {
  project: Project;
  terms: PaymentTerm[];
  isLoading: boolean;
  onOpenConfigModal: () => void;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PaymentTermsTable({
  project,
  terms,
  isLoading,
  onOpenConfigModal,
}: PaymentTermsTableProps) {
  const { data: permissions = [] } = useMyPermissionsQuery();
  const isFinanceManager = permissions.includes("finance.write");

  const [selectedBastTerm, setSelectedBastTerm] = useState<PaymentTerm | null>(null);
  const [bastModalOpen, setBastModalOpen] = useState(false);

  const [selectedInvoiceTerm, setSelectedInvoiceTerm] = useState<PaymentTerm | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const [previewBastUrl, setPreviewBastUrl] = useState<string | null>(null);
  const [previewBastName, setPreviewBastName] = useState<string>("");

  const deleteTermMutation = useDeleteTermMutation();

  const handleOpenUploadBast = (term: PaymentTerm) => {
    setSelectedBastTerm(term);
    setBastModalOpen(true);
  };

  const handleOpenInvoice = (term: PaymentTerm) => {
    setSelectedInvoiceTerm(term);
    setInvoiceModalOpen(true);
  };

  const handleDeleteTerm = (term: PaymentTerm) => {
    if (term.isLocked) {
      alert("Termin yang telah diterbitkan invoice resminya terkunci dan tidak dapat dihapus.");
      return;
    }

    if (confirm(`Hapus termin #${term.termNumber} "${term.title}"?`)) {
      deleteTermMutation.mutate({
        termId: term.id,
        projectId: project.id,
      });
    }
  };

  const getStatusBadge = (status: TermStatus) => {
    switch (status) {
      case "ready":
        return (
          <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            Siap Ditagih
          </Badge>
        );
      case "invoiced":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            Ditagih (Invoiced)
          </Badge>
        );
      case "paid":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            Lunas
          </Badge>
        );
      case "planned":
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground text-[11px] font-medium px-2.5 py-0.5 rounded-full">
            Direncanakan
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[220px] flex flex-col items-center justify-center gap-3 bg-card border border-border rounded-3xl p-8">
        <Spinner className="size-6 text-primary" />
        <p className="text-xs text-muted-foreground">Memuat data kontrak dan termin pembayaran...</p>
      </div>
    );
  }

  if (terms.length === 0) {
    return (
      <div className="bg-card border border-border border-dashed rounded-3xl p-12 text-center">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
          <HugeiconsIcon icon={Coins01Icon} className="size-6" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">
          Belum Ada Kontrak & Termin Berbobot 100%
        </h4>
        <p className="text-xs text-muted-foreground mt-1 mb-6 max-w-md mx-auto">
          Atur kontrak resmi proyek dan buat susunan termin berbobot tepat 100% dengan trigger penyelesaian (Sprint / Tanggal / Manual), verifikasi BAST, dan penerbitan invoice resmi otomatis.
        </p>
        {isFinanceManager && (
          <Button
            onClick={onOpenConfigModal}
            size="sm"
            className="rounded-full text-xs h-8.5 px-4 font-semibold shadow-xs"
          >
            <HugeiconsIcon icon={SparklesIcon} className="size-3.5 mr-1.5" />
            Konfigurasi Kontrak & Termin 100%
          </Button>
        )}
      </div>
    );
  }

  // Hitung total persentase dan nominal
  const totalPercentage = terms.reduce((acc, t) => acc + (t.percentage || 0), 0);
  const totalAmount = terms.reduce((acc, t) => acc + (t.amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header Tabel & Summary Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Kontrak:
            </span>
            <p className="text-sm font-extrabold text-foreground">
              {formatRupiah(project.contractValue || totalAmount)}
            </p>
          </div>
          <div className="h-7 w-px bg-border hidden sm:block" />
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Bobot:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-foreground">{totalPercentage}%</span>
              {totalPercentage === 100 ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0 rounded-full font-semibold">
                  Valid 100%
                </Badge>
              ) : (
                <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] px-2 py-0 rounded-full font-semibold">
                  {totalPercentage}% (Perlu Disesuaikan)
                </Badge>
              )}
            </div>
          </div>
          <div className="h-7 w-px bg-border hidden sm:block" />
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Jumlah Termin:
            </span>
            <p className="text-sm font-bold text-foreground">{terms.length} Termin</p>
          </div>
        </div>

        {isFinanceManager && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenConfigModal}
            className="rounded-full text-xs h-8 px-3.5 font-medium shrink-0 self-start sm:self-auto"
          >
            <HugeiconsIcon icon={Coins01Icon} className="size-3.5 mr-1.5" />
            Sesuaikan Termin 100%
          </Button>
        )}
      </div>

      {/* Tabel Termin Berbobot */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="p-3.5 pl-5">Termin</th>
                <th className="p-3.5">Bobot & Nilai</th>
                <th className="p-3.5">Trigger Penyelesaian</th>
                <th className="p-3.5">Dokumen BAST</th>
                <th className="p-3.5">Status & Invoice</th>
                <th className="p-3.5 pr-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {terms.map((term, index) => {
                const isLast = index === terms.length - 1;

                return (
                  <tr key={term.id} className="hover:bg-muted/20 transition-colors">
                    {/* Kolom Termin */}
                    <td className="p-3.5 pl-5">
                      <div className="flex items-start gap-2.5">
                        <span className="size-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          #{term.termNumber}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-foreground text-xs">
                              {term.title}
                            </span>
                            {term.isLocked && (
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 px-1.5 rounded-full text-amber-600 border-amber-500/30 font-medium flex items-center gap-1"
                              >
                                <HugeiconsIcon icon={LockKeyIcon} className="size-2.5" />
                                Terkunci
                              </Badge>
                            )}
                          </div>
                          {term.notes && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 max-w-xs">
                              {term.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Kolom Bobot & Nilai */}
                    <td className="p-3.5">
                      <div>
                        <span className="font-extrabold text-foreground text-xs">
                          {formatRupiah(term.amount)}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <span className="font-bold text-primary">{term.percentage}%</span>
                          {isLast && (
                            <span className="text-[10px] text-muted-foreground italic">
                              (Penyerap Selisih)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Kolom Trigger Penyelesaian */}
                    <td className="p-3.5">
                      {term.triggerType === "sprint" && (
                        <div className="space-y-1">
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 w-fit"
                          >
                            <HugeiconsIcon icon={FastForwardIcon} className="size-2.5 text-primary" />
                            Modul Sprint
                          </Badge>
                          <p className="text-[11px] text-foreground font-medium truncate max-w-[160px]">
                            {term.triggerSprint?.name || "Sprint Terpilih"}
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            Status: {term.triggerSprint?.status || "Aktif"}
                          </span>
                        </div>
                      )}

                      {term.triggerType === "date" && (
                        <div className="space-y-1">
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 w-fit"
                          >
                            <HugeiconsIcon icon={Calendar01Icon} className="size-2.5 text-primary" />
                            Tanggal Tempo
                          </Badge>
                          <p className="text-[11px] text-foreground font-medium">
                            {formatDate(term.dueDate)}
                          </p>
                        </div>
                      )}

                      {term.triggerType === "manual" && (
                        <div>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                          >
                            Manual / Kick-off
                          </Badge>
                        </div>
                      )}
                    </td>

                    {/* Kolom Dokumen BAST */}
                    <td className="p-3.5">
                      {term.bastUrl ? (
                        <div className="space-y-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPreviewBastUrl(term.bastUrl || null);
                              setPreviewBastName(term.bastFileName || `BAST-Termin-${term.termNumber}`);
                            }}
                            className="h-7 px-2 text-xs rounded-lg text-primary hover:bg-primary/10 font-semibold flex items-center gap-1"
                          >
                            <HugeiconsIcon icon={File01Icon} className="size-3.5" />
                            <span className="truncate max-w-[120px]">
                              {term.bastFileName || "Dokumen BAST"}
                            </span>
                            <HugeiconsIcon icon={EyeIcon} className="size-3 ml-0.5" />
                          </Button>
                          <p className="text-[10px] text-muted-foreground pl-2">
                            {formatDate(term.bastUploadedAt)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          Belum diunggah
                        </span>
                      )}
                    </td>

                    {/* Kolom Status & Invoice */}
                    <td className="p-3.5">
                      <div className="space-y-1.5">
                        <div>{getStatusBadge(term.status)}</div>
                        {term.invoiceNumber && (
                          <div className="text-[11px] font-mono font-bold text-foreground flex items-center gap-1">
                            <HugeiconsIcon icon={File01Icon} className="size-3 text-muted-foreground" />
                            {term.invoiceNumber}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Kolom Aksi */}
                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Tombol Upload BAST (jika planned) */}
                        {isFinanceManager && term.status === "planned" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenUploadBast(term)}
                            className="rounded-full text-[11px] h-7 px-3 font-semibold"
                          >
                            <HugeiconsIcon icon={Upload04Icon} className="size-3 mr-1" />
                            BAST (Siap Ditagih)
                          </Button>
                        )}

                        {/* Tombol Terbitkan Invoice (jika ready) */}
                        {isFinanceManager && term.status === "ready" && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenInvoice(term)}
                            className="rounded-full text-[11px] h-7 px-3 font-semibold shadow-xs"
                          >
                            <HugeiconsIcon icon={File01Icon} className="size-3 mr-1" />
                            Terbitkan Invoice
                          </Button>
                        )}

                        {/* Tombol Lihat/Cetak Invoice (jika sudah invoiced/paid atau ada nomor) */}
                        {(term.status === "invoiced" || term.status === "paid" || term.invoiceNumber) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenInvoice(term)}
                            className="rounded-full text-[11px] h-7 px-3 font-medium"
                          >
                            <HugeiconsIcon icon={PrinterIcon} className="size-3 mr-1" />
                            Lihat Invoice
                          </Button>
                        )}

                        {/* Tombol Hapus Termin (jika belum terkunci) */}
                        {isFinanceManager && !term.isLocked && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTerm(term)}
                            className="size-7 text-muted-foreground hover:text-destructive rounded-lg"
                            title="Hapus termin"
                          >
                            <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Upload BAST */}
      <UploadBastModal
        projectId={project.id}
        term={selectedBastTerm}
        open={bastModalOpen}
        onOpenChange={setBastModalOpen}
      />

      {/* Modal Preview & Terbitkan Invoice PDF */}
      <InvoicePdfModal
        project={project}
        term={selectedInvoiceTerm}
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
      />

      {/* Dialog Pratinjau Dokumen BAST */}
      <Dialog open={Boolean(previewBastUrl)} onOpenChange={(val) => !val && setPreviewBastUrl(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] p-6 rounded-3xl flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold truncate">
              Pratinjau Berkas BAST: {previewBastName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-muted/20 rounded-2xl p-2 border border-border flex items-center justify-center min-h-[300px]">
            {previewBastUrl?.startsWith("data:application/pdf") ? (
              <iframe src={previewBastUrl} className="w-full h-[500px] rounded-xl border-none" />
            ) : previewBastUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewBastUrl}
                alt="Bukti BAST"
                className="max-h-[500px] max-w-full rounded-xl object-contain shadow-xs"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
