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
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Edit02Icon,
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
import { formatDateWibDisplay } from "@/shared/lib/business-date";
import { Project } from "@/features/projects";
import { useMyPermissionsQuery } from "@/features/auth/queries/auth.queries";
import { PaymentTerm, TermStatus } from "../types/finance.types";
import {
  useDeleteTermMutation,
  useMarkTermPaidMutation,
  useMarkTermReadyWithBastMutation,
} from "../queries/finance.queries";
import { extractDateOnly, formatRupiah } from "../utils/finance.formatters";
import { UploadBastModal } from "./UploadBastModal";
import { InvoicePdfModal } from "./InvoicePdfModal";
import { EditPaymentTermModal } from "./EditPaymentTermModal";

interface PaymentTermsTableProps {
  project: Project;
  terms: PaymentTerm[];
  isLoading: boolean;
  onOpenConfigModal: () => void;
}

type ConfirmActionState =
  | { type: "ready"; term: PaymentTerm }
  | { type: "paid"; term: PaymentTerm }
  | { type: "delete"; term: PaymentTerm }
  | null;

export function PaymentTermsTable({
  project,
  terms,
  isLoading,
  onOpenConfigModal,
}: PaymentTermsTableProps) {
  const { data: permissions = [] } = useMyPermissionsQuery();
  const canManageTerms =
    permissions.includes("finance.payment_terms.manage") ||
    permissions.includes("finance.write");
  const canCreateInvoices =
    permissions.includes("finance.invoices.create") ||
    permissions.includes("finance.write");

  const [selectedEditTerm, setSelectedEditTerm] = useState<PaymentTerm | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [selectedBastTerm, setSelectedBastTerm] = useState<PaymentTerm | null>(null);
  const [bastModalOpen, setBastModalOpen] = useState(false);

  const [selectedInvoiceTerm, setSelectedInvoiceTerm] = useState<PaymentTerm | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const [previewBastUrl, setPreviewBastUrl] = useState<string | null>(null);
  const [previewBastName, setPreviewBastName] = useState<string>("");

  const [confirmAction, setConfirmAction] = useState<ConfirmActionState>(null);

  const deleteTermMutation = useDeleteTermMutation();
  const markReadyMutation = useMarkTermReadyWithBastMutation();
  const markPaidMutation = useMarkTermPaidMutation();

  const isConfirmPending =
    deleteTermMutation.isPending ||
    markReadyMutation.isPending ||
    markPaidMutation.isPending;

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === "ready") {
      markReadyMutation.mutate(
        {
          termId: confirmAction.term.id,
          projectId: project.id,
          input: {},
        },
        {
          onSettled: () => setConfirmAction(null),
        }
      );
      return;
    }

    if (confirmAction.type === "paid") {
      markPaidMutation.mutate(
        {
          termId: confirmAction.term.id,
          projectId: project.id,
        },
        {
          onSettled: () => setConfirmAction(null),
        }
      );
      return;
    }

    if (confirmAction.type === "delete") {
      deleteTermMutation.mutate(
        {
          termId: confirmAction.term.id,
          projectId: project.id,
        },
        {
          onSettled: () => setConfirmAction(null),
        }
      );
    }
  };

  const getStatusBadge = (status: TermStatus) => {
    switch (status) {
      case "ready":
        return (
          <Badge className="bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            Siap Ditagih
          </Badge>
        );
      case "invoiced":
        return (
          <Badge className="bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            Tagihan Terbit
          </Badge>
        );
      case "paid":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" aria-hidden="true" />
            <span>Lunas</span>
          </Badge>
        );
      case "planned":
      default:
        return (
          <Badge
            variant="outline"
            className="text-muted-foreground text-[11px] font-medium px-2.5 py-0.5 rounded-full"
          >
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
          <HugeiconsIcon icon={Coins01Icon} className="size-6" aria-hidden="true" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">
          Belum Ada Kontrak & Termin Berbobot 100%
        </h4>
        <p className="text-xs text-muted-foreground mt-1 mb-6 max-w-md mx-auto">
          Susun kontrak proyek dengan bobot tepat 100%, tetapkan satu pemicu kesiapan per termin (Tanggal WIB, Jumlah Sprint Selesai, atau Manual), lalu catat invoice saat siap ditagih.
        </p>
        {canManageTerms && (
          <Button
            onClick={onOpenConfigModal}
            size="sm"
            className="rounded-full text-xs h-8.5 px-4 font-semibold shadow-xs"
          >
            <HugeiconsIcon icon={SparklesIcon} className="size-3.5 mr-1.5" aria-hidden="true" />
            Konfigurasi Kontrak & Termin 100%
          </Button>
        )}
      </div>
    );
  }

  const totalPercentage = terms.reduce((acc, t) => acc + (t.percentage || 0), 0);
  const totalAmount = terms.reduce((acc, t) => acc + (t.amount || 0), 0);
  const hasLockedTerms = terms.some((t) => t.isLocked);

  return (
    <div className="space-y-4">
      {/* Header Tabel & Summary Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Kontrak:
            </span>
            <p className="text-sm font-mono font-extrabold text-foreground">
              {formatRupiah(project.contractValue || totalAmount)}
            </p>
          </div>
          <div className="h-7 w-px bg-border hidden sm:block" />
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Bobot:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-mono font-bold text-foreground">
                {totalPercentage}%
              </span>
              {Math.abs(totalPercentage - 100) < 0.001 ? (
                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0 rounded-full font-semibold">
                  Valid 100%
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-[10px] px-2 py-0 rounded-full font-semibold">
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

        {canManageTerms && !hasLockedTerms && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenConfigModal}
            className="rounded-full text-xs h-8 px-3.5 font-medium shrink-0 self-start sm:self-auto"
          >
            <HugeiconsIcon icon={Coins01Icon} className="size-3.5 mr-1.5" aria-hidden="true" />
            Sesuaikan Termin 100%
          </Button>
        )}
      </div>

      {/* Tabel Termin Berbobot — Accessible Scrollable Table Region */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xs">
        <div
          tabIndex={0}
          role="region"
          aria-labelledby="payment-terms-caption"
          className="overflow-x-auto max-h-[600px] focus-visible:outline-2 focus-visible:outline-ring"
        >
          <table className="w-full min-w-[820px] text-xs text-left border-separate border-spacing-0">
            <caption id="payment-terms-caption" className="sr-only">
              Daftar termin pembayaran proyek, pemicu kesiapan, status, dan tindakan penagihan invoice
            </caption>
            <thead className="bg-muted/95 text-muted-foreground font-semibold sticky top-0 z-10 backdrop-blur-xs">
              <tr>
                <th scope="col" className="p-3.5 pl-5 border-b border-border">
                  Termin
                </th>
                <th scope="col" className="p-3.5 border-b border-border">
                  Bobot & Nilai
                </th>
                <th scope="col" className="p-3.5 border-b border-border">
                  Pemicu
                </th>
                <th scope="col" className="p-3.5 border-b border-border">
                  Dokumen BAST
                </th>
                <th scope="col" className="p-3.5 border-b border-border">
                  Status & Invoice
                </th>
                <th scope="col" className="p-3.5 pr-5 border-b border-border text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {terms.map((term, index) => {
                const isLast = index === terms.length - 1;
                const displayTriggerDate =
                  term.triggerDate || extractDateOnly(term.dueDate) || "-";
                const displayInvoiceDue =
                  term.invoiceDueDate || extractDateOnly(term.dueDate);

                return (
                  <tr
                    key={term.id}
                    className="hover:bg-muted/20 transition-colors [&>th]:border-b [&>th]:border-border/60 [&>td]:border-b [&>td]:border-border/60 last:[&>th]:border-b-0 last:[&>td]:border-b-0"
                  >
                    {/* Kolom Termin */}
                    <th scope="row" className="p-3.5 pl-5 text-left font-normal align-top">
                      <div className="flex items-start gap-2.5">
                        <span className="size-6 rounded-lg bg-primary/10 text-primary text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
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
                                className="text-[10px] py-0 px-1.5 rounded-full text-amber-700 dark:text-amber-300 border-amber-500/30 font-medium flex items-center gap-1"
                              >
                                <HugeiconsIcon icon={LockKeyIcon} className="size-2.5" aria-hidden="true" />
                                <span>Terkunci</span>
                              </Badge>
                            )}
                          </div>
                          {term.notes && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 max-w-xs">
                              {term.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </th>

                    {/* Kolom Bobot & Nilai */}
                    <td className="p-3.5 align-top">
                      <div>
                        <span className="font-mono font-extrabold text-foreground text-xs">
                          {formatRupiah(term.amount)}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <span className="font-mono font-bold text-primary">
                            {term.percentage}%
                          </span>
                          {isLast && (
                            <span className="text-[10px] text-muted-foreground italic">
                              (Penyerap Selisih)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Kolom Pemicu */}
                    <td className="p-3.5 align-top">
                      {term.triggerType === "sprint" && (
                        <div className="space-y-1">
                          <Badge
                            variant="secondary"
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 w-fit font-mono"
                          >
                            <HugeiconsIcon
                              icon={FastForwardIcon}
                              className="size-3 text-primary"
                              aria-hidden="true"
                            />
                            <span>
                              {term.requiredCompletedSprints
                                ? `Sprint: ${term.requiredCompletedSprints} Selesai`
                                : term.triggerSprint?.name || "Sprint Terkait"}
                            </span>
                          </Badge>
                          <p className="text-[10px] text-muted-foreground">
                            Otomatis siap saat target sprint selesai tercapai
                          </p>
                        </div>
                      )}

                      {term.triggerType === "date" && (
                        <div className="space-y-1">
                          <Badge
                            variant="secondary"
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 w-fit font-mono"
                          >
                            <HugeiconsIcon
                              icon={Calendar01Icon}
                              className="size-3 text-primary"
                              aria-hidden="true"
                            />
                            <span>Tanggal: {displayTriggerDate}</span>
                          </Badge>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDateWibDisplay(displayTriggerDate)} (WIB)
                          </p>
                        </div>
                      )}

                      {term.triggerType === "manual" && (
                        <div className="space-y-1">
                          <Badge
                            variant="outline"
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                          >
                            Manual
                          </Badge>
                          <p className="text-[10px] text-muted-foreground">
                            Ditandai siap secara manual
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Kolom Dokumen BAST */}
                    <td className="p-3.5 align-top">
                      {term.bastUrl ? (
                        <div className="space-y-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label={`Lihat dokumen BAST termin #${term.termNumber}`}
                            onClick={() => {
                              setPreviewBastUrl(term.bastUrl || null);
                              setPreviewBastName(
                                term.bastFileName || `BAST-Termin-${term.termNumber}`
                              );
                            }}
                            className="h-7 px-2 text-xs rounded-lg text-primary hover:bg-primary/10 font-semibold flex items-center gap-1"
                          >
                            <HugeiconsIcon icon={File01Icon} className="size-3.5" aria-hidden="true" />
                            <span className="truncate max-w-[120px]">
                              {term.bastFileName || "Dokumen BAST"}
                            </span>
                            <HugeiconsIcon icon={EyeIcon} className="size-3 ml-0.5" aria-hidden="true" />
                          </Button>
                          <p className="text-[10px] text-muted-foreground pl-2">
                            {formatDateWibDisplay(term.bastUploadedAt)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          Opsional (Belum ada)
                        </span>
                      )}
                    </td>

                    {/* Kolom Status & Invoice */}
                    <td className="p-3.5 align-top">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getStatusBadge(term.status)}
                          {term.overdue && (
                            <Badge
                              variant="destructive"
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                            >
                              <HugeiconsIcon
                                icon={AlertCircleIcon}
                                className="size-3"
                                aria-hidden="true"
                              />
                              <span>[Terlambat / Overdue]</span>
                            </Badge>
                          )}
                        </div>

                        {term.status === "ready" && term.readyAt && (
                          <p className="text-[10px] text-muted-foreground font-mono">
                            Siap: {formatDateWibDisplay(term.readyAt)}
                          </p>
                        )}

                        {term.invoiceNumber && (
                          <div className="space-y-0.5">
                            <div className="text-[11px] font-mono font-bold text-foreground flex items-center gap-1">
                              <HugeiconsIcon
                                icon={File01Icon}
                                className="size-3 text-muted-foreground"
                                aria-hidden="true"
                              />
                              <span>{term.invoiceNumber}</span>
                            </div>
                            {displayInvoiceDue && (
                              <p
                                className={`text-[10px] font-mono ${
                                  term.overdue
                                    ? "text-destructive font-semibold"
                                    : "text-muted-foreground"
                                }`}
                              >
                                Jatuh Tempo: {displayInvoiceDue}
                              </p>
                            )}
                          </div>
                        )}

                        {term.status === "paid" && term.paidAt && (
                          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                            Lunas: {formatDateWibDisplay(term.paidAt)}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Kolom Aksi */}
                    <td className="p-3.5 pr-5 text-right align-top">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {canManageTerms && term.status === "planned" && !term.isLocked && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setConfirmAction({ type: "ready", term })}
                              className="rounded-full text-[11px] h-7 px-3 font-semibold"
                            >
                              <HugeiconsIcon
                                icon={CheckmarkCircle02Icon}
                                className="size-3 mr-1"
                                aria-hidden="true"
                              />
                              Tandai Siap Ditagih
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              aria-label={`Unggah dokumen BAST termin #${term.termNumber}`}
                              onClick={() => {
                                setSelectedBastTerm(term);
                                setBastModalOpen(true);
                              }}
                              className="rounded-full text-[11px] h-7 px-2.5 text-muted-foreground hover:text-foreground"
                            >
                              <HugeiconsIcon icon={Upload04Icon} className="size-3 mr-1" aria-hidden="true" />
                              BAST
                            </Button>
                          </>
                        )}

                        {canCreateInvoices && term.status === "ready" && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoiceTerm(term);
                              setInvoiceModalOpen(true);
                            }}
                            className="rounded-full text-[11px] h-7 px-3 font-semibold shadow-xs"
                          >
                            <HugeiconsIcon icon={File01Icon} className="size-3 mr-1" aria-hidden="true" />
                            Catat Invoice
                          </Button>
                        )}

                        {canManageTerms && term.status === "ready" && !term.bastUrl && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            aria-label={`Unggah BAST untuk termin #${term.termNumber}`}
                            onClick={() => {
                              setSelectedBastTerm(term);
                              setBastModalOpen(true);
                            }}
                            className="rounded-full text-[11px] h-7 px-2.5 text-muted-foreground hover:text-foreground"
                          >
                            <HugeiconsIcon icon={Upload04Icon} className="size-3 mr-1" aria-hidden="true" />
                            BAST
                          </Button>
                        )}

                        {canCreateInvoices && term.status === "invoiced" && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setConfirmAction({ type: "paid", term })}
                            className="rounded-full text-[11px] h-7 px-3 font-semibold shadow-xs"
                          >
                            <HugeiconsIcon
                              icon={CheckmarkCircle02Icon}
                              className="size-3 mr-1"
                              aria-hidden="true"
                            />
                            Tandai Lunas
                          </Button>
                        )}

                        {(term.status === "invoiced" ||
                          term.status === "paid" ||
                          Boolean(term.invoiceNumber)) && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedInvoiceTerm(term);
                              setInvoiceModalOpen(true);
                            }}
                            className="rounded-full text-[11px] h-7 px-3 font-medium"
                          >
                            <HugeiconsIcon icon={PrinterIcon} className="size-3 mr-1" aria-hidden="true" />
                            Lihat Invoice
                          </Button>
                        )}

                        {canManageTerms && !term.isLocked && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Ubah termin #${term.termNumber} ${term.title}`}
                              onClick={() => {
                                setSelectedEditTerm(term);
                                setEditModalOpen(true);
                              }}
                              className="size-7 text-muted-foreground hover:text-foreground rounded-lg"
                            >
                              <HugeiconsIcon icon={Edit02Icon} className="size-3.5" aria-hidden="true" />
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Hapus termin #${term.termNumber} ${term.title}`}
                              onClick={() => setConfirmAction({ type: "delete", term })}
                              className="size-7 text-muted-foreground hover:text-destructive rounded-lg"
                            >
                              <HugeiconsIcon icon={Delete02Icon} className="size-3.5" aria-hidden="true" />
                            </Button>
                          </>
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

      {/* Modal Edit Pemicu / Judul Termin */}
      <EditPaymentTermModal
        projectId={project.id}
        term={selectedEditTerm}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />

      {/* Modal Upload BAST (Opsional) */}
      <UploadBastModal
        projectId={project.id}
        term={selectedBastTerm}
        open={bastModalOpen}
        onOpenChange={setBastModalOpen}
      />

      {/* Modal Preview & Catat Invoice */}
      <InvoicePdfModal
        project={project}
        term={selectedInvoiceTerm}
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
      />

      {/* AlertDialog Konfirmasi Aksi Termin (Tanpa window.confirm/alert) */}
      <AlertDialog
        open={Boolean(confirmAction)}
        onOpenChange={(val) => {
          if (!val && !isConfirmPending) setConfirmAction(null);
        }}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "ready" &&
                `Tandai Termin #${confirmAction.term.termNumber} Siap Ditagih?`}
              {confirmAction?.type === "paid" &&
                `Tandai Invoice ${confirmAction.term.invoiceNumber || ""} Lunas?`}
              {confirmAction?.type === "delete" &&
                `Hapus Termin #${confirmAction.term.termNumber}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "ready" && (
                <>
                  Status termin <strong>{confirmAction.term.title}</strong> sebesar{" "}
                  <span className="font-mono font-semibold">
                    {formatRupiah(confirmAction.term.amount)}
                  </span>{" "}
                  akan diubah ke <strong>Siap Ditagih (ready)</strong> sehingga invoice dapat segera dicatat.
                </>
              )}
              {confirmAction?.type === "paid" && (
                <>
                  Termin <strong>{confirmAction.term.title}</strong> (
                  <span className="font-mono">{confirmAction.term.invoiceNumber}</span>) akan
                  ditandai <strong>Lunas (paid)</strong> dan status overdue (jika ada) akan dibersihkan.
                </>
              )}
              {confirmAction?.type === "delete" && (
                <>
                  Termin <strong>{confirmAction.term.title}</strong> akan dihapus permanen. Pastikan
                  bobot total termin proyek tetap disesuaikan kembali hingga 100%.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConfirmPending} className="rounded-full">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              variant={confirmAction?.type === "delete" ? "destructive" : "default"}
              disabled={isConfirmPending}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmAction();
              }}
              className="rounded-full"
            >
              {isConfirmPending
                ? "Memproses..."
                : confirmAction?.type === "ready"
                ? "Ya, Tandai Siap Ditagih"
                : confirmAction?.type === "paid"
                ? "Ya, Tandai Lunas"
                : "Ya, Hapus Termin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              <iframe
                title={`Pratinjau BAST ${previewBastName}`}
                src={previewBastUrl}
                className="w-full h-[500px] rounded-xl border-none"
              />
            ) : previewBastUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewBastUrl}
                alt={`Dokumen BAST ${previewBastName}`}
                className="max-h-[500px] max-w-full rounded-xl object-contain shadow-xs"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
