export interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  instagram: string | null;
  roles: string[];
  isActive: boolean;
  isPrimaryOwner: boolean;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface InviteUserInput {
  email: string;
  role: "developer" | "operasional";
}

export interface InviteUserResponse {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface UpdateRoleInput {
  userId: string;
  roles: string[];
}

export interface UpdateStatusInput {
  userId: string;
  isActive: boolean;
}
