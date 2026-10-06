import api from '../../../../lib/api';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import type { Unit, PaginatedUnits } from '../types/unit.types';
import {
  createUnitInputSchema,
  parseCreateUnitResponse,
  parseUnitsResponse,
  parseUpdateUnitResponse,
  updateUnitInputSchema,
  type CreateUnitInput,
  type UpdateUnitInput,
} from '../schemas/unit.schema';

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

export const unitService = {
  fetchUnits: async (
    page: number,
    perPage = 15,
    filters: MasterdataListFilterParams = {}
  ): Promise<PaginatedUnits> => {
    const response = await api.get('/master-data/units', {
      params: cleanParams({
        page,
        per_page: perPage,
        ...filters,
      }),
    });

    return parseUnitsResponse(response.data);
  },

  createUnit: async (payload: CreateUnitInput): Promise<{ message: string; unit: Unit }> => {
    const validatedPayload = createUnitInputSchema.parse(payload);
    const response = await api.post('/master-data/units', validatedPayload);

    return parseCreateUnitResponse(response.data);
  },

  updateUnit: async (
    id: string | number,
    payload: UpdateUnitInput
  ): Promise<{ message: string; unit: Unit }> => {
    const validatedPayload = updateUnitInputSchema.parse(payload);
    const response = await api.put(`/master-data/units/${id}`, validatedPayload);

    return parseUpdateUnitResponse(response.data);
  },

  deleteUnit: async (id: string | number): Promise<{ message: string }> => {
    const response = await api.delete(`/master-data/units/${id}`);
    const responseBody = response.data as { message?: string };

    return {
      message: responseBody?.message ?? 'Unit deleted successfully',
    };
  },
};
