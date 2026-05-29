import axios from 'axios';
import { env } from '../../../../config/env';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import type { Category, PaginatedCategories } from '../types/category.types';
import {
  createCategoryInputSchema,
  parseCreateCategoryResponse,
  parseCategoriesResponse,
  parseUpdateCategoryResponse,
  updateCategoryInputSchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '../schemas/category.schema';

const categoriesApiClient = axios.create({
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

export const categoryService = {
  fetchCategories: async (
    page: number,
    perPage = 15,
    filters: MasterdataListFilterParams = {}
  ): Promise<PaginatedCategories> => {
    const response = await categoriesApiClient.get('/master-data/categories', {
      params: cleanParams({
        page,
        per_page: perPage,
        ...filters,
      }),
    });

    return parseCategoriesResponse(response.data);
  },

  createCategory: async (payload: CreateCategoryInput): Promise<{ message: string; category: Category }> => {
    const validatedPayload = createCategoryInputSchema.parse(payload);
    const response = await categoriesApiClient.post('/master-data/categories', validatedPayload);

    return parseCreateCategoryResponse(response.data);
  },

  updateCategory: async (
    id: string | number,
    payload: UpdateCategoryInput
  ): Promise<{ message: string; category: Category }> => {
    const validatedPayload = updateCategoryInputSchema.parse(payload);
    const response = await categoriesApiClient.put(`/master-data/categories/${id}`, validatedPayload);

    return parseUpdateCategoryResponse(response.data);
  },

  deleteCategory: async (id: string | number): Promise<{ message: string }> => {
    const response = await categoriesApiClient.delete(`/master-data/categories/${id}`);
    const responseBody = response.data as { message?: string };

    return {
      message: responseBody?.message ?? 'Category deleted successfully',
    };
  },
};
