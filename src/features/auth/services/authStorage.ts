import type { AuthUser } from '../types/auth.types';

const USER_STORAGE_KEY = 'admin_user';
const TOKEN_STORAGE_KEY = 'erp_token';

const getSafeStorageValue = (key: string): string | null => {
  const value = localStorage.getItem(key);
  if (!value || value === 'undefined' || value === 'null') {
    localStorage.removeItem(key);
    return null;
  }
  return value;
};

export const authStorage = {
  setUser: (user: AuthUser) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },

  getUser: (): AuthUser | null => {
    const rawUser = getSafeStorageValue(USER_STORAGE_KEY);
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  },

  setToken: (token: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },

  getToken: () => getSafeStorageValue(TOKEN_STORAGE_KEY),

  clearUser: () => {
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  clear: () => {
    authStorage.clearUser();
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },
};
