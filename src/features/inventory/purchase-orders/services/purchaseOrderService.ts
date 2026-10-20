import api from '../../../../lib/api';
import type {
  PaginatedPurchaseOrderItems,
  PaginatedPurchaseOrders,
  PurchaseOrderCreateResult,
  PurchaseOrderHead,
  PurchaseOrderFilterParams,
} from '../types/purchaseOrder.types';
import {
  createPurchaseOrderHeadInputSchema,
  createPurchaseOrderItemInputSchema,
  parseCreatePurchaseOrderHeadResponse,
  parseCreatePurchaseOrderItemResponse,
  parsePurchaseOrderItemsResponse,
  parsePurchaseOrderResponse,
  parsePurchaseOrdersResponse,
  type CreatePurchaseOrderHeadInput,
  type CreatePurchaseOrderItemInput,
  type UpdatePurchaseOrderHeadInput,
  updatePurchaseOrderHeadInputSchema,
} from '../schemas/purchaseOrder.schema';

const cleanParams = (params: Record<string, unknown>) => {
  const cleaned: Record<string, unknown> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    cleaned[key] = value;
  });
  return cleaned;
};

export const purchaseOrderService = {
  fetchPurchaseOrders: async (
    page: number,
    perPage = 15,
    filters: PurchaseOrderFilterParams = {}
  ): Promise<PaginatedPurchaseOrders> => {
    const response = await api.get('production/purchase-orders', {
      params: cleanParams({
        page,
        per_page: perPage,
        q: filters.q,
        status: filters.status,
        vendor_id: filters.vendor_id,
        po_date_from: filters.po_date_from,
        po_date_to: filters.po_date_to,
      }),
    });

    return parsePurchaseOrdersResponse(response.data, perPage);
  },

  fetchPurchaseOrder: async (id: string | number): Promise<PurchaseOrderHead> => {
    const response = await api.get(`production/purchase-orders/${id}`);
    return parsePurchaseOrderResponse(response.data);
  },

  fetchPurchaseOrderItems: async (
    purchaseOrderId: string | number,
    page: number,
    perPage = 15
  ): Promise<PaginatedPurchaseOrderItems> => {
    const response = await api.get('production/purchase-order-items', {
      params: {
        purchase_order_id: purchaseOrderId,
        page,
        per_page: perPage,
        with: 'product,unit',
      },
    });

    return parsePurchaseOrderItemsResponse(response.data, perPage);
  },

  createHead: async (payload: CreatePurchaseOrderHeadInput): Promise<PurchaseOrderCreateResult> => {
    const validated = createPurchaseOrderHeadInputSchema.parse(payload);
    const response = await api.post('production/purchase-orders', validated);
    return parseCreatePurchaseOrderHeadResponse(response.data);
  },

  updateHead: async (id: string | number, payload: UpdatePurchaseOrderHeadInput): Promise<PurchaseOrderHead> => {
    const validated = updatePurchaseOrderHeadInputSchema.parse(payload);
    const response = await api.put(`production/purchase-orders/${id}`, validated);
    return parsePurchaseOrderResponse(response.data);
  },

  deletePurchaseOrder: async (id: string | number): Promise<{ message: string }> => {
    const response = await api.delete(`production/purchase-orders/${id}`);
    const responseBody = response.data as { message?: string };
    return { message: responseBody?.message ?? 'Purchase Order deleted successfully' };
  },

  createItem: async (
    purchaseOrderId: string | number,
    payload: CreatePurchaseOrderItemInput
  ): Promise<{ message: string }> => {
    const validated = createPurchaseOrderItemInputSchema.parse(payload);
    const requestBody: Record<string, unknown> = {
      purchase_order_id: purchaseOrderId,
      ...validated,
    };

    const response = await api.post('production/purchase-order-items', requestBody);
    return parseCreatePurchaseOrderItemResponse(response.data);
  },

  exportPurchaseOrders: async (filters: PurchaseOrderFilterParams = {}): Promise<Blob> => {
    const response = await api.get('inventory/export', {
      params: cleanParams({
        q: filters.q,
        status: filters.status,
        vendor_id: filters.vendor_id,
        po_date_from: filters.po_date_from,
        po_date_to: filters.po_date_to,
      }),
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
