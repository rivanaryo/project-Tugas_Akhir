import { z } from 'zod';
import type {
  GoodReceiptCreateResult,
  GoodReceiptHead,
  GoodReceiptItemDetail,
  PaginatedGoodReceiptItems,
  PaginatedGoodReceipts,
} from '../types/goodReceipt.types';

// Strict schema for input validation (create/update)
export const goodReceiptStatusSchema = z.enum([
  'draft',
  'approved',
  'received',
  'cancelled',
]);

// Flexible schema for parsing backend responses (handles unknown/extra status values)
export const goodReceiptStatusResponseSchema = z.union([goodReceiptStatusSchema, z.string()]);

export const createGoodReceiptHeadInputSchema = z.object({
  gr_number: z.string().trim().min(1, 'Nomor GR wajib diisi').max(50, 'Nomor GR maksimal 50 karakter'),
  purchase_order_id: z.string().trim().min(1, 'Purchase Order wajib dipilih'),
  vendor_id: z.string().trim().min(1, 'Vendor wajib terisi'),
  warehouse_id: z.string().trim().min(1, 'Warehouse wajib dipilih'),
  status: goodReceiptStatusSchema,
  receipt_date: z.string().trim().min(1, 'Tanggal receipt wajib diisi'),
});

export const updateGoodReceiptHeadInputSchema = createGoodReceiptHeadInputSchema;

export const createGoodReceiptItemInputSchema = z.object({
  purchase_order_item_id: z.string().trim().min(1, 'Purchase Order Item wajib dipilih'),
  qty_received: z.number().min(1, 'Qty received minimal 1'),
});

export const updateGoodReceiptItemInputSchema = z.object({
  purchase_order_item_id: z.string().trim().min(1, 'Purchase Order Item wajib dipilih').optional(),
  qty_received: z.number().min(1, 'Qty received minimal 1').optional(),
});

const createGoodReceiptFormItemSchema = createGoodReceiptItemInputSchema.extend({
  product_name: z.string().optional(),
  qty_ordered: z.number().optional(),
});

export const createGoodReceiptFormSchema = z.object({
  head: createGoodReceiptHeadInputSchema,
  items: z.array(createGoodReceiptFormItemSchema).default([]),
});

const vendorRefSchema = z.object({
  id: z.union([z.string(), z.number()]),
  vendor_name: z.string(),
});

const purchaseOrderRefSchema = z.object({
  id: z.union([z.string(), z.number()]),
  po_number: z.string(),
  vendor_id: z.union([z.string(), z.number()]).optional(),
  vendor: vendorRefSchema.nullable().optional(),
});

const unitRefSchema = z.object({
  unit_code: z.string().optional(),
  unit_name: z.string().optional(),
});

const productRefSchema = z.object({
  id: z.union([z.string(), z.number()]),
  product_name: z.string(),
  unit: unitRefSchema.nullable().optional(),
});

const warehouseRefSchema = z.object({
  id: z.union([z.string(), z.number()]),
  code: z.string().optional(),
  name: z.string().optional(),
  location: z.string().optional(),
});

const pricelistRefSchema = z.object({
  id: z.union([z.string(), z.number()]),
  price: z.union([z.string(), z.number()]),
  currency: z.string(),
  vendor: vendorRefSchema.nullable().optional(),
  product: productRefSchema.nullable().optional(),
  product_name: z.string().optional(),
});

const purchaseOrderItemRefSchema = z.object({
  id: z.union([z.string(), z.number()]),
  purchase_order_id: z.union([z.string(), z.number()]),
  product_id: z.union([z.string(), z.number()]),
  quantity: z.number(),
  unit_price: z.union([z.string(), z.number()]),
  total_price: z.union([z.string(), z.number()]).nullable().optional(),
  pricelist_id: z.union([z.string(), z.number()]).nullable().optional(),
  product_name: z.string().optional(),
  pricelist: pricelistRefSchema.nullable().optional(),
});

const goodReceiptItemDetailSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  good_receipt_id: z.union([z.string(), z.number()]),
  purchase_order_item_id: z.union([z.string(), z.number()]),
  pricelist_id: z.union([z.string(), z.number()]).nullable().optional(),
  product_id: z.union([z.string(), z.number()]).nullable().optional(),
  qty_received: z.number(),
  purchase_order_item: purchaseOrderItemRefSchema.nullable().optional(),
  product: productRefSchema.nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const goodReceiptHeadSchema = z.object({
  id: z.union([z.string(), z.number()]),
  gr_number: z.string(),
  purchase_order_id: z.union([z.string(), z.number()]),
  vendor_id: z.union([z.string(), z.number()]),
  warehouse_id: z.union([z.string(), z.number()]).nullable().optional(),
  receipt_date: z.string(),
  status: goodReceiptStatusResponseSchema,
  actions: z.string().optional(),
  vendor: vendorRefSchema.nullable().optional(),
  warehouse: warehouseRefSchema.nullable().optional(),
  purchase_order: purchaseOrderRefSchema.nullable().optional(),
  purchaseOrder: purchaseOrderRefSchema.nullable().optional(),
  items: z.array(goodReceiptItemDetailSchema).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const goodReceiptItemsArraySchema = z.array(goodReceiptItemDetailSchema);
const goodReceiptsArraySchema = z.array(goodReceiptHeadSchema);
const paginationSchema = z.object({
  current_page: z.number(),
  data: goodReceiptsArraySchema,
  per_page: z.number().default(15),
  total: z.number(),
  last_page: z.number().default(1),
  from: z.number().nullable().optional(),
  to: z.number().nullable().optional(),
  next_page_url: z.string().nullable().optional(),
  prev_page_url: z.string().nullable().optional(),
});
const paginatedResponseSchema = z.object({ success: z.boolean().optional(), message: z.string().optional(), data: paginationSchema });
const nonPaginatedResponseSchema = z.object({ success: z.boolean().optional(), message: z.string().optional(), data: goodReceiptsArraySchema });

const emptyMeta = (perPage = 15) => ({ currentPage: 1, lastPage: 1, perPage, total: 0, from: 0, to: 0, hasNextPage: false, hasPrevPage: false });

export const parseGoodReceiptsResponse = (payload: unknown, perPageFallback = 15): PaginatedGoodReceipts => {
  const paginatedParsed = paginatedResponseSchema.safeParse(payload);
  if (paginatedParsed.success) {
    const pagination = paginatedParsed.data.data;
    const from = pagination.from ?? (pagination.data.length > 0 ? 1 : 0);
    const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);
    return { items: pagination.data as GoodReceiptHead[], meta: { currentPage: pagination.current_page, lastPage: pagination.last_page, perPage: pagination.per_page, total: pagination.total, from, to, hasNextPage: Boolean(pagination.next_page_url), hasPrevPage: Boolean(pagination.prev_page_url) } };
  }

  const nonPaginatedParsed = nonPaginatedResponseSchema.safeParse(payload);
  if (nonPaginatedParsed.success) {
    const items = nonPaginatedParsed.data.data as GoodReceiptHead[];
    const from = items.length > 0 ? 1 : 0;
    const to = items.length > 0 ? items.length : 0;
    return { items, meta: { ...emptyMeta(perPageFallback), total: items.length, from, to } };
  }

  const rawArrayParsed = goodReceiptsArraySchema.safeParse(payload);
  if (rawArrayParsed.success) {
    const items = rawArrayParsed.data as GoodReceiptHead[];
    const from = items.length > 0 ? 1 : 0;
    const to = items.length > 0 ? items.length : 0;
    return { items, meta: { ...emptyMeta(perPageFallback), total: items.length, from, to } };
  }

  return { items: [], meta: emptyMeta(perPageFallback) };
};

export const parseGoodReceiptResponse = (payload: unknown): GoodReceiptHead => {
  const wrapped = z.object({ success: z.boolean().optional(), message: z.string().optional(), data: goodReceiptHeadSchema }).safeParse(payload);
  if (wrapped.success) return wrapped.data.data as GoodReceiptHead;

  const raw = goodReceiptHeadSchema.safeParse(payload);
  if (raw.success) return raw.data as GoodReceiptHead;

  throw new Error('Failed to parse good receipt response');
};

export const parseGoodReceiptItemsResponse = (payload: unknown, perPageFallback = 15): PaginatedGoodReceiptItems => {
  const paginated = z.object({ success: z.boolean().optional(), message: z.string().optional(), data: z.object({ current_page: z.number(), data: goodReceiptItemsArraySchema, per_page: z.number().default(15), total: z.number(), last_page: z.number().default(1), from: z.number().nullable().optional(), to: z.number().nullable().optional(), next_page_url: z.string().nullable().optional(), prev_page_url: z.string().nullable().optional() }) }).safeParse(payload);
  if (paginated.success) {
    const pagination = paginated.data.data;
    const from = pagination.from ?? (pagination.data.length > 0 ? 1 : 0);
    const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);
    return { items: pagination.data as GoodReceiptItemDetail[], meta: { currentPage: pagination.current_page, lastPage: pagination.last_page, perPage: pagination.per_page, total: pagination.total, from, to, hasNextPage: Boolean(pagination.next_page_url), hasPrevPage: Boolean(pagination.prev_page_url) } };
  }

  const nonPaginated = z.object({ success: z.boolean().optional(), message: z.string().optional(), data: goodReceiptItemsArraySchema }).safeParse(payload);
  if (nonPaginated.success) {
    const items = nonPaginated.data.data as GoodReceiptItemDetail[];
    const from = items.length > 0 ? 1 : 0;
    const to = items.length > 0 ? items.length : 0;
    return { items, meta: { ...emptyMeta(perPageFallback), total: items.length, from, to } };
  }

  const raw = goodReceiptItemsArraySchema.safeParse(payload);
  if (raw.success) {
    const items = raw.data as GoodReceiptItemDetail[];
    const from = items.length > 0 ? 1 : 0;
    const to = items.length > 0 ? items.length : 0;
    return { items, meta: { ...emptyMeta(perPageFallback), total: items.length, from, to } };
  }

  return { items: [], meta: emptyMeta(perPageFallback) };
};

const createGoodReceiptHeadResponseSchema = z.object({ success: z.boolean().optional(), message: z.string().optional(), data: z.object({ id: z.union([z.string(), z.number()]) }).passthrough() });
const createGoodReceiptItemResponseSchema = z.object({ success: z.boolean().optional(), message: z.string().optional(), data: z.unknown().optional() });

export const parseCreateGoodReceiptHeadResponse = (payload: unknown): GoodReceiptCreateResult => {
  const parsed = createGoodReceiptHeadResponseSchema.safeParse(payload);
  if (!parsed.success) throw new Error('Failed to parse good receipt create response');
  return { good_receipt_id: parsed.data.data.id };
};

export const parseCreateGoodReceiptItemResponse = (payload: unknown) => {
  const parsed = createGoodReceiptItemResponseSchema.safeParse(payload);
  if (!parsed.success) throw new Error('Failed to parse good receipt item create response');
  return { message: parsed.data.message ?? 'Item good receipt berhasil ditambahkan' };
};

export type CreateGoodReceiptHeadInput = z.infer<typeof createGoodReceiptHeadInputSchema>;
export type UpdateGoodReceiptHeadInput = z.infer<typeof updateGoodReceiptHeadInputSchema>;
export type CreateGoodReceiptItemInput = z.infer<typeof createGoodReceiptItemInputSchema>;
export type UpdateGoodReceiptItemInput = z.infer<typeof updateGoodReceiptItemInputSchema>;
export type CreateGoodReceiptFormInput = z.infer<typeof createGoodReceiptFormSchema>;
