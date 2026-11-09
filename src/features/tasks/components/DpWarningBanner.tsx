"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useProjectPaymentStatusQuery } from "../queries/tasks.queries";

interface DpWarningBannerProps {
  projectId: string;
  projectStatus: string;
}

export function DpWarningBanner({ projectId, projectStatus }: DpWarningBannerProps) {
  const router = useRouter();
  const { data: paymentStatus } = useProjectPaymentStatusQuery(projectId);

  // AC-8: Banner hanya muncul jika proyek berstatus 'active' DAN belum memiliki pembayaran 'verified'
  const isProjectActive = projectStatus === "active";
  const hasVerifiedPayment = paymentStatus?.hasVerifiedPayment ?? false;

  if (!isProjectActive || hasVerifiedPayment) {
    return null;
  }

  return (
    <div
      role="status"
      className="bg-notice-dp-bg border-2 border-notice-dp-border text-notice-dp-text rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all animate-in fade-in-50 duration-200"
    >
      <div className="flex items-start gap-3.5">
        <div className="size-10 rounded-xl bg-notice-dp-border/30 text-notice-dp-text flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
          <HugeiconsIcon icon={Alert02Icon} className="size-5" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold tracking-tight text-notice-dp-text">
            Perhatian: Proyek aktif ini belum memiliki pembayaran DP/termin yang terverifikasi.
          </h4>
          <p className="text-xs text-notice-dp-text/80 leading-relaxed max-w-2xl">
            Sesuai aturan operasional, pengerjaan task pengembangan disarankan tidak mendahului verifikasi pembayaran DP. Segera validasi bukti transfer di tab Keuangan.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(`/projects/${projectId}?tab=finance`)}
          className="rounded-full text-xs h-8 px-3.5 bg-notice-dp-bg hover:bg-notice-dp-border/40 border-notice-dp-border text-notice-dp-text font-semibold cursor-pointer"
        >
          <span>Ke Tab Keuangan</span>
          <HugeiconsIcon icon={ArrowRight02Icon} className="size-3.5 ml-1" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
