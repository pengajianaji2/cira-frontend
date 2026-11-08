"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Coins01Icon,
  Edit02Icon,
  SparklesIcon,
  File01Icon,
  Invoice01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@/features/projects";
import { useMyPermissionsQuery } from "@/features/auth/queries/auth.queries";
import {
  usePaymentsQuery,
  useProjectTermsQuery,
  useFinanceSummaryQuery,
} from "../queries/finance.queries";
import { FinanceOverviewCards } from "./FinanceOverviewCards";
import { PaymentMilestoneList } from "./PaymentMilestoneList";
import { CreatePaymentDialog } from "./CreatePaymentDialog";
import { UpdateContractValueDialog } from "./UpdateContractValueDialog";
import { PaymentTermsTable } from "./PaymentTermsTable";
import { ContractConfigModal } from "./ContractConfigModal";

interface FinanceTabContentProps {
  project: Project;
}

export function FinanceTabContent({ project }: FinanceTabContentProps) {
  const { data: permissions = [] } = useMyPermissionsQuery();
  const isFinanceManager = permissions.includes("finance.write");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [contractConfigOpen, setContractConfigOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("terms");

  const { data: payments = [], isLoading: isLoadingPayments } = usePaymentsQuery(
    project.id
  );

  const { data: terms = [], isLoading: isLoadingTerms } = useProjectTermsQuery(
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
    termsCount: terms.length,
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
              Manajemen Keuangan, Termin 100%, & Invoice
            </h2>
          </div>
          <p className="text-xs text-muted-foreground pl-11">
            Susun termin berbobot tepat 100%, unggah bukti BAST penyelesaian modul, dan terbitkan invoice resmi PDF bernomor seri otomatis.
          </p>
        </div>

        {isFinanceManager && (
          <div className="flex items-center gap-2 self-start sm:self-auto pl-11 sm:pl-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setContractDialogOpen(true)}
              className="rounded-full text-xs h-8.5 px-3.5 font-medium"
            >
              <HugeiconsIcon icon={Edit02Icon} className="size-3.5 mr-1.5" />
              Ubah Nilai Kontrak
            </Button>

            <Button
              size="sm"
              onClick={() => setContractConfigOpen(true)}
              className="rounded-full text-xs h-8.5 px-4 font-semibold shadow-xs"
            >
              <HugeiconsIcon icon={SparklesIcon} className="size-3.5 mr-1.5" />
              Kelola Kontrak 100%
            </Button>
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <FinanceOverviewCards
        summary={summary || defaultSummary}
        onOpenUpdateContract={() => setContractDialogOpen(true)}
      />

      {/* Tabs Tampilan Keuangan */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-2xl h-10">
          <TabsTrigger
            value="terms"
            className="rounded-xl text-xs font-semibold px-4 h-8 data-[state=active]:bg-card data-[state=active]:shadow-xs flex items-center gap-1.5"
          >
            <HugeiconsIcon icon={File01Icon} className="size-3.5" />
            Termin Kontrak 100% & Invoice ({terms.length})
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="rounded-xl text-xs font-semibold px-4 h-8 data-[state=active]:bg-card data-[state=active]:shadow-xs flex items-center gap-1.5"
          >
            <HugeiconsIcon icon={Invoice01Icon} className="size-3.5" />
            Riwayat Pembayaran ({payments.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: US-4 Termin Kontrak 100% & Invoice */}
        <TabsContent value="terms" className="space-y-4 mt-0">
          <PaymentTermsTable
            project={project}
            terms={terms}
            isLoading={isLoadingTerms}
            onOpenConfigModal={() => setContractConfigOpen(true)}
          />
        </TabsContent>

        {/* Tab 2: Existing Payments */}
        <TabsContent value="payments" className="space-y-4 mt-0">
          <PaymentMilestoneList
            payments={payments}
            isLoading={isLoadingPayments}
            onOpenCreate={() => setCreateDialogOpen(true)}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ContractConfigModal
        projectId={project.id}
        initialContractValue={project.contractValue || 0}
        existingTerms={terms}
        open={contractConfigOpen}
        onOpenChange={setContractConfigOpen}
      />

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
