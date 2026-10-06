import api from '../../../../lib/api';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import type { PaginatedPricelists, Pricelist } from '../types/pricelist.types';
import {
  createPricelistInputSchema,
  parseCreatePricelistResponse,
  parsePricelistsResponse,
  type CreatePricelistInput,
} from '../schemas/pricelist.schema';

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
    const response = await api.get('/master-data/pricelists', {
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
    const response = await api.post('/master-data/pricelists', validatedPayload);

    return parseCreatePricelistResponse(response.data);
  },
};
