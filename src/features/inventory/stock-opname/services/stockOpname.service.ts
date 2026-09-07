import axios from 'axios';
import { env } from '../../../../config/env';
import type {
  PaginatedStockOpnames,
  StockOpname,
  StockOpnameFilterParams,
} from '../types/stockOpname.types';
import {
  createStockOpnameInputSchema,
  parseCreateStockOpnameResponse,
  parseStockOpnameResponse,
  parseStockOpnamesResponse,
  updateStockOpnameInputSchema,
  type CreateStockOpnameInput,
} from '../schemas/stockOpname.schemas';
import { z } from 'zod';

const stockOpnameApiClient = axios.create({
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
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    cleaned[key] = value;
  });
  return cleaned;
};

export const stockOpnameService = {
  fetchStockOpnames: async (
    page = 1,
    perPage = 15,
    filters: StockOpnameFilterParams = {}
  ): Promise<PaginatedStockOpnames> => {
    const params = cleanParams({
      page,
      per_page: perPage,
      q: filters.q,
      status: filters.status,
      warehouse_id: filters.warehouse_id,
      date_from: filters.date_from,
      date_to: filters.date_to,
    });

    try {
      const response = await stockOpnameApiClient.get('inventory/stock-opnames', { params });
      return parseStockOpnamesResponse(response.data, perPage);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return parseStockOpnamesResponse(error.response.data, perPage);
      }
      throw error;
    }
  },

  fetchStockOpname: async (id: string): Promise<StockOpname> => {
    try {
      const response = await stockOpnameApiClient.get(`inventory/stock-opnames/${id}`);
      return parseStockOpnameResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return parseStockOpnameResponse(error.response.data);
      }
      throw error;
    }
  },

  createStockOpname: async (payload: CreateStockOpnameInput): Promise<{ id: string }> => {
    const validated = createStockOpnameInputSchema.parse(payload);
    const response = await stockOpnameApiClient.post('inventory/stock-opnames', validated);
    return parseCreateStockOpnameResponse(response.data);
  },

  updateStockOpname: async (
    id: string,
    payload: z.infer<typeof updateStockOpnameInputSchema>
  ): Promise<StockOpname> => {
    const validated = updateStockOpnameInputSchema.parse(payload);
    const response = await stockOpnameApiClient.patch(`inventory/stock-opnames/${id}`, validated);
    return parseStockOpnameResponse(response.data);
  },

  deleteStockOpname: async (id: string): Promise<{ message: string }> => {
    const response = await stockOpnameApiClient.delete(`inventory/stock-opnames/${id}`);
    const responseBody = response.data as { message?: string };
    return { message: responseBody?.message ?? 'Stock Opname deleted successfully' };
  },
};
