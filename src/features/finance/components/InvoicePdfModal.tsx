"use client";

import React, { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  File01Icon,
  PrinterIcon,
  CheckmarkCircle02Icon,
  LockKeyIcon,
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
import { toast } from "sonner";
import { Project } from "@/features/projects";
import { PaymentTerm } from "../types/finance.types";
import { useIssueInvoiceMutation } from "../queries/finance.queries";

interface InvoicePdfModalProps {
  project: Project;
  term: PaymentTerm | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
    month: "long",
    year: "numeric",
  });
}

export function InvoicePdfModal({
  project,
  term,
  open,
  onOpenChange,
}: InvoicePdfModalProps) {
  const [notes, setNotes] = useState<string>("");
  const printAreaRef = useRef<HTMLDivElement>(null);
  const issueMutation = useIssueInvoiceMutation();

  if (!term) return null;

  const isInvoiced = term.status === "invoiced" || term.status === "paid" || Boolean(term.invoiceNumber);

  const handlePrint = () => {
    if (!printAreaRef.current) return;
    const printContent = printAreaRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Gagal membuka jendela cetak. Periksa setelan pop-up browser.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${term.invoiceNumber || "Draft"}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111827; margin: 0; padding: 20px; font-size: 13px; line-height: 1.5; }
            .border-b { border-bottom: 1px solid #e5e7eb; }
            .border-t { border-top: 1px solid #e5e7eb; }
            .grid { display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 10px; background: #f3f4f6; font-size: 11px; text-transform: uppercase; color: #4b5563; }
            td { padding: 12px 10px; border-bottom: 1px solid #f3f4f6; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .text-muted { color: #6b7280; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: #ecfdf5; color: #059669; }
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

  const handleIssueInvoice = () => {
    issueMutation.mutate(
      {
        termId: term.id,
        projectId: project.id,
        input: {
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          // Tetap buka modal agar pengguna bisa melihat nomor invoice resmi & langsung cetak/unduh
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden rounded-3xl">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={File01Icon} className="size-4.5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {isInvoiced ? "Invoice Resmi Terbit" : "Penerbitan Invoice Termin"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {term.title} • {formatRupiah(term.amount)} ({term.percentage}%)
                </DialogDescription>
              </div>
            </div>

            {isInvoiced && (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                <HugeiconsIcon icon={LockKeyIcon} className="size-3.5" />
                {term.invoiceNumber} (Terkunci)
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/20">
          {/* Pratinjau Dokumen Invoice Resmi */}
          <div
            ref={printAreaRef}
            className="bg-card border border-border rounded-2xl p-8 shadow-xs space-y-6 text-foreground"
          >
            {/* Header Perusahaan & Info Invoice */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    C
                  </div>
                  <span className="font-extrabold text-base tracking-tight">CIRA DIGITAL CREATIVE</span>
                </div>
                <p className="text-xs text-muted-foreground">PT Cira Digital Nusantara</p>
                <p className="text-xs text-muted-foreground">Jl. TB Simatupang No. 8, Jakarta Selatan</p>
                <p className="text-xs text-muted-foreground">Email: finance@cira.digital • +62 811-2345-6789</p>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <span className="text-xs uppercase tracking-wider font-extrabold text-primary">
                  INVOICE RESMI
                </span>
                <p className="text-sm font-bold text-foreground font-mono">
                  {term.invoiceNumber || "DRAFT-PENDING"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Tgl Terbit: {formatDate(term.invoiceIssuedAt || new Date().toISOString())}
                </p>
                {term.dueDate && (
                  <p className="text-xs text-muted-foreground">
                    Jatuh Tempo: {formatDate(term.dueDate)}
                  </p>
                )}
              </div>
            </div>

            {/* Info Klien & Proyek */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Ditagihkan Kepada:
                </span>
                <p className="text-sm font-bold text-foreground">{project.clientName || "Klien Terdaftar"}</p>
                <p className="text-xs text-muted-foreground">Proyek: {project.name}</p>
                <p className="text-xs text-muted-foreground">Kategori: Software Development</p>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Status Pembayaran:
                </span>
                <div>
                  <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">
                    {term.status === "paid" ? "LUNAS" : "MENUNGGU PEMBAYARAN"}
                  </Badge>
                </div>
                {term.bastFileName && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    BAST Terlampir: {term.bastFileName}
                  </p>
                )}
              </div>
            </div>

            {/* Tabel Rincian Termin Tagihan */}
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="p-3 text-left">No</th>
                    <th className="p-3 text-left">Deskripsi Termin / Milestone</th>
                    <th className="p-3 text-center">Bobot</th>
                    <th className="p-3 text-right">Jumlah Tagihan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3 font-semibold text-muted-foreground">#{term.termNumber}</td>
                    <td className="p-3">
                      <p className="font-semibold text-foreground">{term.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {term.notes || `Penagihan termin proyek ${project.name}`}
                      </p>
                    </td>
                    <td className="p-3 text-center font-bold">{term.percentage}%</td>
                    <td className="p-3 text-right font-bold text-foreground">
                      {formatRupiah(term.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Finansial */}
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
                  <span className="font-semibold">{formatRupiah(term.amount)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">PPN (0%):</span>
                  <span className="font-semibold">Rp 0</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-bold text-foreground">
                  <span>Total Tagihan:</span>
                  <span className="text-primary">{formatRupiah(term.amount)}</span>
                </div>
              </div>
            </div>

            {/* Catatan Kaki / Pengesahan */}
            <div className="pt-6 border-t border-border flex justify-between items-end text-xs text-muted-foreground">
              <div className="text-[11px]">
                <p>Dokumen ini diterbitkan secara sah dan otomatis oleh sistem Cira PM.</p>
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

          {!isInvoiced && (
            <div className="bg-card border border-border p-4 rounded-2xl space-y-1.5 shadow-xs">
              <label htmlFor="invoice-notes" className="text-xs font-semibold text-foreground">
                Catatan Penagihan Tambahan (Opsional)
              </label>
              <input
                id="invoice-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Tagihan termin untuk sprint implementasi sistem autentikasi."
                className="w-full text-xs h-8 px-3 rounded-xl bg-background border border-border"
              />
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t border-border bg-card flex sm:justify-between items-center gap-3">
          <div className="text-xs text-muted-foreground hidden sm:block">
            {isInvoiced ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                Invoice Resmi Telah Terbit & Terkunci
              </span>
            ) : (
              <span>Termin berstatus Siap Ditagih. Klik terbitkan untuk mengunci termin & membuat nomor resmi.</span>
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
              <HugeiconsIcon icon={PrinterIcon} className="size-3.5 mr-1.5" />
              Cetak / Unduh PDF
            </Button>

            {!isInvoiced ? (
              <Button
                type="button"
                size="sm"
                onClick={handleIssueInvoice}
                disabled={issueMutation.isPending}
                className="rounded-full text-xs h-8.5 px-4 font-semibold shadow-xs"
              >
                {issueMutation.isPending ? "Menerbitkan..." : "Terbitkan Invoice Resmi (AC-15)"}
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
      </DialogContent>
    </Dialog>
  );
}
