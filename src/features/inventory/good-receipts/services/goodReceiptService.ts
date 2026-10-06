import api from '../../../../lib/api';
import type {
  GoodReceiptCreateResult,
  GoodReceiptFilterParams,
  GoodReceiptHead,
  PaginatedGoodReceiptItems,
  PaginatedGoodReceipts,
} from '../types/goodReceipt.types';
import {
  createGoodReceiptHeadInputSchema,
  createGoodReceiptItemInputSchema,
  parseCreateGoodReceiptHeadResponse,
  parseCreateGoodReceiptItemResponse,
  parseGoodReceiptItemsResponse,
  parseGoodReceiptResponse,
  parseGoodReceiptsResponse,
  type CreateGoodReceiptHeadInput,
  type CreateGoodReceiptItemInput,
  type UpdateGoodReceiptHeadInput,
  updateGoodReceiptHeadInputSchema,
} from '../schemas/goodReceipt.schema';

const cleanParams = (params: Record<string, unknown>) => {
  const cleaned: Record<string, unknown> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    cleaned[key] = value;
  });
  return cleaned;
};

export const goodReceiptService = {
  fetchGoodReceipts: async (
    page: number,
    perPage = 15,
    filters: GoodReceiptFilterParams = {}
  ): Promise<PaginatedGoodReceipts> => {
    const response = await api.get('inventory/good-receipts', {
      params: cleanParams({
        page,
        per_page: perPage,
        q: filters.q,
        status: filters.status,
        vendor_id: filters.vendor_id,
        receipt_date_from: filters.receipt_date_from,
        receipt_date_to: filters.receipt_date_to,
      }),
    });

    return parseGoodReceiptsResponse(response.data, perPage);
  },

  fetchGoodReceipt: async (id: string | number): Promise<GoodReceiptHead> => {
    const response = await api.get(`inventory/good-receipts/${id}`);
    return parseGoodReceiptResponse(response.data);
  },

  fetchGoodReceiptItems: async (
    goodReceiptId: string | number,
    page: number,
    perPage = 15
  ): Promise<PaginatedGoodReceiptItems> => {
    const response = await api.get('inventory/good-receipt-items', {
      params: {
        good_receipt_id: goodReceiptId,
        page,
        per_page: perPage,
        with: 'purchase_order_item.pricelist.product,product',
      },
    });

    return parseGoodReceiptItemsResponse(response.data, perPage);
  },

  createHead: async (payload: CreateGoodReceiptHeadInput): Promise<GoodReceiptCreateResult> => {
    const validated = createGoodReceiptHeadInputSchema.parse(payload);
    const response = await api.post('inventory/good-receipts', validated);
    return parseCreateGoodReceiptHeadResponse(response.data);
  },

  updateHead: async (id: string | number, payload: UpdateGoodReceiptHeadInput): Promise<GoodReceiptHead> => {
    const validated = updateGoodReceiptHeadInputSchema.parse(payload);
    const response = await api.put(`inventory/good-receipts/${id}`, validated);
    return parseGoodReceiptResponse(response.data);
  },
  

  deleteGoodReceipt: async (id: string | number): Promise<{ message: string }> => {
    const response = await api.delete(`inventory/good-receipts/${id}`);
    const responseBody = response.data as { message?: string };
    return { message: responseBody?.message ?? 'Good Receipt deleted successfully' };
  },

  createItem: async (
    goodReceiptId: string | number,
    payload: CreateGoodReceiptItemInput
  ): Promise<{ message: string }> => {
    const validated = createGoodReceiptItemInputSchema.parse(payload);
    const response = await api.post('inventory/good-receipt-items', {
      good_receipt_id: goodReceiptId,
      ...validated,
    });

    return parseCreateGoodReceiptItemResponse(response.data);
  },
};
