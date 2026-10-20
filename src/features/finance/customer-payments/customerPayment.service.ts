import api from '../../../lib/api';
import type { CustomerPayment, CustomerPaymentPayload, FinanceAccountReference } from './customerPayment.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface PaginatedData<T> {
  data: T[];
}

const unwrapList = <T>(payload: T[] | PaginatedData<T>): T[] => Array.isArray(payload) ? payload : payload.data;

export const customerPaymentService = {
  list: async (): Promise<CustomerPayment[]> => {
    const response = await api.get<ApiResponse<CustomerPayment[] | PaginatedData<CustomerPayment>>>('/finance/customer-payments');
    return unwrapList(response.data.data);
  },

  create: async (payload: CustomerPaymentPayload): Promise<{ message: string; payment: CustomerPayment }> => {
    const response = await api.post<ApiResponse<CustomerPayment>>('/finance/customer-payments', payload);
    return { message: response.data.message ?? 'Pembayaran customer berhasil dibuat', payment: response.data.data };
  },

  remove: async (id: string): Promise<string> => {
    const response = await api.delete<{ message?: string }>(`/finance/customer-payments/${id}`);
    return response.data.message ?? 'Pembayaran customer berhasil dihapus';
  },

  accounts: async (): Promise<FinanceAccountReference[]> => {
    const response = await api.get<ApiResponse<FinanceAccountReference[] | PaginatedData<FinanceAccountReference>>>('/finance/accounts', { params: { per_page: 1000 } });
    return unwrapList(response.data.data);
  },
};
