import axios from 'axios';
import { env } from '../../../../config/env';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import type { PaginatedAccounts, Account } from '../types/account.types';
import {
  createAccountInputSchema,
  parseCreateAccountResponse,
  parseUpdateAccountResponse,
  parseAccountsResponse,
  updateAccountInputSchema,
  type CreateAccountInput,
  type UpdateAccountInput,
} from '../schemas/account.schema';

const accountsApiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

const cleanParams = (params: Record<string, unknown>) => {
  const cleaned: Record<string, unknown> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return;
    }

    cleaned[key] = value;
  });

  return cleaned;
};

export const accountService = {
  fetchAccounts: async (
    page: number,
    perPage = 15,
    filters: MasterdataListFilterParams = {}
  ): Promise<PaginatedAccounts> => {
    const response = await accountsApiClient.get('/master-data/accounts', {
      params: cleanParams({
        page,
        per_page: perPage,
        ...filters,
      }),
    });

    return parseAccountsResponse(response.data);
  },

  createAccount: async (payload: CreateAccountInput): Promise<{ message: string; account: Account }> => {
    const validatedPayload = createAccountInputSchema.parse(payload);
    const response = await accountsApiClient.post('/master-data/accounts', validatedPayload);

    return parseCreateAccountResponse(response.data);
  },

  updateAccount: async (
    id: string | number,
    payload: UpdateAccountInput
  ): Promise<{ message: string; account: Account }> => {
    const validatedPayload = updateAccountInputSchema.parse(payload);
    const response = await accountsApiClient.put(`/master-data/accounts/${id}`, validatedPayload);

    return parseUpdateAccountResponse(response.data);
  },

  deleteAccount: async (id: string | number): Promise<{ message: string }> => {
    const response = await accountsApiClient.delete(`/master-data/accounts/${id}`);
    const responseBody = response.data as { message?: string };

    return {
      message: responseBody?.message ?? 'Account deleted successfully',
    };
  },
};
