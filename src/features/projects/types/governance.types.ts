export type ProjectRepoType = "monorepo" | "separate";
export type VoteChoice = "approve" | "reject";
export type RequestStatus = "pending" | "approved" | "rejected";

export interface ProjectRosterMember {
  id: string;
  projectId: string;
  userId: string;
  roleInProject?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];
    whatsapp?: string | null;
    instagram?: string | null;
    avatarUrl?: string | null;
    isActive: boolean;
  };
}

export interface ProjectStatusVote {
  id: string;
  requestId: string;
  userId: string;
  vote: VoteChoice;
  reason?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    roles: string[];
    avatarUrl?: string | null;
  };
}

export interface ProjectStatusRequest {
  id: string;
  projectId: string;
  targetStatus: string;
  reason: string;
  status: RequestStatus;
  requestedById: string;
  requestedBy: {
    id: string;
    name: string;
    email: string;
    roles: string[];
  };
  finalDecisionById?: string | null;
  finalDecisionBy?: {
    id: string;
    name: string;
    email: string;
    roles?: string[];
  } | null;
  finalDecision?: VoteChoice | null;
  finalReason?: string | null;
  finalDecisionAt?: string | null;
  createdAt: string;
  updatedAt: string;
  votes: ProjectStatusVote[];
}

export interface ProjectRepositoryLink {
  id: string;
  projectId: string;
  label: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepositoriesData {
  repoType: ProjectRepoType;
  repositories: ProjectRepositoryLink[];
}

export interface PrdVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  charCount: number;
  description?: string | null;
  createdAt: string;
  createdById?: string | null;
  createdBy?: {
    id: string;
    name: string;
    email: string;
    roles?: string[];
  } | null;
  content?: string;
  isNewVersion?: boolean;
}

export interface CreateStatusRequestInput {
  targetStatus: string;
  reason: string;
}

export interface SubmitVoteInput {
  vote: VoteChoice;
  reason?: string;
}

export interface OwnerFinalDecisionInput {
  decision: VoteChoice;
  reason?: string;
}

export interface CreateRepoLinkInput {
  label: string;
  url: string;
}

export interface UpdateRepoLinkInput {
  label?: string;
  url?: string;
}

export interface AddRosterMemberInput {
  userId: string;
  roleInProject?: string;
}

export interface SavePrdVersionInput {
  content: string;
  description?: string;
}
