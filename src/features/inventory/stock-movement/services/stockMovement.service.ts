import axios from 'axios';
import api from '../../../../lib/api';
import type {
  PaginatedStockMovements,
  StockMovement,
  StockMovementCreateResult,
  StockMovementFilterParams,
} from '../types/stockMovement.types';
import {
  createStockMovementInputSchema,
  parseCreateStockMovementResponse,
  parseStockMovementResponse,
  parseStockMovementsResponse,
  updateStockMovementInputSchema,
  type CreateStockMovementInput,
} from '../schemas/stockMovement.schemas';
import { z } from 'zod';

const cleanParams = (params: Record<string, unknown>) => {
  const cleaned: Record<string, unknown> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    cleaned[key] = value;
  });
  return cleaned;
};

export const stockMovementService = {
  fetchStockMovements: async (
    page = 1,
    perPage = 15,
    filters: StockMovementFilterParams = {}
  ): Promise<PaginatedStockMovements> => {
    const params = cleanParams({
      page,
      per_page: perPage,
      q: filters.q,
      type: filters.type,
      product_id: filters.product_id,
      warehouse_id: filters.warehouse_id,
      date_from: filters.date_from,
      date_to: filters.date_to,
    });

    try {
      const response = await api.get('inventory/stock-movements', { params });
      return parseStockMovementsResponse(response.data, perPage);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return parseStockMovementsResponse(error.response.data, perPage);
      }
      throw error;
    }
  },

  fetchStockMovement: async (id: string): Promise<StockMovement> => {
    const params = {
      with: 'product,warehouse',
    };

    try {
      const response = await api.get(`inventory/stock-movements/${id}`, { params });
      return parseStockMovementResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return parseStockMovementResponse(error.response.data);
      }
      throw error;
    }
  },

  createStockMovement: async (payload: CreateStockMovementInput): Promise<StockMovementCreateResult> => {
    const validated = createStockMovementInputSchema.parse(payload);
    const response = await api.post('inventory/stock-movements', validated);
    return parseCreateStockMovementResponse(response.data);
  },

  updateStockMovement: async (
    id: string,
    payload: z.infer<typeof updateStockMovementInputSchema>
  ): Promise<StockMovement> => {
    const validated = updateStockMovementInputSchema.parse(payload);
    const response = await api.put(`inventory/stock-movements/${id}`, validated);
    return parseStockMovementResponse(response.data);
  },

  deleteStockMovement: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`inventory/stock-movements/${id}`);
    const responseBody = response.data as { message?: string };
    return { message: responseBody?.message ?? 'Stock Movement deleted successfully' };
  },
};
