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

  const handleDelete = (payment: Payment) => {
    if (confirm(`Hapus termin pembayaran "${payment.title}"?`)) {
      deleteMutation.mutate({
        paymentId: payment.id,
        projectId: payment.projectId,
      });
    }
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
          <HugeiconsIcon icon={Coins01Icon} className="size-6" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">Belum Ada Termin Pembayaran</h4>
        <p className="text-xs text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">
          Catat termin pembayaran untuk proyek ini agar termin DP, milestone, dan pelunasan dapat dipantau dan diverifikasi dengan transparan.
        </p>
        <Button
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
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {isVerified ? (
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" />
                        Terverifikasi
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={AlertCircleIcon} className="size-3" />
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
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={Calendar01Icon} className="size-3 text-muted-foreground/70" />
                        Jatuh tempo: {p.dueDate}
                      </span>
                    </>
                  )}
                  {p.proofFileName && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-primary">
                        <HugeiconsIcon icon={File01Icon} className="size-3" />
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
                  <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
                    ✓ Diverifikasi oleh {p.verifiedBy.name} ({p.verifiedBy.role})
                  </p>
                )}
              </div>

              {/* Right Column: Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
                {/* Proof Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenProof(p)}
                  className="rounded-full text-xs h-8 px-3"
                >
                  <HugeiconsIcon
                    icon={p.proofUrl ? EyeIcon : Upload04Icon}
                    className="size-3.5 mr-1.5 text-primary"
                  />
                  {p.proofUrl ? "Lihat Bukti Transfer" : "Upload Bukti"}
                </Button>

                {/* Verification Toggle Button */}
                {isVerified ? (
                  <Button
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
                    variant="default"
                    size="sm"
                    onClick={() => handleVerifyToggle(p, true)}
                    disabled={verifyMutation.isPending}
                    className="rounded-full text-xs h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                  >
                    {verifyMutation.isPending ? (
                      <Spinner className="size-3.5 mr-1.5 text-white" />
                    ) : (
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 mr-1.5" />
                    )}
                    Verifikasi Pembayaran
                  </Button>
                )}

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(p)}
                  disabled={deleteMutation.isPending}
                  className="rounded-full text-muted-foreground/60 hover:text-destructive size-8"
                  title="Hapus termin"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
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
    </div>
  );
}
