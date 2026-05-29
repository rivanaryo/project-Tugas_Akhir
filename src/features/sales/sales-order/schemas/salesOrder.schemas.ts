import { z } from 'zod';
import type {
  PaginatedSalesOrderItems,
  PaginatedSalesOrders,
  SalesOrderCreateResult,
  SalesOrderHead,
  SalesOrderItemDetail,
} from '../types/salesOrder.types';

export const salesOrderStatusSchema = z.preprocess((value) => {
  if (value === true || value === 1 || value === '1') return '1';
  if (value === 2 || value === '2') return '2';
  if (value === false || value === 0 || value === '0') return '0';

  const text = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (text === 'completed') return '1';
  if (text === 'cancelled' || text === 'canceled') return '2';
  if (text === 'pending') return '0';
  if (text === 'true') return '1';
  if (text === 'false') return '0';

  return '0';
}, z.enum(['0', '1', '2']));

export const createSalesOrderHeadInputSchema = z.object({
  order_number: z.string().trim().min(1, 'Nomor SO wajib diisi').max(50, 'Nomor SO maksimal 50 karakter'),
  customer_id: z.string().trim().min(1, 'Customer wajib dipilih'),
  status: salesOrderStatusSchema,
  order_date: z.string().trim().min(1, 'Tanggal SO wajib diisi'),
});

export const updateSalesOrderHeadInputSchema = z.object({
  customer_id: z.string().trim().min(1, 'Customer wajib dipilih'),
  status: salesOrderStatusSchema,
  order_date: z.string().trim().min(1, 'Tanggal SO wajib diisi'),
});

export const createSalesOrderItemInputSchema = z.object({
  product_id: z.string().trim().min(1, 'Produk wajib dipilih'),
  quantity: z.number().int().min(1, 'Qty minimal 1'),
  unit_price: z.number().min(0, 'Harga satuan minimal 0'),
  tax_rate: z.number().min(0, 'Tax rate minimal 0').optional(),
});

const salesOrderCustomerRefSchema = z.object({
  id: z.union([z.string(), z.number()]),
  customer_name: z.string(),
});

const salesOrderItemDetailSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  sales_order_id: z.union([z.string(), z.number()]),
  product_id: z.union([z.string(), z.number()]),
  quantity: z.number(),
  unit_price: z.union([z.string(), z.number()]),
  tax_rate: z.union([z.string(), z.number()]).nullable().optional(),
  tax_amount: z.union([z.string(), z.number()]).nullable().optional(),
  total_price: z.union([z.string(), z.number()]).nullable().optional(),
  product: z
    .object({
      id: z.union([z.string(), z.number()]),
      product_name: z.string(),
    })
    .passthrough()
    .nullable()
    .optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const salesOrderHeadSchema = z.object({
  id: z.union([z.string(), z.number()]),
  order_number: z.string(),
  customer_id: z.union([z.string(), z.number()]),
  status: salesOrderStatusSchema,
  order_date: z.string(),
  subtotal: z.union([z.string(), z.number()]).nullable().optional(),
  total_tax: z.union([z.string(), z.number()]).nullable().optional(),
  grand_total: z.union([z.string(), z.number()]).nullable().optional(),
  customer: salesOrderCustomerRefSchema.nullable().optional(),
  items: z.array(salesOrderItemDetailSchema).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const createSalesOrderFormSchema = z.object({
  head: createSalesOrderHeadInputSchema,
  items: z.array(salesOrderItemDetailSchema.omit({ id: true, sales_order_id: true })).min(1, 'Minimal 1 item'),
});

const salesOrderItemsArraySchema = z.array(salesOrderItemDetailSchema);     

const salesOrdersArraySchema = z.array(salesOrderHeadSchema);

const salesOrderPaginationSchema = z.object({
  current_page: z.number(),
  data: salesOrdersArraySchema,
  per_page: z.number(),
  total: z.number(),
  last_page: z.number(),
  from: z.number().nullable().optional(),
  to: z.number().nullable().optional(),
  next_page_url: z.string().nullable().optional(),
  prev_page_url: z.string().nullable().optional(),
});

const salesOrderPaginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: salesOrderPaginationSchema,
});

const nonPaginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: salesOrdersArraySchema,
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

export const parseSalesOrdersResponse = (payload: unknown, perPageFallback = 15): PaginatedSalesOrders => {
  const paginatedParsed = salesOrderPaginatedResponseSchema.safeParse(payload);
  if (paginatedParsed.success) {
    const pagination = paginatedParsed.data.data;
    const from = pagination.from ?? (pagination.data.length > 0 ? 1 : 0);
    const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);

    return {
      items: pagination.data as SalesOrderHead[],
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
    const items = nonPaginatedParsed.data.data as SalesOrderHead[]; 
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

  const rawArrayParsed = salesOrdersArraySchema.safeParse(payload);
  if (rawArrayParsed.success) {
    const items = rawArrayParsed.data as SalesOrderHead[];
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

export const parseSalesOrderResponse = (payload: unknown): SalesOrderHead => {
  const wrapped = z
    .object({
      success: z.boolean().optional(),
      message: z.string().optional(),
      data: salesOrderHeadSchema,
    })
    .safeParse(payload);

  if (wrapped.success) {
    return wrapped.data.data as SalesOrderHead;
  }

  const raw = salesOrderHeadSchema.safeParse(payload);
  if (raw.success) {
    return raw.data as SalesOrderHead;  
  }

  throw new Error('Failed to parse sales order response');
};

export const parseSalesOrderItemsResponse = (payload: unknown, perPageFallback = 15): PaginatedSalesOrderItems => {
  const paginated = z
    .object({
      success: z.boolean().optional(),
      message: z.string().optional(),
      data: z.object({
        current_page: z.number(),
        data: salesOrderItemsArraySchema,
        per_page: z.number(),
        total: z.number(),
        last_page: z.number(),
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
      items: pagination.data as SalesOrderItemDetail[], 
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
      data: salesOrderItemsArraySchema,
    })
    .safeParse(payload);

  if (nonPaginated.success) {
    const items = nonPaginated.data.data as SalesOrderItemDetail[];
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

  const raw = salesOrderItemsArraySchema.safeParse(payload);
  if (raw.success) {
    const items = raw.data as SalesOrderItemDetail[];   
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

const createSalesOrderHeadResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z
    .object({
      id: z.union([z.string(), z.number()]),
    })
    .passthrough(),
});

const createSalesOrderItemResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

export const parseCreateSalesOrderHeadResponse = (payload: unknown): SalesOrderCreateResult => {
  const parsed = createSalesOrderHeadResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error('Failed to parse sales order create response');
  }

  return {
    sales_order_id: parsed.data.data.id,
  };
};

export const parseCreateSalesOrderItemResponse = (payload: unknown) => {
  const parsed = createSalesOrderItemResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error('Failed to parse sales order item create response');
  }

  return {
    message: parsed.data.message ?? 'Item berhasil ditambahkan',
  };
};

export type CreateSalesOrderHeadInput = z.infer<typeof createSalesOrderHeadInputSchema>;
export type UpdateSalesOrderHeadInput = z.infer<typeof updateSalesOrderHeadInputSchema>;
export type CreateSalesOrderItemInput = z.infer<typeof createSalesOrderItemInputSchema>;
export type CreateSalesOrderFormInput = z.infer<typeof createSalesOrderFormSchema>;
