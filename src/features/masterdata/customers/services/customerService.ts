import axios from 'axios';
import { env } from '../../../../config/env';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import type { PaginatedCustomers, Customer } from '../types/customer.types';
import {
  createCustomerInputSchema,
  parseCreateCustomerResponse,
  parseUpdateCustomerResponse,
  parseCustomersResponse,
  updateCustomerInputSchema,
  type CreateCustomerInput,
  type UpdateCustomerInput,
} from '../schemas/customer.schema';

const customersApiClient = axios.create({
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

export const customerService = {
  fetchCustomers: async (
    page: number,
    perPage = 15,
    filters: MasterdataListFilterParams = {}
  ): Promise<PaginatedCustomers> => {
    const response = await customersApiClient.get('/master-data/customers', {
      params: cleanParams({
        page,
        per_page: perPage,
        ...filters,
      }),
    });

    return parseCustomersResponse(response.data);
  },

  createCustomer: async (payload: CreateCustomerInput): Promise<{ message: string; customer: Customer }> => {
    const validatedPayload = createCustomerInputSchema.parse(payload);
    const response = await customersApiClient.post('/master-data/customers', validatedPayload);

    return parseCreateCustomerResponse(response.data);
  },

  updateCustomer: async (
    id: string | number,
    payload: UpdateCustomerInput
  ): Promise<{ message: string; customer: Customer }> => {
    const validatedPayload = updateCustomerInputSchema.parse(payload);
    const response = await customersApiClient.put(`/master-data/customers/${id}`, validatedPayload);

    return parseUpdateCustomerResponse(response.data);
  },

  deleteCustomer: async (id: string | number): Promise<{ message: string }> => {
    const response = await customersApiClient.delete(`/master-data/customers/${id}`);
    const responseBody = response.data as { message?: string };

    return {
      message: responseBody?.message ?? 'Customer deleted successfully',
    };
  },

  exportCustomers: async (filters: MasterdataListFilterParams = {}): Promise<Blob> => {
    const response = await customersApiClient.get('/master-data/export', {
      params: cleanParams({
        type: 'customers',
        q: filters.q,
      }),
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
