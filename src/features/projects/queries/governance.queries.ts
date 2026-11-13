import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { governanceApi } from "../api/governance.api";
import {
  AddRosterMemberInput,
  CreateRepoLinkInput,
  CreateStatusRequestInput,
  OwnerFinalDecisionInput,
  ProjectRepoType,
  SubmitVoteInput,
  UpdateRepoLinkInput,
} from "../types/governance.types";
import { PROJECT_KEYS } from "./projects.queries";

export const GOVERNANCE_KEYS = {
  roster: (projectId: string) => ["projects", projectId, "roster"] as const,
  statusRequests: (projectId: string) => ["projects", projectId, "status-requests"] as const,
  activeStatusRequest: (projectId: string) =>
    ["projects", projectId, "status-request", "active"] as const,
  repositories: (projectId: string) =>
    ["projects", projectId, "repositories"] as const,
  prdVersions: (projectId: string) =>
    ["projects", projectId, "prd-versions"] as const,
};

// ==========================================
// ROSTER HOOKS
// ==========================================
export function useProjectRosterQuery(projectId: string) {
  return useQuery({
    queryKey: GOVERNANCE_KEYS.roster(projectId),
    queryFn: async () => {
      const response = await governanceApi.getRoster(projectId);
      return response.data;
    },
    enabled: Boolean(projectId),
  });
}

export function useAddRosterMemberMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AddRosterMemberInput) => {
      const response = await governanceApi.addRosterMember(projectId, payload);
      return response.data;
    },
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: GOVERNANCE_KEYS.roster(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
      toast.success("Anggota Roster Ditambahkan", {
        description: `${member.user.name} berhasil ditambahkan ke tim voter status.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Gagal menambahkan roster", {
        description: error.message || "Terjadi kesalahan pada sistem.",
      });
    },
  });
}

export function useRemoveRosterMemberMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await governanceApi.removeRosterMember(projectId, userId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOVERNANCE_KEYS.roster(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
      toast.success("Anggota Roster Dihapus", {
        description: "Anggota telah dikeluarkan dari daftar voting status.",
      });
    },
    onError: (error: Error) => {
      toast.error("Gagal menghapus anggota", {
        description: error.message || "Terjadi kesalahan pada sistem.",
      });
    },
  });
}

// ==========================================
// STATUS REQUESTS & VOTING HOOKS
// ==========================================
export function useActiveStatusRequestQuery(projectId: string) {
  return useQuery({
    queryKey: GOVERNANCE_KEYS.activeStatusRequest(projectId),
    queryFn: async () => {
      const response = await governanceApi.getActiveStatusRequest(projectId);
      return response.data;
    },
    enabled: Boolean(projectId),
  });
}

export function useStatusRequestsQuery(projectId: string) {
  return useQuery({
    queryKey: GOVERNANCE_KEYS.statusRequests(projectId),
    queryFn: async () => {
      const response = await governanceApi.getStatusRequests(projectId);
      return response.data;
    },
    enabled: Boolean(projectId),
  });
}

export function useCreateStatusRequestMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateStatusRequestInput) => {
      const response = await governanceApi.createStatusRequest(projectId, payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: GOVERNANCE_KEYS.activeStatusRequest(projectId) });
      queryClient.invalidateQueries({ queryKey: GOVERNANCE_KEYS.statusRequests(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
      toast.success("Permohonan Perubahan Status Diajukan", {
        description: data.status === "approved"
          ? "Status proyek langsung disetujui melalui konsensus otomatis."
          : `Permohonan ke status "${data.targetStatus}" sedang menunggu voting roster.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Gagal mengajukan perubahan status", {
        description: error.message || "Terjadi kesalahan pada sistem.",
      });
    },
  });
}

export function useSubmitVoteMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reqId,
      payload,
    }: {
      reqId: string;
      payload: SubmitVoteInput;
    }) => {
      const response = await governanceApi.submitVote(projectId, reqId, payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: GOVERNANCE_KEYS.activeStatusRequest(projectId) });
      queryClient.invalidateQueries({ queryKey: GOVERNANCE_KEYS.statusRequests(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
      toast.success("Suara Voting Dicatat", {
        description: data.status === "approved"
          ? `100% Konsensus tercapai! Status proyek resmi berubah menjadi "${data.targetStatus}".`
          : "Pilihan suara Anda berhasil dicatat.",
      });
    },
    onError: (error: Error) => {
      toast.error("Gagal mencatat suara", {
        description: error.message || "Terjadi kesalahan pada sistem.",
      });
    },
  });
}

export function useOwnerFinalDecisionMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reqId,
      payload,
    }: {
      reqId: string;
      payload: OwnerFinalDecisionInput;
    }) => {
      const response = await governanceApi.ownerFinalDecision(projectId, reqId, payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: GOVERNANCE_KEYS.activeStatusRequest(projectId) });
      queryClient.invalidateQueries({ queryKey: GOVERNANCE_KEYS.statusRequests(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
      toast.success("Putusan Arbitrase Dieksekusi", {
        description: data.status === "approved"
          ? `Status proyek disetujui dan diperbarui menjadi "${data.targetStatus}".`
          : "Permohonan perubahan status telah resmi ditolak.",
      });
    },
    onError: (error: Error) => {
      toast.error("Gagal mengeksekusi arbitrase", {
        description: error.message || "Terjadi kesalahan pada sistem.",
      });
    },
  });
}

// ==========================================
// REPOSITORY LINKS HOOKS
// ==========================================
export function useRepositoriesQuery(projectId: string) {
  return useQuery({
    queryKey: GOVERNANCE_KEYS.repositories(projectId),
    queryFn: async () => {
      const response = await governanceApi.getRepositories(projectId);
      return response.data;
    },
    enabled: Boolean(projectId),
  });
}

export function useCreateRepositoryMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRepoLinkInput) => {
      const response = await governanceApi.createRepository(projectId, payload);
      return response.data;
    },
    onSuccess: (repo) => {
      queryClient.invalidateQueries({ queryKey: GOVERNANCE_KEYS.repositories(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
      toast.success("Tautan Repositori Ditambahkan", {
        description: `Tautan "${repo.label}" berhasil disimpan.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Gagal menambahkan repositori", {
        description: error.message || "Terjadi kesalahan pada sistem.",
      });
    },
  });
}

export function useUpdateRepositoryMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      repoId,
      payload,
    }: {
      repoId: string;
      payload: UpdateRepoLinkInput;
    }) => {
      const response = await governanceApi.updateRepository(projectId, repoId, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOVERNANCE_KEYS.repositories(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
      toast.success("Tautan Repositori Diperbarui");
    },
    onError: (error: Error) => {
      toast.error("Gagal memperbarui repositori", {
        description: error.message || "Terjadi kesalahan pada sistem.",
      });
    },
  });
}

export function useDeleteRepositoryMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (repoId: string) => {
      const response = await governanceApi.deleteRepository(projectId, repoId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOVERNANCE_KEYS.repositories(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
      toast.success("Tautan Repositori Dihapus");
    },
    onError: (error: Error) => {
      toast.error("Gagal menghapus repositori", {
        description: error.message || "Terjadi kesalahan pada sistem.",
      });
    },
  });
}

export function useUpdateRepoTypeMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (repoType: ProjectRepoType) => {
      const response = await governanceApi.updateRepoType(projectId, repoType);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: GOVERNANCE_KEYS.repositories(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
      toast.success(`Tipe Repositori Diubah ke ${data.repoType === "monorepo" ? "Monorepo" : "Repo Terpisah"}`);
    },
    onError: (error: Error) => {
      toast.error("Gagal mengubah tipe repositori", {
        description: error.message || "Terjadi kesalahan pada sistem.",
      });
    },
  });
}
