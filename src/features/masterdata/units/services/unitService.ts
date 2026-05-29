import axios from 'axios';
import { env } from '../../../../config/env';
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

const unitsApiClient = axios.create({
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

export const unitService = {
  fetchUnits: async (
    page: number,
    perPage = 15,
    filters: MasterdataListFilterParams = {}
  ): Promise<PaginatedUnits> => {
    const response = await unitsApiClient.get('/master-data/units', {
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
    const response = await unitsApiClient.post('/master-data/units', validatedPayload);

    return parseCreateUnitResponse(response.data);
  },

  updateUnit: async (
    id: string | number,
    payload: UpdateUnitInput
  ): Promise<{ message: string; unit: Unit }> => {
    const validatedPayload = updateUnitInputSchema.parse(payload);
    const response = await unitsApiClient.put(`/master-data/units/${id}`, validatedPayload);

    return parseUpdateUnitResponse(response.data);
  },

  deleteUnit: async (id: string | number): Promise<{ message: string }> => {
    const response = await unitsApiClient.delete(`/master-data/units/${id}`);
    const responseBody = response.data as { message?: string };

    return {
      message: responseBody?.message ?? 'Unit deleted successfully',
    };
  },
};
