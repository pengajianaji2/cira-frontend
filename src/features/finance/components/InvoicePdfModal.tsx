"use client";

import React, { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  File01Icon,
  PrinterIcon,
  CheckmarkCircle02Icon,
  LockKeyIcon,
  AlertCircleIcon,
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  formatDateWibDisplay,
  getBusinessDateWib,
  isValidDateOnly,
} from "@/shared/lib/business-date";
import { Project } from "@/features/projects";
import { PaymentTerm } from "../types/finance.types";
import { useIssueInvoiceMutation } from "../queries/finance.queries";
import { formatRupiah } from "../utils/finance.formatters";

interface InvoicePdfModalProps {
  project: Project;
  term: PaymentTerm | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function InvoicePdfModal({
  project,
  term,
  open,
  onOpenChange,
}: InvoicePdfModalProps) {
  const [invoiceNumberInput, setInvoiceNumberInput] = useState<string>("");
  const [invoiceDueDateInput, setInvoiceDueDateInput] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [touchedDueDate, setTouchedDueDate] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const printAreaRef = useRef<HTMLDivElement>(null);
  const dueDateInputRef = useRef<HTMLInputElement>(null);
  const issueMutation = useIssueInvoiceMutation();

  const termId = term?.id ?? null;

  useEffect(() => {
    if (open && termId) {
      setInvoiceNumberInput("");
      setInvoiceDueDateInput("");
      setNotes("");
      setTouchedDueDate(false);
      setSubmitted(false);
    }
  }, [open, termId]);

  if (!term) return null;

  const isInvoiced =
    term.status === "invoiced" ||
    term.status === "paid" ||
    Boolean(term.invoiceNumber);

  const displayedDueDate = isInvoiced
    ? term.invoiceDueDate || term.dueDate
    : invoiceDueDateInput || term.invoiceDueDate;

  const dueDateError = !invoiceDueDateInput.trim()
    ? "Tanggal jatuh tempo invoice wajib diisi."
    : !isValidDateOnly(invoiceDueDateInput.trim())
    ? "Format tanggal jatuh tempo harus YYYY-MM-DD yang valid."
    : null;

  const showDueDateError = (touchedDueDate || submitted) && Boolean(dueDateError);

  const handlePrint = () => {
    if (!printAreaRef.current) return;
    const printContent = printAreaRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Gagal membuka jendela cetak. Periksa setelan pop-up browser.");
      return;
    }

    const safeDocTitle = escapeHtml(
      term.invoiceNumber || invoiceNumberInput.trim() || "Draft-Invoice"
    );

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <title>Invoice - ${safeDocTitle}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #09090b; margin: 0; padding: 20px; font-size: 13px; line-height: 1.5; }
            .border-b { border-bottom: 1px solid #e4e4e7; }
            .border-t { border-top: 1px solid #e4e4e7; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 10px; background: #f4f4f5; font-size: 11px; text-transform: uppercase; color: #52525b; }
            td { padding: 12px 10px; border-bottom: 1px solid #f4f4f5; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .font-mono { font-family: "JetBrains Mono", monospace; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleIssueInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (dueDateError) {
      toast.error(dueDateError);
      requestAnimationFrame(() => {
        dueDateInputRef.current?.focus();
      });
      return;
    }

    issueMutation.mutate(
      {
        termId: term.id,
        projectId: project.id,
        input: {
          invoiceNumber: invoiceNumberInput.trim() || undefined,
          invoiceDueDate: invoiceDueDateInput.trim(),
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden rounded-3xl">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-card">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={File01Icon} className="size-4.5" aria-hidden="true" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {isInvoiced ? "Invoice Resmi Terbit" : "Catat Penerbitan Invoice Termin"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {term.title} •{" "}
                  <span className="font-mono font-semibold">{formatRupiah(term.amount)}</span> (
                  <span className="font-mono">{term.percentage}%</span>)
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {term.overdue && (
                <Badge
                  variant="destructive"
                  className="text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1"
                >
                  <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5" aria-hidden="true" />
                  <span>[Terlambat / Overdue]</span>
                </Badge>
              )}

              {isInvoiced && (
                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 font-mono">
                  <HugeiconsIcon icon={LockKeyIcon} className="size-3.5" aria-hidden="true" />
                  <span>{term.invoiceNumber}</span>
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleIssueInvoice}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-muted/20">
            {!isInvoiced && (
              <div className="bg-card border border-border p-4.5 rounded-2xl space-y-4 shadow-xs">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-foreground">
                    Detail Pencatatan Invoice Manual
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Isi tanggal jatuh tempo invoice (wajib, zona waktu WIB) terpisah dari pemicu termin.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div className="space-y-1">
                    <Label
                      htmlFor="invoice-number"
                      className="text-xs font-semibold text-foreground"
                    >
                      Nomor Invoice (Opsional)
                    </Label>
                    <span id="invoice-number-hint" className="text-[11px] text-muted-foreground block">
                      Kosongkan untuk nomor seri otomatis (INV-YYYY-NNN/Tn).
                    </span>
                    <Input
                      id="invoice-number"
                      type="text"
                      value={invoiceNumberInput}
                      aria-describedby="invoice-number-hint"
                      onChange={(e) => setInvoiceNumberInput(e.target.value)}
                      placeholder="Contoh: INV-2026-001/T1"
                      className="h-9 text-xs font-mono rounded-xl"
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="invoice-due-date"
                      className="text-xs font-semibold text-foreground"
                    >
                      Tanggal Jatuh Tempo Invoice (WIB) <span className="text-destructive">*</span>
                    </Label>
                    <span id="invoice-due-date-hint" className="text-[11px] text-muted-foreground block">
                      Batas waktu pelunasan klien dalam zona Asia/Jakarta.
                    </span>
                    <Input
                      ref={dueDateInputRef}
                      id="invoice-due-date"
                      type="date"
                      required
                      value={invoiceDueDateInput}
                      aria-invalid={showDueDateError ? "true" : undefined}
                      aria-describedby={
                        showDueDateError
                          ? "invoice-due-date-error"
                          : "invoice-due-date-hint"
                      }
                      onBlur={() => setTouchedDueDate(true)}
                      onChange={(e) => setInvoiceDueDateInput(e.target.value)}
                      className="h-9 text-xs font-mono rounded-xl"
                    />
                    {showDueDateError && dueDateError && (
                      <p
                        id="invoice-due-date-error"
                        role="alert"
                        className="text-[11px] text-destructive flex items-center gap-1"
                      >
                        <HugeiconsIcon
                          icon={AlertCircleIcon}
                          className="size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{dueDateError}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="invoice-notes"
                    className="text-xs font-semibold text-foreground"
                  >
                    Catatan Penagihan Tambahan (Opsional)
                  </Label>
                  <Input
                    id="invoice-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Termin dibayarkan ke rekening BCA PT Cira Digital Nusantara."
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Pratinjau Dokumen Invoice Resmi */}
            <div
              ref={printAreaRef}
              className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 text-foreground"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      C
                    </div>
                    <span className="font-extrabold text-base tracking-tight">
                      CIRA DIGITAL CREATIVE
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">PT Cira Digital Nusantara</p>
                  <p className="text-xs text-muted-foreground">
                    Jl. TB Simatupang No. 8, Jakarta Selatan
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Email: finance@cira.digital • +62 811-2345-6789
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-primary">
                    INVOICE RESMI
                  </span>
                  <p className="text-sm font-bold text-foreground font-mono">
                    {term.invoiceNumber || invoiceNumberInput.trim() || "OTOMATIS SAAT TERBIT"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Tgl Terbit:{" "}
                    {formatDateWibDisplay(term.invoiceIssuedAt || getBusinessDateWib(), {
                      longMonth: true,
                    })}
                  </p>
                  {displayedDueDate && (
                    <p
                      className={`text-xs font-mono ${
                        term.overdue ? "text-destructive font-bold" : "text-muted-foreground"
                      }`}
                    >
                      Jatuh Tempo: {formatDateWibDisplay(displayedDueDate, { longMonth: true })}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Ditagihkan Kepada:
                  </span>
                  <p className="text-sm font-bold text-foreground">
                    {project.clientName || "Klien Terdaftar"}
                  </p>
                  <p className="text-xs text-muted-foreground">Proyek: {project.name}</p>
                </div>

                <div className="space-y-1 sm:text-right">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Status Pembayaran:
                  </span>
                  <div className="flex sm:justify-end gap-1.5 flex-wrap">
                    <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">
                      {term.status === "paid"
                        ? "LUNAS"
                        : isInvoiced
                        ? "MENUNGGU PEMBAYARAN"
                        : "DRAFT / SIAP DITAGIH"}
                    </Badge>
                    {term.overdue && (
                      <Badge variant="destructive" className="text-xs font-semibold px-2.5 py-0.5">
                        [Terlambat / Overdue]
                      </Badge>
                    )}
                  </div>
                  {term.bastFileName && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      BAST Terlampir: {term.bastFileName}
                    </p>
                  )}
                </div>
              </div>

              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th scope="col" className="p-3 text-left">
                        No
                      </th>
                      <th scope="col" className="p-3 text-left">
                        Deskripsi Termin / Milestone
                      </th>
                      <th scope="col" className="p-3 text-center">
                        Bobot
                      </th>
                      <th scope="col" className="p-3 text-right">
                        Jumlah Tagihan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-3 font-mono font-semibold text-muted-foreground">
                        #{term.termNumber}
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-foreground">{term.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {notes.trim() || term.notes || `Penagihan termin proyek ${project.name}`}
                        </p>
                      </td>
                      <td className="p-3 text-center font-mono font-bold">{term.percentage}%</td>
                      <td className="p-3 text-right font-mono font-bold text-foreground">
                        {formatRupiah(term.amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                <div className="text-xs text-muted-foreground space-y-1 max-w-sm">
                  <span className="font-semibold text-foreground">Rekening Pembayaran Resmi:</span>
                  <p>• Bank Central Asia (BCA): 8830-192-881 (a/n PT Cira Digital Nusantara)</p>
                  <p>• Bank Mandiri: 137-00-19283-91 (a/n PT Cira Digital Nusantara)</p>
                  <p className="text-[11px] italic mt-1">
                    Harap sertakan nomor invoice pada berita transfer bank.
                  </p>
                </div>

                <div className="w-full sm:w-64 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-mono font-semibold">{formatRupiah(term.amount)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">PPN (0%):</span>
                    <span className="font-mono font-semibold">Rp 0</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm font-bold text-foreground">
                    <span>Total Tagihan:</span>
                    <span className="font-mono text-primary">{formatRupiah(term.amount)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex justify-between items-end text-xs text-muted-foreground">
                <div className="text-[11px]">
                  <p>Dokumen ini diterbitkan secara sah oleh sistem Cira PM.</p>
                  <p>Keabsahan invoice terlindungi oleh jejak audit log dan kontrol RBAC.</p>
                </div>
                <div className="text-center space-y-1">
                  <div className="size-14 border border-dashed border-muted-foreground/40 rounded-xl mx-auto flex items-center justify-center text-[10px] text-muted-foreground">
                    STEMPEL RESMI
                  </div>
                  <p className="font-bold text-foreground text-[11px]">Cira Finance Dept.</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-border bg-card flex sm:justify-between items-center gap-3">
            <div className="text-xs text-muted-foreground hidden sm:block">
              {isInvoiced ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" aria-hidden="true" />
                  Invoice Resmi Telah Terbit & Termin Terkunci
                </span>
              ) : (
                <span>
                  Termin Siap Ditagih. Terbitkan invoice setelah mengisi jatuh tempo resmi.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="rounded-full text-xs h-8.5 px-3.5 font-medium"
              >
                <HugeiconsIcon icon={PrinterIcon} className="size-3.5 mr-1.5" aria-hidden="true" />
                Cetak / Unduh PDF
              </Button>

              {!isInvoiced ? (
                <Button
                  type="submit"
                  size="sm"
                  disabled={issueMutation.isPending}
                  className="rounded-full text-xs h-8.5 px-4 font-semibold shadow-xs"
                >
                  {issueMutation.isPending
                    ? "Menerbitkan..."
                    : "Terbitkan & Simpan Invoice"}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full text-xs h-8.5 px-4 font-semibold"
                >
                  Tutup
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
