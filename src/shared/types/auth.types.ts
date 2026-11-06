export type UserRole = "owner" | "ops" | "dev" | "designer";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
