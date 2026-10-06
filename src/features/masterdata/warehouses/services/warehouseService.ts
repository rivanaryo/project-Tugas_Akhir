import api from '../../../../lib/api';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import type { Warehouse, PaginatedWarehouses } from '../types/warehouse.types';
import {
  createWarehouseInputSchema,
  parseCreateWarehouseResponse,
  parseWarehousesResponse,
  parseUpdateWarehouseResponse,
  updateWarehouseInputSchema,
  type CreateWarehouseInput,
  type UpdateWarehouseInput,
} from '../schemas/warehouse.schema';

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

export const warehouseService = {
  fetchWarehouses: async (
    page: number,
    perPage = 15,
    filters: MasterdataListFilterParams = {}
  ): Promise<PaginatedWarehouses> => {
    const response = await api.get('/master-data/warehouses', {
      params: cleanParams({
        page,
        per_page: perPage,
        ...filters,
      }),
    });

    return parseWarehousesResponse(response.data);
  },

  createWarehouse: async (payload: CreateWarehouseInput): Promise<{ message: string; warehouse: Warehouse }> => {
    const validatedPayload = createWarehouseInputSchema.parse(payload);
    const response = await api.post('/master-data/warehouses', validatedPayload);

    const result = parseCreateWarehouseResponse(response.data);
    return {
      message: result.message,
      warehouse: result.warehouse as Warehouse,
    };
  },

  updateWarehouse: async (
    id: string | number,
    payload: UpdateWarehouseInput
  ): Promise<{ message: string; warehouse: Warehouse }> => {
    const validatedPayload = updateWarehouseInputSchema.parse(payload);
    const response = await api.put(`/master-data/warehouses/${id}`, validatedPayload);

    const result = parseUpdateWarehouseResponse(response.data);
    return {
      message: result.message,
      warehouse: result.warehouse as Warehouse,
    };
  },

  deleteWarehouse: async (id: string | number): Promise<{ message: string }> => {
    const response = await api.delete(`/master-data/warehouses/${id}`);
    const responseBody = response.data as { message?: string };

    return {
      message: responseBody?.message ?? 'Warehouse deleted successfully',
    };
  },
};
