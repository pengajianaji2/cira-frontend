export type UserRole =
  | "owner"
  | "developer"
  | "operasional"
  | "ops"
  | "dev"
  | "designer";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  whatsapp?: string | null;
  instagram?: string | null;
  isActive?: boolean;
  isPrimaryOwner?: boolean;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
