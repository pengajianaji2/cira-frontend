"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Coins01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  CreditCardIcon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FinanceSummary } from "../types/finance.types";

interface FinanceOverviewCardsProps {
  summary: FinanceSummary;
  onOpenUpdateContract: () => void;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function FinanceOverviewCards({
  summary,
  onOpenUpdateContract,
}: FinanceOverviewCardsProps) {
  return (
    <div className="space-y-4">
      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Nilai Kontrak */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Total Nilai Kontrak
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onOpenUpdateContract}
              aria-label="Sesuaikan nilai kontrak"
              title="Sesuaikan nilai kontrak"
              className="text-muted-foreground hover:text-foreground size-6 rounded-full cursor-pointer"
            >
              <HugeiconsIcon icon={Edit02Icon} className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold tracking-tight text-foreground block">
              {formatRupiah(summary.contractValue)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <HugeiconsIcon icon={CreditCardIcon} className="size-3.5 text-primary" aria-hidden="true" />
            <span>{summary.milestonesCount} Termin Tercatat</span>
          </div>
        </div>

        {/* Card 2: Terverifikasi (Diterima) */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Total Terverifikasi
            </span>
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-semibold"
            >
              {summary.verifiedCount} Lunas
            </Badge>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 block">
              {formatRupiah(summary.totalVerified)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 text-emerald-600" aria-hidden="true" />
            <span>{summary.paidPercentage}% Dari total kontrak</span>
          </div>
        </div>

        {/* Card 3: Menunggu Verifikasi (Pending) */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Menunggu Verifikasi
            </span>
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] px-2 py-0.5 rounded-full font-semibold"
            >
              {summary.pendingCount} Pending
            </Badge>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400 block">
              {formatRupiah(summary.totalPending)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5 text-amber-600" aria-hidden="true" />
            <span>Membutuhkan tinjauan Owner</span>
          </div>
        </div>

        {/* Card 4: Sisa Tagihan */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Sisa Tagihan
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Outstanding
            </span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold tracking-tight text-foreground block">
              {formatRupiah(summary.remainingBalance)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <HugeiconsIcon icon={Coins01Icon} className="size-3.5 text-muted-foreground" aria-hidden="true" />
            <span>
              {summary.remainingBalance === 0
                ? "Lunas sepenuhnya"
                : "Belum terbayarkan"}
            </span>
          </div>
        </div>
      </div>

      {/* Progress & DP Assurance Bar */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">Progres Pelunasan Finansial</span>
            <span className="text-muted-foreground">
              ({formatRupiah(summary.totalVerified)} dari{" "}
              {formatRupiah(summary.contractValue)})
            </span>
          </div>
          <span className="font-extrabold text-primary text-sm">
            {summary.paidPercentage}%
          </span>
        </div>

        <Progress value={summary.paidPercentage} className="h-2.5 bg-muted rounded-full" />

        {/* DP Guard Banner Notice */}
        {summary.hasVerifiedDp ? (
          <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-2xl px-4 py-2.5 text-xs">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <p className="leading-relaxed">
              <span className="font-bold">DP Proyek Terverifikasi:</span> Pembayaran termin telah
              dikonfirmasi oleh Owner. Pengerjaan checklist task telah aman dan tidak ada banner peringatan DP.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-2xl px-4 py-2.5 text-xs">
            <HugeiconsIcon
              icon={AlertCircleIcon}
              className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
            <p className="leading-relaxed">
              <span className="font-bold">Perhatian Operasional:</span> Belum ada pembayaran yang
              diverifikasi sebagai DP. Task Board menampilkan peringatan dini agar tim tidak mendahului kepastian pembayaran klien.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
