import api from '../../../../lib/api';
import type { PaginatedStockOpnames, StockOpname, StockOpnameFilterParams } from '../types/stockOpname.types';
import {
  createStockOpnameInputSchema, parseCreateStockOpnameResponse, parseStockOpnameResponse,
  parseStockOpnamesResponse, updateStockOpnameInputSchema,
  type CreateStockOpnameInput, type UpdateStockOpnameInput,
} from '../schemas/stockOpname.schemas';

export const stockOpnameService = {
  fetchStockOpnames: async (page = 1, perPage = 15, filters: StockOpnameFilterParams = {}): Promise<PaginatedStockOpnames> => {
    const response = await api.get('/inventory/stock-opnames', {
      params: { page, per_page: perPage, search: filters.q?.trim() || undefined, status: filters.status || undefined, warehouse_id: filters.warehouse_id || undefined },
    });
    return parseStockOpnamesResponse(response.data);
  },
  fetchStockOpname: async (id: string): Promise<StockOpname> => {
    const response = await api.get(`/inventory/stock-opnames/${id}`);
    return parseStockOpnameResponse(response.data);
  },
  createStockOpname: async (payload: CreateStockOpnameInput): Promise<{ id: string }> => {
    const response = await api.post('/inventory/stock-opnames', createStockOpnameInputSchema.parse(payload));
    return parseCreateStockOpnameResponse(response.data);
  },
  updateStockOpname: async (id: string, payload: UpdateStockOpnameInput): Promise<StockOpname> => {
    const response = await api.patch(`/inventory/stock-opnames/${id}`, updateStockOpnameInputSchema.parse(payload));
    return parseStockOpnameResponse(response.data);
  },
  deleteStockOpname: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/inventory/stock-opnames/${id}`);
    return { message: response.data.message ?? 'Stock Opname berhasil dihapus' };
  },
};
