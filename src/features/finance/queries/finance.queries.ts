import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { financeApi } from "../api/finance.api";
import {
  CreatePaymentInput,
  CreateContractInput,
  UpdateTermInput,
  UploadBastInput,
  IssueInvoiceInput,
} from "../types/finance.types";
import { activityKeys } from "@/features/activity/queries/activity.queries";
import { PROJECT_KEYS } from "@/features/projects/queries/projects.queries";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const res = (err as { response?: { data?: { message?: string } } }).response;
    if (res?.data?.message) return res.data.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export const financeKeys = {
  all: ["finance"] as const,
  payments: (projectId: string) => [...financeKeys.all, "payments", projectId] as const,
  summary: (projectId: string) => [...financeKeys.all, "summary", projectId] as const,
};

export const termsKeys = {
  all: ["payment-terms"] as const,
  lists: () => [...termsKeys.all, "list"] as const,
  list: (projectId: string) => [...termsKeys.lists(), projectId] as const,
  detail: (id: string) => [...termsKeys.all, "detail", id] as const,
};

export function useProjectTermsQuery(projectId: string) {
  return useQuery({
    queryKey: termsKeys.list(projectId),
    queryFn: async () => {
      const res = await financeApi.getProjectTerms(projectId);
      return res.data || [];
    },
    enabled: Boolean(projectId),
  });
}

export function useTermDetailQuery(termId: string) {
  return useQuery({
    queryKey: termsKeys.detail(termId),
    queryFn: async () => {
      const res = await financeApi.getTermById(termId);
      return res.data;
    },
    enabled: Boolean(termId),
  });
}

export function useCreateContractMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      input,
    }: {
      projectId: string;
      input: CreateContractInput;
    }) => financeApi.createContract(projectId, input),
    onSuccess: (_, variables) => {
      toast.success("Kontrak dan termin pembayaran 100% berhasil dikonfigurasi!");
      queryClient.invalidateQueries({ queryKey: termsKeys.list(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.summary(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["operations", "calendar"] });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal mengonfigurasi kontrak dan termin"));
    },
  });
}

export function useUpdateTermMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      termId,
      input,
    }: {
      termId: string;
      projectId: string;
      input: UpdateTermInput;
    }) => financeApi.updateTerm(termId, input),
    onSuccess: (_, variables) => {
      toast.success("Konfigurasi termin berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: termsKeys.list(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: termsKeys.detail(variables.termId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.summary(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["operations", "calendar"] });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal memperbarui termin pembayaran"));
    },
  });
}

export function useMarkTermReadyWithBastMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      termId,
      input = {},
    }: {
      termId: string;
      projectId: string;
      input?: UploadBastInput;
    }) => financeApi.markTermReadyWithBast(termId, input),
    onSuccess: (_, variables) => {
      toast.success("Termin berhasil ditandai Siap Ditagih!");
      queryClient.invalidateQueries({ queryKey: termsKeys.list(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: termsKeys.detail(variables.termId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.summary(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["operations", "calendar"] });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal memperbarui status termin menjadi siap ditagih"));
    },
  });
}

export function useUploadBastFileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      termId,
      file,
    }: {
      termId: string;
      projectId: string;
      file: File;
    }) => financeApi.uploadBastFile(termId, file),
    onSuccess: (_, variables) => {
      toast.success("Berkas BAST berhasil diunggah. Termin berstatus Siap Ditagih!");
      queryClient.invalidateQueries({ queryKey: termsKeys.list(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: termsKeys.detail(variables.termId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.summary(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["operations", "calendar"] });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal mengunggah berkas BAST"));
    },
  });
}

export function useIssueInvoiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      termId,
      input,
    }: {
      termId: string;
      projectId: string;
      input: IssueInvoiceInput;
    }) => financeApi.issueInvoice(termId, input),
    onSuccess: (res, variables) => {
      const invNum = res.data?.invoiceNumber || "resmi";
      toast.success(`Invoice ${invNum} berhasil diterbitkan dan termin dikunci!`);
      queryClient.invalidateQueries({ queryKey: termsKeys.list(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: termsKeys.detail(variables.termId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.summary(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["operations", "calendar"] });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal menerbitkan invoice resmi"));
    },
  });
}

export function useMarkTermPaidMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      termId,
    }: {
      termId: string;
      projectId: string;
    }) => financeApi.markTermPaid(termId),
    onSuccess: (_, variables) => {
      toast.success("Termin berhasil ditandai Lunas!");
      queryClient.invalidateQueries({ queryKey: termsKeys.list(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: termsKeys.detail(variables.termId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.summary(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["operations", "calendar"] });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal menandai termin lunas"));
    },
  });
}

export function useDeleteTermMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      termId,
    }: {
      termId: string;
      projectId: string;
    }) => financeApi.deleteTerm(termId),
    onSuccess: (_, variables) => {
      toast.success("Termin pembayaran berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: termsKeys.list(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.summary(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["operations", "calendar"] });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal menghapus termin"));
    },
  });
}

// =========================================================================
// Existing Payment Queries & Mutations
// =========================================================================

export function usePaymentsQuery(projectId: string) {
  return useQuery({
    queryKey: financeKeys.payments(projectId),
    queryFn: async () => {
      const res = await financeApi.getPayments(projectId);
      return res.data;
    },
    enabled: Boolean(projectId),
  });
}

export function useFinanceSummaryQuery(projectId: string, contractValue: number = 0) {
  return useQuery({
    queryKey: [...financeKeys.summary(projectId), contractValue],
    queryFn: async () => {
      return financeApi.getFinanceSummary(projectId);
    },
    enabled: Boolean(projectId),
  });
}

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      input,
    }: {
      projectId: string;
      input: CreatePaymentInput;
    }) => financeApi.createPayment(projectId, input),
    onSuccess: (_, variables) => {
      toast.success("Termin pembayaran berhasil ditambahkan!");
      queryClient.invalidateQueries({ queryKey: financeKeys.payments(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.summary(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal menambahkan termin pembayaran"));
    },
  });
}

export function useVerifyPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      verified,
    }: {
      paymentId: string;
      projectId: string;
      verified: boolean;
    }) => financeApi.verifyPayment(paymentId, verified),
    onSuccess: (_, variables) => {
      toast.success(
        variables.verified
          ? "Pembayaran berhasil diverifikasi!"
          : "Verifikasi pembayaran berhasil dibatalkan."
      );
      queryClient.invalidateQueries({ queryKey: financeKeys.payments(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.summary(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal memperbarui status verifikasi"));
    },
  });
}

export function useUploadProofMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      file,
    }: {
      paymentId: string;
      projectId: string;
      file: File;
    }) => financeApi.uploadProof(paymentId, file),
    onSuccess: (_, variables) => {
      toast.success("Bukti transfer berhasil diunggah!");
      queryClient.invalidateQueries({ queryKey: financeKeys.payments(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal mengunggah bukti transfer"));
    },
  });
}

export function useDeletePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
    }: {
      paymentId: string;
      projectId: string;
    }) => financeApi.deletePayment(paymentId),
    onSuccess: (_, variables) => {
      toast.success("Termin berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: financeKeys.payments(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.summary(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal menghapus termin"));
    },
  });
}

export function useUpdateContractValueMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      contractValue,
    }: {
      projectId: string;
      contractValue: number;
    }) => financeApi.updateContractValue(projectId, contractValue),
    onSuccess: (_, variables) => {
      toast.success("Nilai kontrak berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: financeKeys.summary(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Gagal memperbarui nilai kontrak"));
    },
  });
}
