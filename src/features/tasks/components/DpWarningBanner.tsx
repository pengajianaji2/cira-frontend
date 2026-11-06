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
    <div className="bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 dark:text-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all animate-in fade-in-50 duration-200">
      <div className="flex items-start gap-3.5">
        <div className="size-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
          <HugeiconsIcon icon={Alert02Icon} className="size-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold tracking-tight text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
            ⚠️ Perhatian: Proyek aktif ini belum memiliki pembayaran DP/termin yang terverifikasi.
          </h4>
          <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed max-w-2xl">
            Sesuai aturan operasional, pengerjaan task pengembangan disarankan tidak mendahului verifikasi pembayaran DP. Segera validasi bukti transfer di tab Keuangan.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push(`/projects/${projectId}?tab=finance`)}
          className="rounded-full text-xs h-8 px-3.5 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-900 dark:text-amber-100 font-semibold"
        >
          <span>Ke Tab Keuangan</span>
          <HugeiconsIcon icon={ArrowRight02Icon} className="size-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
