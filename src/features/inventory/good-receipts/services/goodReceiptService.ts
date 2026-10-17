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
  type UpdateGoodReceiptItemInput,
  updateGoodReceiptHeadInputSchema,
  updateGoodReceiptItemInputSchema,
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
    const response = await api.get('production/good-receipts', {
      params: cleanParams({
        page,
        per_page: perPage,
        q: filters.q,
        status: filters.status,
        vendor_id: filters.vendor_id,
        warehouse_id: filters.warehouse_id,
        receipt_date_from: filters.receipt_date_from,
        receipt_date_to: filters.receipt_date_to,
        with: 'warehouse,items.product.unit,items.purchase_order_item.pricelist.product',
      }),
    });

    return parseGoodReceiptsResponse(response.data, perPage);
  },

  fetchGoodReceipt: async (id: string | number): Promise<GoodReceiptHead> => {
    const response = await api.get(`production/good-receipts/${id}`, {
      params: { with: 'warehouse,vendor,purchaseOrder,items.product.unit,items.purchase_order_item.pricelist.product' },
    });
    return parseGoodReceiptResponse(response.data);
  },

  fetchGoodReceiptItems: async (
    goodReceiptId: string | number,
    page: number,
    perPage = 15
  ): Promise<PaginatedGoodReceiptItems> => {
    const response = await api.get('production/good-receipt-items', {
      params: {
        good_receipt_id: goodReceiptId,
        page,
        per_page: perPage,
        with: 'purchase_order_item.pricelist.product,product',
      },
    });

    return parseGoodReceiptItemsResponse(response.data, perPage);
  },

  createHead: async (
    payload: CreateGoodReceiptHeadInput,
    items: CreateGoodReceiptItemInput[] = []
  ): Promise<GoodReceiptCreateResult> => {
    const validated = createGoodReceiptHeadInputSchema.parse(payload);
    const validatedItems = items.map((item) => createGoodReceiptItemInputSchema.parse(item));
    const response = await api.post('production/good-receipts', { ...validated, items: validatedItems });
    return parseCreateGoodReceiptHeadResponse(response.data);
  },

  updateHead: async (id: string | number, payload: UpdateGoodReceiptHeadInput): Promise<GoodReceiptHead> => {
    const validated = updateGoodReceiptHeadInputSchema.parse(payload);
    const response = await api.put(`production/good-receipts/${id}`, validated);
    return parseGoodReceiptResponse(response.data);
  },
  

  deleteGoodReceipt: async (id: string | number): Promise<{ message: string }> => {
    const response = await api.delete(`production/good-receipts/${id}`);
    const responseBody = response.data as { message?: string };
    return { message: responseBody?.message ?? 'Good Receipt deleted successfully' };
  },

  createItem: async (
    goodReceiptId: string | number,
    payload: CreateGoodReceiptItemInput
  ): Promise<{ message: string }> => {
    const validated = createGoodReceiptItemInputSchema.parse(payload);
    const response = await api.post('production/good-receipt-items', {
      good_receipt_id: goodReceiptId,
      ...validated,
    });

    return parseCreateGoodReceiptItemResponse(response.data);
  },

  updateItem: async (
    itemId: string | number,
    payload: UpdateGoodReceiptItemInput
  ): Promise<{ message: string }> => {
    const validated = updateGoodReceiptItemInputSchema.parse(payload);
    const response = await api.put(`production/good-receipt-items/${itemId}`, validated);

    return parseCreateGoodReceiptItemResponse(response.data);
  },

  deleteItem: async (itemId: string | number): Promise<{ message: string }> => {
    const response = await api.delete(`production/good-receipt-items/${itemId}`);
    const responseBody = response.data as { message?: string };
    return { message: responseBody?.message ?? 'Item good receipt berhasil dihapus' };
  },
};
