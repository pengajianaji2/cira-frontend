import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  ProjectRepoType,
  ProjectRepositoryLink,
  ProjectRosterMember,
  ProjectStatusRequest,
} from "./governance.types";

export type ProjectStatus = "lead" | "active" | "completed" | "cancelled";

export interface ProjectListingResponse {
  items: Project[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  counts: Partial<Record<ProjectStatus, number>>;
}

export interface ProjectOwner {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientContact: string;
  status: ProjectStatus;
  ownerId?: string | null;
  owner?: ProjectOwner | null;
  repoType?: ProjectRepoType;
  progress?: number;
  contractValue?: number;
  createdAt: string;
  updatedAt: string;
  roster?: ProjectRosterMember[];
  repositoryLinks?: ProjectRepositoryLink[];
  statusRequests?: ProjectStatusRequest[];
  _count?: {
    tasks?: number;
    payments?: number;
    roster?: number;
    repositoryLinks?: number;
    prdVersions?: number;
    sprints?: number;
    paymentTerms?: number;
    assets?: number;
    statusRequests?: number;
    operationalEvents?: number;
    storedFiles?: number;
  };
}

export const createProjectSchema = z.object({
  name: z.string().min(3, "Nama proyek minimal 3 karakter"),
  clientName: z.string().min(2, "Nama klien minimal 2 karakter"),
  clientContact: z.string().refine((value) => Boolean(parsePhoneNumberFromString(value, value.startsWith("+") ? undefined : "ID")?.isValid()), "Masukkan nomor telepon yang valid untuk negara terpilih.").transform((value) => parsePhoneNumberFromString(value, value.startsWith("+") ? undefined : "ID")!.number),
  contractValue: z.number().min(0, "Nilai kontrak tidak boleh negatif").optional(),
  repoType: z.enum(["monorepo", "separate"]).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export interface UpdateProjectInput {
  name?: string;
  clientName?: string;
  clientContact?: string;
  progress?: number;
  repoType?: ProjectRepoType;
}

export interface ProjectDeletionResult {
  state: string;
  remaining: number;
  counts: Record<string, number> | null;
}

export interface PrdVersionDocument {
  id: string;
  versionNumber: number;
  description?: string | null;
  createdAt: string;
  fileName: string;
  sizeBytes: number;
  url: string;
}
