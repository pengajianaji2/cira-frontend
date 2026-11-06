import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { financeApi } from "../api/finance.api";
import { CreatePaymentInput } from "../types/finance.types";
import { activityKeys } from "@/features/activity/queries/activity.queries";
import { PROJECT_KEYS } from "@/features/projects/queries/projects.queries";

export const financeKeys = {
  all: ["finance"] as const,
  payments: (projectId: string) => [...financeKeys.all, "payments", projectId] as const,
  summary: (projectId: string) => [...financeKeys.all, "summary", projectId] as const,
};

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
      return financeApi.getFinanceSummary(projectId, contractValue);
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
      queryClient.invalidateQueries({
        queryKey: financeKeys.payments(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: financeKeys.summary(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: activityKeys.lists(),
      });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Gagal menambahkan termin pembayaran");
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
      queryClient.invalidateQueries({
        queryKey: financeKeys.payments(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: financeKeys.summary(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: activityKeys.lists(),
      });
      // Invalidate tasks to update DP banner
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Gagal memperbarui status verifikasi");
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
      queryClient.invalidateQueries({
        queryKey: financeKeys.payments(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: activityKeys.lists(),
      });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Gagal mengunggah bukti transfer");
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
      queryClient.invalidateQueries({
        queryKey: financeKeys.payments(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: financeKeys.summary(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: activityKeys.lists(),
      });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Gagal menghapus termin");
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
      queryClient.invalidateQueries({
        queryKey: financeKeys.summary(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.detail(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: activityKeys.lists(),
      });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Gagal memperbarui nilai kontrak");
    },
  });
}
