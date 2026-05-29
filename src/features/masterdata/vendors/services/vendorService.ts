import axios from 'axios';
import { env } from '../../../../config/env';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import type { PaginatedVendors, Vendor } from '../types/vendor.types';
import {
  createVendorInputSchema,
  parseCreateVendorResponse,
  parseUpdateVendorResponse,
  parseVendorsResponse,
  updateVendorInputSchema,
  type CreateVendorInput,
  type UpdateVendorInput,
} from '../schemas/vendor.schema';

const vendorsApiClient = axios.create({
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

export const vendorService = {
  fetchVendors: async (
    page: number,
    perPage = 15,
    filters: MasterdataListFilterParams = {}
  ): Promise<PaginatedVendors> => {
    const response = await vendorsApiClient.get('/master-data/vendors', {
      params: cleanParams({
        page,
        per_page: perPage,
        ...filters,
      }),
    });

    return parseVendorsResponse(response.data);
  },

  createVendor: async (payload: CreateVendorInput): Promise<{ message: string; vendor: Vendor }> => {
    const validatedPayload = createVendorInputSchema.parse(payload);
    const response = await vendorsApiClient.post('/master-data/vendors', validatedPayload);

    return parseCreateVendorResponse(response.data);
  },

  updateVendor: async (
    id: string | number,
    payload: UpdateVendorInput
  ): Promise<{ message: string; vendor: Vendor }> => {
    const validatedPayload = updateVendorInputSchema.parse(payload);
    const response = await vendorsApiClient.put(`/master-data/vendors/${id}`, validatedPayload);

    return parseUpdateVendorResponse(response.data);
  },

  deleteVendor: async (id: string | number): Promise<{ message: string }> => {
    const response = await vendorsApiClient.delete(`/master-data/vendors/${id}`);
    const responseBody = response.data as { message?: string };

    return {
      message: responseBody?.message ?? 'Vendor deleted successfully',
    };
  },
};
