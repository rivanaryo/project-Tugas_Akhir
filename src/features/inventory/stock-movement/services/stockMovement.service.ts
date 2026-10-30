import api from '../../../../lib/api';
import type { PaginatedStockMovements, StockMovement, StockMovementCreateResult } from '../types/stockMovement.types';
import {
  createStockMovementInputSchema, parseCreateStockMovementResponse, parseStockMovementResponse,
  parseStockMovementsResponse, updateStockMovementInputSchema,
  type CreateStockMovementInput, type UpdateStockMovementInput,
} from '../schemas/stockMovement.schemas';

export const stockMovementService = {
  fetchStockMovements: async (page = 1): Promise<PaginatedStockMovements> => {
    const response = await api.get('/inventory/stock-movements', { params: { page } });
    return parseStockMovementsResponse(response.data);
  },
  fetchStockMovement: async (id: string): Promise<StockMovement> => {
    const response = await api.get(`/inventory/stock-movements/${id}`);
    return parseStockMovementResponse(response.data);
  },
  createStockMovement: async (payload: CreateStockMovementInput): Promise<StockMovementCreateResult> => {
    const validated = createStockMovementInputSchema.parse(payload);
    const response = await api.post('/inventory/stock-movements', {
      ...validated, referenceable_type: 'App\\Modules\\Inventory\\StockOpname\\Models\\StockOpname',
    });
    return parseCreateStockMovementResponse(response.data);
  },
  updateStockMovement: async (id: string, payload: UpdateStockMovementInput): Promise<StockMovement> => {
    const response = await api.patch(`/inventory/stock-movements/${id}`, updateStockMovementInputSchema.parse(payload));
    return parseStockMovementResponse(response.data);
  },
  deleteStockMovement: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/inventory/stock-movements/${id}`);
    return { message: response.data.message ?? 'Stock Movement berhasil dihapus' };
  },
};
