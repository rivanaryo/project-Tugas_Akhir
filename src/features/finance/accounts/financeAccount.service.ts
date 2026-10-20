import api from '../../../lib/api';
import type { AdjustmentPayload, FinanceAccount, FinanceSummary, FinanceTransaction, TransferPayload } from './financeAccount.types';

interface ApiResponse<T> { success: boolean; message?: string; data: T }
interface PaginatedData<T> { data: T[]; current_page?: number; last_page?: number; total?: number }

const unwrapList = <T>(payload: T[] | PaginatedData<T>) => Array.isArray(payload) ? payload : payload.data;

export const financeAccountService = {
  accounts: async (): Promise<FinanceAccount[]> => {
    const response = await api.get<ApiResponse<FinanceAccount[] | PaginatedData<FinanceAccount>>>('/finance/accounts', { params: { per_page: 1000 } });
    return unwrapList(response.data.data);
  },

  summary: async (params: { account_id?: string; date_from?: string; date_to?: string }): Promise<FinanceSummary> => {
    const response = await api.get<ApiResponse<FinanceSummary>>('/finance/accounts/summary', { params });
    return response.data.data;
  },

  transactions: async (accountId: string, params: { direction?: string; status?: string; date_from?: string; date_to?: string; q?: string }): Promise<FinanceTransaction[]> => {
    const response = await api.get<ApiResponse<FinanceTransaction[] | PaginatedData<FinanceTransaction>>>(`/finance/accounts/${accountId}/transactions`, { params: { ...params, per_page: 100 } });
    return unwrapList(response.data.data);
  },

  adjust: async (payload: AdjustmentPayload): Promise<string> => {
    const response = await api.post<ApiResponse<unknown>>('/finance/account-adjustments', payload);
    return response.data.message ?? 'Adjustment akun berhasil dibuat';
  },

  transfer: async (payload: TransferPayload): Promise<string> => {
    const response = await api.post<ApiResponse<unknown>>('/finance/account-transfers', payload);
    return response.data.message ?? 'Transfer antar akun berhasil';
  },

  voidTransaction: async (transactionId: string, reason: string): Promise<string> => {
    const response = await api.post<ApiResponse<unknown>>(`/finance/transactions/${transactionId}/void`, { reason });
    return response.data.message ?? 'Transaksi berhasil di-void';
  },
};
