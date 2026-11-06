"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Coins01Icon,
  Add01Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Project } from "@/features/projects";
import {
  usePaymentsQuery,
  useFinanceSummaryQuery,
} from "../queries/finance.queries";
import { FinanceOverviewCards } from "./FinanceOverviewCards";
import { PaymentMilestoneList } from "./PaymentMilestoneList";
import { CreatePaymentDialog } from "./CreatePaymentDialog";
import { UpdateContractValueDialog } from "./UpdateContractValueDialog";

interface FinanceTabContentProps {
  project: Project;
}

export function FinanceTabContent({ project }: FinanceTabContentProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);

  const { data: payments = [], isLoading: isLoadingPayments } = usePaymentsQuery(
    project.id
  );

  const { data: summary } = useFinanceSummaryQuery(
    project.id,
    project.contractValue || 0
  );

  const defaultSummary = {
    contractValue: project.contractValue || 0,
    totalVerified: 0,
    totalPending: 0,
    remainingBalance: project.contractValue || 0,
    paidPercentage: 0,
    milestonesCount: 0,
    verifiedCount: 0,
    pendingCount: 0,
    hasVerifiedDp: false,
  };

  return (
    <div className="space-y-6">
      {/* Top Section / Header */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Coins01Icon} className="size-4.5" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              Manajemen Keuangan & Termin
            </h2>
          </div>
          <p className="text-xs text-muted-foreground pl-11">
            Pantau nilai kontrak, catat termin pembayaran, unggah bukti transfer, dan verifikasi status pembayaran klien.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto pl-11 sm:pl-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setContractDialogOpen(true)}
            className="rounded-full text-xs h-8.5 px-3.5 font-medium"
          >
            <HugeiconsIcon icon={Edit02Icon} className="size-3.5 mr-1.5" />
            Ubah Kontrak
          </Button>

          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="rounded-full text-xs h-8.5 px-4 font-semibold shadow-xs"
          >
            <HugeiconsIcon icon={Add01Icon} className="size-3.5 mr-1.5" />
            Tambah Termin
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <FinanceOverviewCards
        summary={summary || defaultSummary}
        onOpenUpdateContract={() => setContractDialogOpen(true)}
      />

      {/* Milestone List */}
      <PaymentMilestoneList
        payments={payments}
        isLoading={isLoadingPayments}
        onOpenCreate={() => setCreateDialogOpen(true)}
      />

      {/* Dialogs */}
      <CreatePaymentDialog
        projectId={project.id}
        contractValue={project.contractValue || 0}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <UpdateContractValueDialog
        projectId={project.id}
        currentValue={project.contractValue || 0}
        open={contractDialogOpen}
        onOpenChange={setContractDialogOpen}
      />
    </div>
  );
}
