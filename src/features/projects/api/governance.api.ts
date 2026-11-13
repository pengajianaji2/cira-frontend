import { apiClient } from "@/shared/lib/api-client";
import { ApiResponse } from "@/shared/types/api.types";
import {
  AddRosterMemberInput,
  CreateRepoLinkInput,
  CreateStatusRequestInput,
  OwnerFinalDecisionInput,
  ProjectRepoType,
  ProjectRepositoryLink,
  ProjectRosterMember,
  ProjectStatusRequest,
  RepositoriesData,
  SubmitVoteInput,
  UpdateRepoLinkInput,
} from "../types/governance.types";

/**
 * Client API tata kelola proyek (`/api/v1/projects/:projectId/*`):
 * manajemen roster voting, pengajuan/vote/arbitrase status, tautan repositori, dan riwayat PDF PRD.
 */
export const governanceApi = {
  // ==========================================
  // ROSTER API
  // ==========================================
  async getRoster(projectId: string): Promise<ApiResponse<ProjectRosterMember[]>> {
    const response = await apiClient.get<ApiResponse<ProjectRosterMember[]>>(
      `/projects/${projectId}/roster`
    );
    return response.data;
  },

  async addRosterMember(
    projectId: string,
    input: AddRosterMemberInput
  ): Promise<ApiResponse<ProjectRosterMember>> {
    const response = await apiClient.post<ApiResponse<ProjectRosterMember>>(
      `/projects/${projectId}/roster`,
      input
    );
    return response.data;
  },

  async removeRosterMember(
    projectId: string,
    userId: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/projects/${projectId}/roster/${userId}`
    );
    return response.data;
  },

  // ==========================================
  // STATUS REQUESTS & VOTING API
  // ==========================================
  async getStatusRequests(
    projectId: string
  ): Promise<ApiResponse<ProjectStatusRequest[]>> {
    const response = await apiClient.get<ApiResponse<ProjectStatusRequest[]>>(
      `/projects/${projectId}/status-requests`
    );
    return response.data;
  },

  async getActiveStatusRequest(
    projectId: string
  ): Promise<ApiResponse<ProjectStatusRequest | null>> {
    const response = await apiClient.get<ApiResponse<ProjectStatusRequest | null>>(
      `/projects/${projectId}/status-request/active`
    );
    return response.data;
  },

  async createStatusRequest(
    projectId: string,
    input: CreateStatusRequestInput
  ): Promise<ApiResponse<ProjectStatusRequest>> {
    const response = await apiClient.post<ApiResponse<ProjectStatusRequest>>(
      `/projects/${projectId}/status-request`,
      input
    );
    return response.data;
  },

  async submitVote(
    projectId: string,
    reqId: string,
    input: SubmitVoteInput
  ): Promise<ApiResponse<ProjectStatusRequest>> {
    const response = await apiClient.post<ApiResponse<ProjectStatusRequest>>(
      `/projects/${projectId}/status-request/${reqId}/vote`,
      input
    );
    return response.data;
  },

  async ownerFinalDecision(
    projectId: string,
    reqId: string,
    input: OwnerFinalDecisionInput
  ): Promise<ApiResponse<ProjectStatusRequest>> {
    const response = await apiClient.post<ApiResponse<ProjectStatusRequest>>(
      `/projects/${projectId}/status-request/${reqId}/final-decision`,
      input
    );
    return response.data;
  },

  // ==========================================
  // REPOSITORY LINKS API
  // ==========================================
  async getRepositories(projectId: string): Promise<ApiResponse<RepositoriesData>> {
    const response = await apiClient.get<ApiResponse<RepositoriesData>>(
      `/projects/${projectId}/repositories`
    );
    return response.data;
  },

  async createRepository(
    projectId: string,
    input: CreateRepoLinkInput
  ): Promise<ApiResponse<ProjectRepositoryLink>> {
    const response = await apiClient.post<ApiResponse<ProjectRepositoryLink>>(
      `/projects/${projectId}/repositories`,
      input
    );
    return response.data;
  },

  async updateRepository(
    projectId: string,
    repoId: string,
    input: UpdateRepoLinkInput
  ): Promise<ApiResponse<ProjectRepositoryLink>> {
    const response = await apiClient.patch<ApiResponse<ProjectRepositoryLink>>(
      `/projects/${projectId}/repositories/${repoId}`,
      input
    );
    return response.data;
  },

  async deleteRepository(
    projectId: string,
    repoId: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/projects/${projectId}/repositories/${repoId}`
    );
    return response.data;
  },

  async updateRepoType(
    projectId: string,
    repoType: ProjectRepoType
  ): Promise<ApiResponse<{ repoType: ProjectRepoType }>> {
    const response = await apiClient.patch<ApiResponse<{ repoType: ProjectRepoType }>>(
      `/projects/${projectId}/repo-type`,
      { repoType }
    );
    return response.data;
  },

};
