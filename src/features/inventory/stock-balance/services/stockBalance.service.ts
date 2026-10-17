import axios from 'axios';
import api from '../../../../lib/api';
import type {
  PaginatedStockBalance,
  StockBalanceFilterParams,
} from '../types/stockBalance.types';
import { parseStockBalanceResponse } from '../schemas/stockBalance.schemas';

const cleanParams = (params: Record<string, unknown>) => {
  const cleaned: Record<string, unknown> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    cleaned[key] = value;
  });
  return cleaned;
};

export const stockBalanceService = {
  fetchStockBalance: async (
    page = 1,
    perPage = 15,
    filters: StockBalanceFilterParams = {}
  ): Promise<PaginatedStockBalance> => {
    const params = cleanParams({
      page,
      per_page: perPage,
      q: filters.q,
      warehouse_id: filters.warehouse_id,
      product_id: filters.product_id,
      sort_by: filters.sort_by,
      sort_dir: filters.sort_dir,
    });

    try {
      const response = await api.get('inventory/stock-balance', { params });
      return parseStockBalanceResponse(response.data, perPage);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return parseStockBalanceResponse(error.response.data, perPage);
      }
      throw error;
    }
  },
};
