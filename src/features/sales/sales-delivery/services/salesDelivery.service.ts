import axios from 'axios';
import { env } from '../../../../config/env';
import type {
  PaginatedSalesDeliveryItems,
  PaginatedSalesDeliveries,
  SalesDeliveryCreateResult,
  SalesDeliveryHead,
  SalesDeliveryFilterParams,
} from '../types/salesDelivery.types';
import {
  createSalesDeliveryHeadInputSchema,
  createSalesDeliveryItemInputSchema,
  parseCreateSalesDeliveryHeadResponse,
  parseCreateSalesDeliveryItemResponse,
  parseSalesDeliveryItemsResponse,
  parseSalesDeliveryResponse,
  parseSalesDeliveriesResponse,
  updateSalesDeliveryHeadInputSchema,
  type CreateSalesDeliveryHeadInput,
} from '../schemas/salesDelivery.schemas'
import type { CreateSalesDeliveryItemInput } from '../schemas/salesDelivery.schemas';
import { z } from 'zod';

const salesApiClient = axios.create({
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

export const salesDeliveryService = {
  fetchSalesDeliveries: async (
    perPage = 15,
    filters: SalesDeliveryFilterParams = {}
  ): Promise<PaginatedSalesDeliveries> => {
    const params = cleanParams({
      per_page: perPage,
      q: filters.q,
      status: filters.status,
      customer_id: filters.customer_id,
      product_id: filters.product_id,
      delivery_date_from: filters.delivery_date_from,
      delivery_date_to: filters.delivery_date_to,
    });

    try {
      const response = await salesApiClient.get('/sales/sales-deliveries', { params });
      return parseSalesDeliveriesResponse(response.data, perPage);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return parseSalesDeliveriesResponse(error.response.data, perPage);
      }
      throw error;
    }
  },

  fetchSalesDelivery: async (id: string | number): Promise<SalesDeliveryHead> => {
    const params = {
      with: 'customer,sales_order,items.product,items.sales_order_item.product',
    };

    try {
      const response = await salesApiClient.get(`/sales/sales-deliveries/${id}`, { params });
      return parseSalesDeliveryResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return parseSalesDeliveryResponse(error.response.data);
      }
      throw error;
    }
  },

  fetchSalesDeliveryItems: async (
    salesDeliveryId: string | number,
    page: number,
    perPage = 15
  ): Promise<PaginatedSalesDeliveryItems> => {
    const params = {
      page,
      per_page: perPage,
      with: 'product,sales_order_item,sales_order_item.product',
    };

    try {
      const response = await salesApiClient.get(`/sales/sales-deliveries/${salesDeliveryId}/items`, { params });
      return parseSalesDeliveryItemsResponse(response.data, perPage);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return parseSalesDeliveryItemsResponse(error.response.data, perPage);
      }
      throw error;
    }
  },

  createHead: async (payload: CreateSalesDeliveryHeadInput): Promise<SalesDeliveryCreateResult> => {
    const validated = createSalesDeliveryHeadInputSchema.parse(payload);
    const response = await salesApiClient.post('/sales/sales-deliveries', validated);
    return parseCreateSalesDeliveryHeadResponse(response.data);
  },

  updateHead: async (id: string | number, payload: z.infer<typeof updateSalesDeliveryHeadInputSchema>):  Promise<SalesDeliveryHead> => {
    const validated = updateSalesDeliveryHeadInputSchema.parse(payload);
    const response = await salesApiClient.put(`/sales/sales-deliveries/${id}`, validated);
    return parseSalesDeliveryResponse(response.data);
  },

  deleteSalesDelivery: async (id: string | number): Promise<{ message: string }> => {
    const response = await salesApiClient.delete(`/sales/sales-deliveries/${id}`);
    const responseBody = response.data as { message?: string };
    return { message: responseBody?.message ?? 'Sales Delivery deleted successfully' };
  },

  createItem: async (
    salesDeliveryId: string | number,
    payload: CreateSalesDeliveryItemInput
  ): Promise<{ message: string }> => {
    const validated = createSalesDeliveryItemInputSchema.parse(payload);
    const requestBody: Record<string, unknown> = {
      ...validated,
      sales_delivery_id: salesDeliveryId, // Inject explicitly as required by backend
    };

    if (!requestBody.pricelist_id) {
      delete requestBody.pricelist_id;
    }

    const response = await salesApiClient.post(`/sales/sales-deliveries/${salesDeliveryId}/items`, requestBody);
    return parseCreateSalesDeliveryItemResponse(response.data);
  },
};
