import api from '../../../../lib/api';
import type {
  PaginatedSalesOrderItems,
  PaginatedSalesOrders,
  SalesOrderCreateResult,
  SalesOrderHead,
  SalesOrderFilterParams,
} from '../types/salesOrder.types';
import {
  createSalesOrderHeadInputSchema,
  createSalesOrderItemInputSchema,
  parseCreateSalesOrderHeadResponse,
  parseCreateSalesOrderItemResponse,
  parseSalesOrderItemsResponse,
  parseSalesOrderResponse,
  parseSalesOrdersResponse,
  type CreateSalesOrderHeadInput,
  type CreateSalesOrderItemInput,
  type UpdateSalesOrderHeadInput,
  updateSalesOrderHeadInputSchema,
} from '../schemas/salesOrder.schemas'

const cleanParams = (params: Record<string, unknown>) => {
  const cleaned: Record<string, unknown> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    cleaned[key] = value;
  });
  return cleaned;
};

export const salesOrderService = {
  fetchSalesOrders: async (
    page: number,
    perPage = 15,
    filters: SalesOrderFilterParams = {}
  ): Promise<PaginatedSalesOrders> => {
    const response = await api.get('/sales/sales-orders', {
      params: cleanParams({
        page,
        per_page: perPage,
        q: filters.q,
        status: filters.status,
        customer_id: filters.customer_id,
        order_date_from: filters.order_date_from,
        order_date_to: filters.order_date_to,
      }),
    });

    return parseSalesOrdersResponse(response.data, perPage);
  },

  fetchSalesOrder: async (id: string | number): Promise<SalesOrderHead> => {
    const response = await api.get(`/sales/sales-orders/${id}`);
    return parseSalesOrderResponse(response.data);
  },

  fetchSalesOrderItems: async (
    salesOrderId: string | number,
    page: number,
    perPage = 15
  ): Promise<PaginatedSalesOrderItems> => {
    const response = await api.get(`/sales/sales-orders/${salesOrderId}/items`, {
      params: {
        page,
        per_page: perPage,
        with: 'product',
      },
    });

    return parseSalesOrderItemsResponse(response.data, perPage);
  },

  createHead: async (payload: CreateSalesOrderHeadInput): Promise<SalesOrderCreateResult> => {
    const validated = createSalesOrderHeadInputSchema.parse(payload);
    const response = await api.post('/sales/sales-orders', validated);
    return parseCreateSalesOrderHeadResponse(response.data);
  },

  updateHead: async (id: string | number, payload: UpdateSalesOrderHeadInput): Promise<SalesOrderHead> => {
    const validated = updateSalesOrderHeadInputSchema.parse(payload);
    const response = await api.put(`/sales/sales-orders/${id}`, validated);
    return parseSalesOrderResponse(response.data);
  },

  deleteSalesOrder: async (id: string | number): Promise<{ message: string }> => {
    const response = await api.delete(`/sales/sales-orders/${id}`);
    const responseBody = response.data as { message?: string };
    return { message: responseBody?.message ?? 'Sales Order deleted successfully' };
  },

  createItem: async (
    salesOrderId: string | number,
    payload: CreateSalesOrderItemInput
  ): Promise<{ message: string }> => {
    const validated = createSalesOrderItemInputSchema.parse(payload);
    const requestBody: Record<string, unknown> = {
      ...validated,
    };

    if (!requestBody.pricelist_id) {
      delete requestBody.pricelist_id;
    }

    const response = await api.post(`/sales/sales-orders/${salesOrderId}/items`, requestBody);
    return parseCreateSalesOrderItemResponse(response.data);
  },

  exportSalesOrders: async (filters: SalesOrderFilterParams = {}): Promise<Blob> => {
    const response = await api.get('/sales/export', {
      params: cleanParams({
        q: filters.q,
        status: filters.status,
        customer_id: filters.customer_id,
        order_date_from: filters.order_date_from,
        order_date_to: filters.order_date_to,
      }),
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
