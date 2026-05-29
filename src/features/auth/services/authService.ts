import axios from 'axios';
import type { AuthUser, LoginCredentials, LoginResponse } from '../types/auth.types';
import { loginSchema } from '../schemas/auth.schema';
import { env } from '../../../config/env';
import { authStorage } from './authStorage';

const API_BASE_URL = env.VITE_API_BASE_URL;
const LOGIN_ENDPOINT = '/admin/login';

const getUniqueEndpoints = (primary: string, fallbacks: string[]) => {
  return Array.from(new Set([primary, ...fallbacks]));
};

const AUTH_ME_ENDPOINTS = getUniqueEndpoints(env.VITE_AUTH_ME_ENDPOINT ?? '/admin/me', ['/auth/me']);
const AUTH_LOGOUT_ENDPOINTS = getUniqueEndpoints(env.VITE_AUTH_LOGOUT_ENDPOINT ?? '/admin/logout', ['/auth/logout']);

const is404Error = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 404;
};

const requestWith404Fallback = async <T>(requestFactory: (endpoint: string) => Promise<T>, endpoints: string[]) => {
  let lastError: unknown;

  for (const endpoint of endpoints) {
    try {
      return await requestFactory(endpoint);
    } catch (error) {
      lastError = error;
      if (!is404Error(error)) {
        throw error;
      }
    }
  }

  throw lastError;
};

type RawLoginPayload = Record<string, unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const extractUser = (payload: RawLoginPayload, fallbackEmail: string): AuthUser => {
  const directUser = payload.user;
  if (isRecord(directUser)) {
    return {
      email: typeof directUser.email === 'string' ? directUser.email : fallbackEmail,
      id: typeof directUser.id === 'string' ? directUser.id : undefined,
      name: typeof directUser.name === 'string' ? directUser.name : undefined,
      role: typeof directUser.role === 'string' ? directUser.role : undefined,
    };
  }

  const nestedData = payload.data;
  if (isRecord(nestedData) && isRecord(nestedData.user)) {
    const nestedUser = nestedData.user;
    return {
      email: typeof nestedUser.email === 'string' ? nestedUser.email : fallbackEmail,
      id: typeof nestedUser.id === 'string' ? nestedUser.id : undefined,
      name: typeof nestedUser.name === 'string' ? nestedUser.name : undefined,
      role: typeof nestedUser.role === 'string' ? nestedUser.role : undefined,
    };
  }

  return { email: fallbackEmail };
};

const getValidatedUser = (user: AuthUser): AuthUser | null => {
  const email = user.email.trim();

  if (!email) {
    return null;
  }

  return {
    ...user,
    email,
  };
};

export const authApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Enable cookie sharing for HTTP-only cookies
});

// Handle response errors
authApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = typeof error.config?.url === 'string' ? error.config.url : '';
    const isSessionCheckRequest = AUTH_ME_ENDPOINTS.includes(requestUrl);
    const isAuthMutationRequest = requestUrl === LOGIN_ENDPOINT || AUTH_LOGOUT_ENDPOINTS.includes(requestUrl);

    if (error.response?.status === 401 && !isSessionCheckRequest && !isAuthMutationRequest) {
      // Session expired for protected endpoint; clear local auth cache.
      authService.clearSession();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const parsedCredentials = loginSchema.parse(credentials);
    const response = await authApiClient.post(LOGIN_ENDPOINT, parsedCredentials);
    const payload = isRecord(response.data) ? response.data : {};

    // Token is now stored in HTTP-only cookie by backend
    // Extract user data from response
    const user = extractUser(payload, parsedCredentials.email);
    const message = typeof payload.message === 'string' ? payload.message : undefined;

    // Return empty token since it's handled by HTTP-only cookie
    return {
      token: '',
      user,
      message,
    };
  },

  saveSession: (user: AuthUser) => {
    const validatedUser = getValidatedUser(user);

    // Token is automatically handled by HTTP-only cookie
    // Persist only when user payload is valid.
    if (!validatedUser) {
      authStorage.clear();
      return;
    }

    authStorage.setUser(validatedUser);
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await requestWith404Fallback(
      (endpoint) => authApiClient.get(endpoint),
      AUTH_ME_ENDPOINTS
    );
    const payload = isRecord(response.data) ? response.data : {};
    const payloadUser = isRecord(payload.user) ? payload.user : null;

    const fallbackEmail =
      typeof payload.email === 'string'
        ? payload.email
        : payloadUser && typeof payloadUser.email === 'string'
          ? payloadUser.email
          : '';

    const extractedUser = extractUser(payload, fallbackEmail);
    const validatedUser = getValidatedUser(extractedUser);

    if (!validatedUser) {
      throw new Error('Invalid session user payload');
    }

    return validatedUser;
  },

  clearSession: () => {
    authStorage.clear();
  },

  logout: async () => {
    try {
      // Call backend logout endpoint to clear HTTP-only cookie
      await requestWith404Fallback(
        (endpoint) => authApiClient.post(endpoint),
        AUTH_LOGOUT_ENDPOINTS
      );
    } catch {
      // Continue with logout even if API call fails
    } finally {
      authService.clearSession();
    }
  },

  isAuthenticated: (): boolean => {
    const storedUser = authStorage.getUser();
    return !!storedUser?.email?.trim();
  },

  getStoredUser: () => {
    return authStorage.getUser();
  },
};
