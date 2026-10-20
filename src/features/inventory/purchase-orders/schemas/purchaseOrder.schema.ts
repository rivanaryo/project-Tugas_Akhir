import { z } from 'zod';
import type {
  PaginatedPurchaseOrderItems,
  PaginatedPurchaseOrders,
  PurchaseOrderCreateResult,
  PurchaseOrderHead,
  PurchaseOrderItemDetail,
} from '../types/purchaseOrder.types';

// Strict schema for input validation (create/update)
export const purchaseOrderStatusSchema = z.enum([
  'draft',
  'approved',
  'received',
  'cancelled',
]);

// Flexible schema for parsing backend responses (handles unknown/extra status values)
export const purchaseOrderStatusResponseSchema = z.union([purchaseOrderStatusSchema, z.string()]);

export const createPurchaseOrderHeadInputSchema = z.object({
  po_number: z.string().trim().min(1, 'Nomor PO wajib diisi').max(50, 'Nomor PO maksimal 50 karakter'),
  vendor_id: z.string().trim().min(1, 'Vendor wajib dipilih'),
  status: purchaseOrderStatusSchema,
  po_date: z.string().trim().min(1, 'Tanggal PO wajib diisi'),
});

export const updatePurchaseOrderHeadInputSchema = z.object({
  vendor_id: z.string().trim().min(1, 'Vendor wajib dipilih'),
  status: purchaseOrderStatusSchema,
  po_date: z.string().trim().min(1, 'Tanggal PO wajib diisi'),
});

export const createPurchaseOrderItemInputSchema = z.object({
  product_id: z.string().trim().min(1, 'Produk wajib dipilih'),
  unit_id: z.string().trim().min(1, 'Satuan wajib dipilih'),
  quantity: z.number().int().min(1, 'Qty minimal 1'),
  unit_price: z.number().min(0, 'Harga satuan minimal 0'),
  tax_rate: z.number().min(0, 'Tax rate minimal 0').optional(),
});

export const createPurchaseOrderFormSchema = z.object({
  head: createPurchaseOrderHeadInputSchema,
  items: z.array(createPurchaseOrderItemInputSchema).min(1, 'Minimal 1 item'),
});

const purchaseOrderVendorRefSchema = z.object({
  id: z.union([z.string(), z.number()]),
  vendor_name: z.string(),
});

const purchaseOrderItemProductRefSchema = z.object({
  id: z.union([z.string(), z.number()]),
  product_name: z.string(),
});

const purchaseOrderItemUnitRefSchema = z.object({
  id: z.union([z.string(), z.number()]),
  unit_code: z.string().optional(),
  unit_name: z.string(),
});

const purchaseOrderItemDetailSchema = z.object({
  id: z.union([z.string(), z.number()]),
  purchase_order_id: z.union([z.string(), z.number()]),
  product_id: z.union([z.string(), z.number()]),
  unit_id: z.union([z.string(), z.number()]).nullable().optional(),
  quantity: z.number(),
  unit_price: z.union([z.string(), z.number()]),
  tax_rate: z.union([z.string(), z.number()]).nullable().optional(),
  tax_amount: z.union([z.string(), z.number()]).nullable().optional(),
  total_price: z.union([z.string(), z.number()]).nullable().optional(),
  product: purchaseOrderItemProductRefSchema.nullable().optional(),
  unit: purchaseOrderItemUnitRefSchema.nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const purchaseOrderHeadSchema = z.object({
  id: z.union([z.string(), z.number()]),
  po_number: z.string(),
  vendor_id: z.union([z.string(), z.number()]),
  status: purchaseOrderStatusResponseSchema,
  po_date: z.string(),
  total_price: z.union([z.string(), z.number()]).nullable().optional(),
  vendor: purchaseOrderVendorRefSchema.nullable().optional(),
  items: z.array(purchaseOrderItemDetailSchema).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const purchaseOrderItemsArraySchema = z.array(purchaseOrderItemDetailSchema);

const purchaseOrdersArraySchema = z.array(purchaseOrderHeadSchema);

const paginationSchema = z.object({
  current_page: z.number(),
  data: purchaseOrdersArraySchema,
  per_page: z.number().default(15),
  total: z.number(),
  last_page: z.number().default(1),
  from: z.number().nullable().optional(),
  to: z.number().nullable().optional(),
  next_page_url: z.string().nullable().optional(),
  prev_page_url: z.string().nullable().optional(),
});

const paginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: paginationSchema,
});

const nonPaginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: purchaseOrdersArraySchema,
});

const emptyMeta = (perPage = 15) => ({
  currentPage: 1,
  lastPage: 1,
  perPage,
  total: 0,
  from: 0,
  to: 0,
  hasNextPage: false,
  hasPrevPage: false,
});

export const parsePurchaseOrdersResponse = (payload: unknown, perPageFallback = 15): PaginatedPurchaseOrders => {
  const paginatedParsed = paginatedResponseSchema.safeParse(payload);
  if (paginatedParsed.success) {
    const pagination = paginatedParsed.data.data;
    const from = pagination.from ?? (pagination.data.length > 0 ? 1 : 0);
    const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);

    return {
      items: pagination.data as PurchaseOrderHead[],
      meta: {
        currentPage: pagination.current_page,
        lastPage: pagination.last_page,
        perPage: pagination.per_page,
        total: pagination.total,
        from,
        to,
        hasNextPage: Boolean(pagination.next_page_url),
        hasPrevPage: Boolean(pagination.prev_page_url),
      },
    };
  }

  const nonPaginatedParsed = nonPaginatedResponseSchema.safeParse(payload);
  if (nonPaginatedParsed.success) {
    const items = nonPaginatedParsed.data.data as PurchaseOrderHead[];
    const from = items.length > 0 ? 1 : 0;
    const to = items.length > 0 ? items.length : 0;

    return {
      items,
      meta: {
        ...emptyMeta(perPageFallback),
        total: items.length,
        from,
        to,
      },
    };
  }

  const rawArrayParsed = purchaseOrdersArraySchema.safeParse(payload);
  if (rawArrayParsed.success) {
    const items = rawArrayParsed.data as PurchaseOrderHead[];
    const from = items.length > 0 ? 1 : 0;
    const to = items.length > 0 ? items.length : 0;

    return {
      items,
      meta: {
        ...emptyMeta(perPageFallback),
        total: items.length,
        from,
        to,
      },
    };
  }

  return {
    items: [],
    meta: emptyMeta(perPageFallback),
  };
};

export const parsePurchaseOrderResponse = (payload: unknown): PurchaseOrderHead => {
  const wrapped = z
    .object({
      success: z.boolean().optional(),
      message: z.string().optional(),
      data: purchaseOrderHeadSchema,
    })
    .safeParse(payload);

  if (wrapped.success) {
    return wrapped.data.data as PurchaseOrderHead;
  }

  const raw = purchaseOrderHeadSchema.safeParse(payload);
  if (raw.success) {
    return raw.data as PurchaseOrderHead;
  }

  throw new Error('Failed to parse purchase order response');
};

export const parsePurchaseOrderItemsResponse = (payload: unknown, perPageFallback = 15): PaginatedPurchaseOrderItems => {
  const paginated = z
    .object({
      success: z.boolean().optional(),
      message: z.string().optional(),
      data: z.object({
        current_page: z.number(),
        data: purchaseOrderItemsArraySchema,
        per_page: z.number().default(15),
        total: z.number(),
        last_page: z.number().default(1),
        from: z.number().nullable().optional(),
        to: z.number().nullable().optional(),
        next_page_url: z.string().nullable().optional(),
        prev_page_url: z.string().nullable().optional(),
      }),
    })
    .safeParse(payload);

  if (paginated.success) {
    const pagination = paginated.data.data;
    const from = pagination.from ?? (pagination.data.length > 0 ? 1 : 0);
    const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);

    return {
      items: pagination.data as PurchaseOrderItemDetail[],
      meta: {
        currentPage: pagination.current_page,
        lastPage: pagination.last_page,
        perPage: pagination.per_page,
        total: pagination.total,
        from,
        to,
        hasNextPage: Boolean(pagination.next_page_url),
        hasPrevPage: Boolean(pagination.prev_page_url),
      },
    };
  }

  const nonPaginated = z
    .object({
      success: z.boolean().optional(),
      message: z.string().optional(),
      data: purchaseOrderItemsArraySchema,
    })
    .safeParse(payload);

  if (nonPaginated.success) {
    const items = nonPaginated.data.data as PurchaseOrderItemDetail[];
    const from = items.length > 0 ? 1 : 0;
    const to = items.length > 0 ? items.length : 0;

    return {
      items,
      meta: {
        ...emptyMeta(perPageFallback),
        total: items.length,
        from,
        to,
      },
    };
  }

  const raw = purchaseOrderItemsArraySchema.safeParse(payload);
  if (raw.success) {
    const items = raw.data as PurchaseOrderItemDetail[];
    const from = items.length > 0 ? 1 : 0;
    const to = items.length > 0 ? items.length : 0;

    return {
      items,
      meta: {
        ...emptyMeta(perPageFallback),
        total: items.length,
        from,
        to,
      },
    };
  }

  return {
    items: [],
    meta: emptyMeta(perPageFallback),
  };
};

const createPurchaseOrderHeadResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z
    .object({
      id: z.union([z.string(), z.number()]),
    })
    .passthrough(),
});

const createPurchaseOrderItemResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

export const parseCreatePurchaseOrderHeadResponse = (payload: unknown): PurchaseOrderCreateResult => {
  const parsed = createPurchaseOrderHeadResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error('Failed to parse purchase order create response');
  }

  return {
    purchase_order_id: parsed.data.data.id,
  };
};

export const parseCreatePurchaseOrderItemResponse = (payload: unknown) => {
  const parsed = createPurchaseOrderItemResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error('Failed to parse purchase order item create response');
  }

  return {
    message: parsed.data.message ?? 'Item berhasil ditambahkan',
  };
};

export type CreatePurchaseOrderHeadInput = z.infer<typeof createPurchaseOrderHeadInputSchema>;
export type UpdatePurchaseOrderHeadInput = z.infer<typeof updatePurchaseOrderHeadInputSchema>;
export type CreatePurchaseOrderItemInput = z.infer<typeof createPurchaseOrderItemInputSchema>;
export type CreatePurchaseOrderFormInput = z.infer<typeof createPurchaseOrderFormSchema>;
