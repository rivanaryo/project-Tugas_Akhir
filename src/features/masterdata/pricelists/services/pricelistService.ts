import axios from 'axios';
import { env } from '../../../../config/env';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import type { PaginatedPricelists, Pricelist } from '../types/pricelist.types';
import {
  createPricelistInputSchema,
  parseCreatePricelistResponse,
  parsePricelistsResponse,
  type CreatePricelistInput,
} from '../schemas/pricelist.schema';

const pricelistsApiClient = axios.create({
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

export const pricelistService = {
  fetchPricelists: async (
    page: number,
    perPage = 15,
    filters: MasterdataListFilterParams = {}
  ): Promise<PaginatedPricelists> => {
    const response = await pricelistsApiClient.get('/master-data/pricelists', {
      params: cleanParams({
        page,
        per_page: perPage,
        with: 'product',
        ...filters,
      }),
    });

    return parsePricelistsResponse(response.data, perPage);
  },

  createPricelist: async (payload: CreatePricelistInput): Promise<{ message: string; pricelist: Pricelist }> => {
    const validatedPayload = createPricelistInputSchema.parse(payload);
    const response = await pricelistsApiClient.post('/master-data/pricelists', validatedPayload);

    return parseCreatePricelistResponse(response.data);
  },
};
