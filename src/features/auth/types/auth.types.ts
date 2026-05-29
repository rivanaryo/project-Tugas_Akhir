import type { LoginSchemaInput } from '../schemas/auth.schema';

export interface LoginCredentials {
  email: LoginSchemaInput['email'];
  password: LoginSchemaInput['password'];
}

export interface AuthUser {
  email: string;
  id?: string;
  name?: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

export interface AuthContextType {
  status: AuthStatus;
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}
