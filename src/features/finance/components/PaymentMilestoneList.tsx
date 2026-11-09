"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Coins01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  EyeIcon,
  Upload04Icon,
  Delete02Icon,
  Calendar01Icon,
  File01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
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
import { Payment } from "../types/finance.types";
import {
  useVerifyPaymentMutation,
  useDeletePaymentMutation,
} from "../queries/finance.queries";
import { PaymentProofDialog } from "./PaymentProofDialog";

interface PaymentMilestoneListProps {
  payments: Payment[];
  isLoading: boolean;
  onOpenCreate: () => void;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PaymentMilestoneList({
  payments,
  isLoading,
  onOpenCreate,
}: PaymentMilestoneListProps) {
  const [selectedProofPayment, setSelectedProofPayment] = useState<Payment | null>(
    null
  );
  const [proofDialogOpen, setProofDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const verifyMutation = useVerifyPaymentMutation();
  const deleteMutation = useDeletePaymentMutation();

  const handleOpenProof = (payment: Payment) => {
    setSelectedProofPayment(payment);
    setProofDialogOpen(true);
  };

  const handleVerifyToggle = (payment: Payment, verified: boolean) => {
    verifyMutation.mutate({
      paymentId: payment.id,
      projectId: payment.projectId,
      verified,
    });
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!paymentToDelete) return;
    deleteMutation.mutate(
      {
        paymentId: paymentToDelete.id,
        projectId: paymentToDelete.projectId,
      },
      {
        onSuccess: () => {
          setPaymentToDelete(null);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[220px] flex flex-col items-center justify-center gap-3 bg-card border border-border rounded-3xl p-8">
        <Spinner className="size-6 text-primary" />
        <p className="text-xs text-muted-foreground">Memuat data termin pembayaran...</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-card border border-border border-dashed rounded-3xl p-12 text-center">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
          <HugeiconsIcon icon={Coins01Icon} className="size-6" aria-hidden="true" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">Belum Ada Termin Pembayaran</h4>
        <p className="text-xs text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">
          Catat termin pembayaran untuk proyek ini agar termin DP, milestone, dan pelunasan dapat dipantau dan diverifikasi dengan transparan.
        </p>
        <Button
          type="button"
          onClick={onOpenCreate}
          size="sm"
          className="rounded-full text-xs h-8 px-4 font-semibold"
        >
          Tambah Termin Pertama
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">
          Daftar Termin Pembayaran ({payments.length})
        </h3>
        <span className="text-xs text-muted-foreground">
          Diverifikasi oleh Owner / Operasional
        </span>
      </div>

      <div className="space-y-3">
        {payments.map((p, idx) => {
          const isVerified = p.status === "verified";
          return (
            <div
              key={p.id}
              className={`bg-card border rounded-3xl p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isVerified
                  ? "border-emerald-500/30 hover:border-emerald-500/50"
                  : "border-border hover:border-border/80"
              }`}
            >
              {/* Left Column: Info & Status */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-bold text-muted-foreground/60 w-5">
                    #{idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-foreground">
                    {p.title}
                  </h4>
                  <Badge
                    variant="outline"
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                      isVerified
                        ? "bg-status-success-surface text-status-success-text border-status-success-border"
                        : "bg-status-warning-surface text-status-warning-text border-status-warning-border"
                    }`}
                  >
                    {isVerified ? (
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" aria-hidden="true" />
                        Terverifikasi
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={AlertCircleIcon} className="size-3" aria-hidden="true" />
                        Pending Approval
                      </span>
                    )}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-bold text-foreground text-sm">
                    {formatRupiah(p.amount)}
                  </span>
                  {p.dueDate && (
                    <>
                      <span aria-hidden="true">•</span>
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={Calendar01Icon} className="size-3 text-muted-foreground/70" aria-hidden="true" />
                        Jatuh tempo: {p.dueDate}
                      </span>
                    </>
                  )}
                  {p.proofFileName && (
                    <>
                      <span aria-hidden="true">•</span>
                      <span className="flex items-center gap-1 text-primary">
                        <HugeiconsIcon icon={File01Icon} className="size-3" aria-hidden="true" />
                        {p.proofFileName}
                      </span>
                    </>
                  )}
                </div>

                {p.notes && (
                  <p className="text-xs text-muted-foreground/90 italic">
                    &ldquo;{p.notes}&rdquo;
                  </p>
                )}

                {isVerified && p.verifiedBy && (
                  <p className="text-[11px] text-emerald-600/80 font-medium">
                    Diverifikasi oleh {p.verifiedBy.name} ({p.verifiedBy.role})
                  </p>
                )}
              </div>

              {/* Right Column: Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
                {/* Proof Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenProof(p)}
                  className="rounded-full text-xs h-8 px-3"
                >
                  <HugeiconsIcon
                    icon={p.proofUrl ? EyeIcon : Upload04Icon}
                    className="size-3.5 mr-1.5 text-primary"
                    aria-hidden="true"
                  />
                  {p.proofUrl ? "Lihat Bukti Transfer" : "Upload Bukti"}
                </Button>

                {/* Verification Toggle Button */}
                {isVerified ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVerifyToggle(p, false)}
                    disabled={verifyMutation.isPending}
                    className="rounded-full text-xs h-8 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Batalkan status verifikasi termin ini"
                  >
                    Batal Verifikasi
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => handleVerifyToggle(p, true)}
                    disabled={verifyMutation.isPending}
                    className="rounded-full text-xs h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                  >
                    {verifyMutation.isPending ? (
                      <Spinner className="size-3.5 mr-1.5 text-white" />
                    ) : (
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 mr-1.5" aria-hidden="true" />
                    )}
                    Verifikasi Pembayaran
                  </Button>
                )}

                {/* Delete Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setPaymentToDelete(p)}
                  disabled={deleteMutation.isPending}
                  className="rounded-full text-muted-foreground/60 hover:text-destructive size-8 cursor-pointer"
                  aria-label={`Hapus termin "${p.title}"`}
                  title="Hapus termin"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Proof Lightbox Modal */}
      <PaymentProofDialog
        payment={selectedProofPayment}
        open={proofDialogOpen}
        onOpenChange={setProofDialogOpen}
      />

      {/* AlertDialog Konfirmasi Hapus Termin */}
      <AlertDialog
        open={Boolean(paymentToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setPaymentToDelete(null);
          }
        }}
      >
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Hapus Termin Pembayaran?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin menghapus termin pembayaran &ldquo;{paymentToDelete?.title}&rdquo;? Data verifikasi yang terkait tidak dapat dipulihkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              className="rounded-full text-xs h-9"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
              className="rounded-full text-xs h-9 font-semibold"
            >
              {deleteMutation.isPending && <Spinner className="size-3.5 mr-1.5" />}
              Ya, Hapus Termin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
