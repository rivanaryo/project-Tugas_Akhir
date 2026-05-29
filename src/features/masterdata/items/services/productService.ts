import axios from 'axios';
import { env } from '../../../../config/env';
import type { MasterdataListFilterParams } from '../../hooks/useMasterdataListFilters';
import type { Product, PaginatedProducts } from '../types/product.types';
import {
  createProductInputSchema,
  parseCreateProductResponse,
  parseProductsResponse,
  parseUpdateProductResponse,
  updateProductInputSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from '../schemas/product.schema';

const productsApiClient = axios.create({
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

export const productService = {
  fetchProducts: async (
    page: number,
    perPage = 15,
    filters: MasterdataListFilterParams = {}
  ): Promise<PaginatedProducts> => {
    const response = await productsApiClient.get('/master-data/products', {
      params: cleanParams({
        page,
        per_page: perPage,
        ...filters,
      }),
    });

    return parseProductsResponse(response.data);
  },

  createProduct: async (payload: CreateProductInput): Promise<{ message: string; product: Product }> => {
    const validatedPayload = createProductInputSchema.parse(payload);
    const response = await productsApiClient.post('/master-data/products', validatedPayload);

    return parseCreateProductResponse(response.data);
  },

  updateProduct: async (
    id: string | number,
    payload: UpdateProductInput
  ): Promise<{ message: string; product: Product }> => {
    const validatedPayload = updateProductInputSchema.parse(payload);
    const response = await productsApiClient.put(`/master-data/products/${id}`, validatedPayload);

    return parseUpdateProductResponse(response.data);
  },

  deleteProduct: async (id: string | number): Promise<{ message: string }> => {
    const response = await productsApiClient.delete(`/master-data/products/${id}`);
    const responseBody = response.data as { message?: string };

    return {
      message: responseBody?.message ?? 'Product deleted successfully',
    };
  },
};
