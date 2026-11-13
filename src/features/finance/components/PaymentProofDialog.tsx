"use client";
import { resolvePrivateFileUrl } from "@/shared/lib/private-file-upload";

import React, { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  File01Icon,
  Upload04Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Payment } from "../types/finance.types";
import {
  useVerifyPaymentMutation,
  useUploadProofMutation,
} from "../queries/finance.queries";

interface PaymentProofDialogProps {
  payment: Payment | null;
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

export function PaymentProofDialog({
  payment,
  open,
  onOpenChange,
}: PaymentProofDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const verifyMutation = useVerifyPaymentMutation();
  const uploadMutation = useUploadProofMutation();
  const [isUploading, setIsUploading] = useState(false);

  if (!payment) return null;

  const handleVerify = () => {
    verifyMutation.mutate(
      {
        paymentId: payment.id,
        projectId: payment.projectId,
        verified: true,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await uploadMutation.mutateAsync({
        paymentId: payment.id,
        projectId: payment.projectId,
        file,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isVerified = payment.status === "verified";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between gap-3 pr-6">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={File01Icon} className="size-4.5 text-primary" />
              Bukti Transfer — {payment.title}
            </DialogTitle>
            <Badge
              variant="outline"
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                isVerified
                  ? "bg-status-success-surface text-status-success-text border-status-success-border"
                  : "bg-status-warning-surface text-status-warning-text border-status-warning-border"
              }`}
            >
              {isVerified ? "Terverifikasi" : "Menunggu Verifikasi"}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Nominal tagihan:{" "}
            <span className="font-semibold text-foreground">
              {formatRupiah(payment.amount)}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Proof Preview Box */}
        <div className="space-y-4 my-2">
          {payment.proofUrl ? (
            <div className="relative border border-border rounded-2xl overflow-hidden bg-muted/30 flex items-center justify-center p-3 max-h-[380px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {payment.proofMimeType === "application/pdf" ? <iframe title={payment.proofFileName || "Bukti Transfer"} src={resolvePrivateFileUrl(payment.proofUrl)} className="h-[350px] w-full rounded-xl" /> : <img src={resolvePrivateFileUrl(payment.proofUrl)} alt={payment.proofFileName || "Bukti Transfer"} crossOrigin="use-credentials" className="max-h-[350px] w-auto object-contain rounded-xl shadow-xs" />}
            </div>
          ) : (
            <div className="border border-dashed border-border rounded-2xl p-8 text-center bg-muted/20 space-y-3">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <HugeiconsIcon icon={File01Icon} className="size-6" />
              </div>
              <p className="text-xs text-muted-foreground">
                Belum ada berkas bukti transfer yang diunggah untuk termin ini.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="rounded-full text-xs h-8 px-4"
              >
                {isUploading ? (
                  <Spinner className="size-3.5 mr-1.5" />
                ) : (
                  <HugeiconsIcon icon={Upload04Icon} className="size-3.5 mr-1.5 text-primary" />
                )}
                Unggah Bukti Sekarang
              </Button>
            </div>
          )}

          {/* Details & Metadata Card */}
          <div className="bg-muted/40 rounded-2xl p-4 border border-border/60 text-xs space-y-2">
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div>
                <span className="block text-[11px]">Nama Berkas:</span>
                <span className="font-medium text-foreground truncate block">
                  {payment.proofFileName || "Belum ada berkas"}
                </span>
              </div>
              <div>
                <span className="block text-[11px]">Status Termin:</span>
                <span className="font-medium text-foreground">
                  {isVerified ? "Sudah Terverifikasi" : "Pending Approval"}
                </span>
              </div>
              {payment.dueDate && (
                <div>
                  <span className="block text-[11px]">Jatuh Tempo:</span>
                  <span className="font-medium text-foreground">
                    {payment.dueDate}
                  </span>
                </div>
              )}
              {payment.verifiedBy && (
                <div>
                  <span className="block text-[11px]">Diverifikasi Oleh:</span>
                  <span className="font-medium text-foreground">
                    {payment.verifiedBy.name} ({payment.verifiedBy.role})
                  </span>
                </div>
              )}
            </div>

            {payment.notes && (
              <div className="pt-2 border-t border-border/40">
                <span className="block text-[11px] text-muted-foreground">Catatan:</span>
                <p className="text-foreground text-xs mt-0.5">{payment.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="rounded-full text-xs h-8 px-3 text-muted-foreground hover:text-foreground"
            >
              {isUploading ? (
                <Spinner className="size-3 mr-1.5" />
              ) : (
                <HugeiconsIcon icon={Upload04Icon} className="size-3.5 mr-1.5" />
              )}
              {payment.proofUrl ? "Ganti Berkas Bukti" : "Unggah Bukti"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-full text-xs h-8 px-4"
            >
              Tutup
            </Button>

            {!isVerified && (
              <Button
                type="button"
                size="sm"
                onClick={handleVerify}
                disabled={verifyMutation.isPending}
                className="rounded-full text-xs h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {verifyMutation.isPending ? (
                  <Spinner className="size-3.5 mr-1.5 text-white" />
                ) : (
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 mr-1.5" />
                )}
                Verifikasi Pembayaran
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
