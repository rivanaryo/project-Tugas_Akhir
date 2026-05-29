import { z } from 'zod';
import type {
  PaginatedSalesDeliveryItems,
  PaginatedSalesDeliveries,
  SalesDeliveryCreateResult,
  SalesDeliveryHead,
  SalesDeliveryItemDetail,
} from '../types/salesDelivery.types';

export const salesDeliveryStatusSchema = z.preprocess((value) => {
  if (value === true || value === 1 || value === '1') return '1';
  if (value === 2 || value === '2') return '2';
  if (value === false || value === 0 || value === '0') return '0';

  const text = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (text === '1') return '1';
  if (text === '2') return '2';
  if (text === '0') return '0';
  if (text === 'true') return '1';
  if (text === 'false') return '0';
  if (text === 'completed') return '1';
  if (text === 'cancelled' || text === 'canceled') return '2';
  if (text === 'pending') return '0';

  return '0';
}, z.enum(['0', '1', '2']));

export const createSalesDeliveryHeadInputSchema = z.object({
  delivery_number: z.string().trim().min(1, 'Nomor Delivery wajib diisi').max(50, 'Nomor Delivery maksimal 50 karakter'),
  customer_id: z.string().trim().min(1, 'Customer wajib dipilih'),
  sales_order_id: z.string().trim().min(1, 'Sales Order wajib dipilih'),
  status: salesDeliveryStatusSchema,
  delivery_date: z.string().trim().min(1, 'Tanggal Delivery wajib diisi'),
});


export const updateSalesDeliveryHeadInputSchema = createSalesDeliveryHeadInputSchema
  .omit({ sales_order_id: true })
  .partial({ delivery_number: true, status: true });

export const createSalesDeliveryItemInputSchema = z.object({
  sales_delivery_id: z.union([z.string(), z.number()]).optional(),
  sales_order_item_id: z.string().trim().min(1, 'Item SO wajib dipilih'),
  qty_delivered: z.number().int().min(1, 'Qty minimal 1'),
  tax_rate: z.number().min(0, 'Tax rate minimal 0').optional(),
});

const salesDeliveryCustomerRefSchema = z.object({
  id: z.union([z.string(), z.number()]),
  customer_name: z.string(),
  contact_person: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
});

const salesOrderRefSchema = z.object({
  id: z.union([z.string(), z.number()]),
  order_number: z.string(),
  customer_id: z.union([z.string(), z.number()]),
  order_date: z.string(),
  status: z.union([z.boolean(), z.string()]),
  subtotal: z.union([z.string(), z.number()]).nullable().optional(),
  total_tax: z.union([z.string(), z.number()]).nullable().optional(),
  grand_total: z.union([z.string(), z.number()]).nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const salesDeliveryItemRefSchema = z.object({
  id: z.union([z.string(), z.number()]),
  sales_delivery_item_id: z.union([z.string(), z.number()]),
  qty_delivered: z.number().int().min(1, 'Qty minimal 1'),
  tax_rate: z.union([z.string(), z.number()]).nullable().optional(),
});

const salesDeliveryItemDetailSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  sales_delivery_id: z.union([z.string(), z.number()]).optional(),
  sales_order_item_id: z.union([z.string(), z.number()]).optional(),
  qty_delivered: z.union([z.string(), z.number()]).optional(),
  product_id: z.union([z.string(), z.number()]).optional(),
  product_name: z.string().optional(),
  tax_rate: z.union([z.string(), z.number()]).nullable().optional(),
  tax_amount: z.union([z.string(), z.number()]).nullable().optional(),
  total_price: z.union([z.string(), z.number()]).nullable().optional(),
  qty_so: z.union([z.string(), z.number()]).optional(),
  product: z.any().optional(),
  sales_order_item: z.any().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}).passthrough();

const salesDeliveryHeadSchema = z.object({
  id: z.union([z.string(), z.number()]),
  delivery_number: z.string(),
  customer_id: z.union([z.string(), z.number()]),
  sales_order_id: z.union([z.string(), z.number()]),
  status: salesDeliveryStatusSchema,
  delivery_date: z.string(),
  subtotal: z.union([z.string(), z.number()]).nullable().optional(),
  total_tax: z.union([z.string(), z.number()]).nullable().optional(),
  grand_total: z.union([z.string(), z.number()]).nullable().optional(),
  customer: salesDeliveryCustomerRefSchema.nullable().optional(),
  sales_order: salesOrderRefSchema.nullable().optional(),
  items: z.array(salesDeliveryItemDetailSchema).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const createSalesDeliveryFormSchema = z.object({
  head: createSalesDeliveryHeadInputSchema,
  items: z.array(salesDeliveryItemDetailSchema.omit({ id: true, sales_delivery_id: true })).min(1, 'Minimal 1 item'),
});

const salesDeliveryItemsArraySchema = z.array(salesDeliveryItemDetailSchema);

const salesDeliveriesArraySchema = z.array(salesDeliveryHeadSchema);

const salesDeliveryPaginationSchema = z.object({
  current_page: z.number(),
  data: salesDeliveriesArraySchema,
  per_page: z.number(),
  total: z.number(),
  last_page: z.number(),
  from: z.number().nullable().optional(),
  to: z.number().nullable().optional(),
  next_page_url: z.string().nullable().optional(),
  prev_page_url: z.string().nullable().optional(),
});

const salesDeliveryPaginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: salesDeliveryPaginationSchema,
});

const nonPaginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: salesDeliveriesArraySchema,
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

export const parseSalesDeliveriesResponse = (payload: unknown, perPageFallback = 15): PaginatedSalesDeliveries => {
  const paginatedParsed = salesDeliveryPaginatedResponseSchema.safeParse(payload);
  if (paginatedParsed.success) {
    const pagination = paginatedParsed.data.data;
    const from = pagination.from ?? (pagination.data.length > 0 ? 1 : 0);
    const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);

    return {
      items: pagination.data as SalesDeliveryHead[],
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
    const items = nonPaginatedParsed.data.data as SalesDeliveryHead[];
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

  const rawArrayParsed = salesDeliveriesArraySchema.safeParse(payload);
  if (rawArrayParsed.success) {
    const items = rawArrayParsed.data as SalesDeliveryHead[];
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

export const parseSalesDeliveryResponse = (payload: unknown): SalesDeliveryHead => {
  const wrapped = z
    .object({
      success: z.boolean().optional(),
      message: z.string().optional(),
      data: salesDeliveryHeadSchema,
    })
    .safeParse(payload);

  if (wrapped.success) {
    return wrapped.data.data as SalesDeliveryHead;
  }

  const raw = salesDeliveryHeadSchema.safeParse(payload);
  if (raw.success) {
    return raw.data as SalesDeliveryHead;
  }

  throw new Error('Failed to parse sales delivery response');
};

export const parseSalesDeliveryItemsResponse = (
  payload: unknown,
  perPageFallback = 15
): PaginatedSalesDeliveryItems => {
  const paginated = z
    .object({
      success: z.boolean().optional(),
      message: z.string().optional(),
      data: z.object({
        current_page: z.number(),
        data: salesDeliveryItemsArraySchema,
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
      items: pagination.data as SalesDeliveryItemDetail[],
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
      data: salesDeliveryItemsArraySchema,
    })
    .safeParse(payload);

  if (nonPaginated.success) {
    const items = nonPaginated.data.data as SalesDeliveryItemDetail[];
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

  const raw = salesDeliveryItemsArraySchema.safeParse(payload);
  if (raw.success) {
    const items = raw.data as SalesDeliveryItemDetail[];
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


const createSalesDeliveryItemResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

export const parseCreateSalesDeliveryHeadResponse = (payload: unknown): SalesDeliveryCreateResult => {
  // 1. Try deeply wrapped format { data: { data: { id: ... } } }
  const deeplyWrapped = z
    .object({
      data: z.object({
        data: z.object({
          id: z.union([z.string(), z.number()]),
        }),
      }),
    })
    .safeParse(payload);

  if (deeplyWrapped.success) {
    return { sales_delivery_id: deeplyWrapped.data.data.data.id };
  }

  // 2. Try wrapped format { data: { id: ... } }
  const wrapped = z
    .object({
      data: z.object({
        id: z.union([z.string(), z.number()]),
      }),
    })
    .safeParse(payload);

  if (wrapped.success) {
    return { sales_delivery_id: wrapped.data.data.id };
  }

  // 3. Try direct ID in data { data: id }
  const directData = z
    .object({
      data: z.union([z.string(), z.number()]),
    })
    .safeParse(payload);

  if (directData.success) {
    return { sales_delivery_id: directData.data.data };
  }

  // 4. Try direct ID at root { id: ... }
  const rootId = z
    .object({
      id: z.union([z.string(), z.number()]),
    })
    .safeParse(payload);

  if (rootId.success) {
    return { sales_delivery_id: rootId.data.id };
  }

  // 5. Try nested id inside success object { success: true, id: ... }
  const successWithId = z.object({
    success: z.boolean(),
    id: z.union([z.string(), z.number()]),
  }).safeParse(payload);

  if (successWithId.success) {
    return { sales_delivery_id: successWithId.data.id };
  }

  console.error('Failed to parse Sales Delivery head response:', payload);
  throw new Error('Gagal memproses respon dari server (ID tidak ditemukan)');
};

export const parseCreateSalesDeliveryItemResponse = (payload: unknown) => {
  const parsed = createSalesDeliveryItemResponseSchema.safeParse(payload);
  
  if (parsed.success) {
    return {
      message: parsed.data.message ?? 'Item berhasil ditambahkan',
    };
  }

  // Fallback for non-object or non-conforming success responses
  return {
    message: typeof payload === 'string' ? payload : 'Item berhasil ditambahkan',
  };
};

export type CreateSalesDeliveryHeadInput = z.infer<typeof createSalesDeliveryHeadInputSchema>;
export type UpdateSalesDeliveryHeadInput = z.infer<typeof updateSalesDeliveryHeadInputSchema>;
export type CreateSalesDeliveryItemInput = z.infer<typeof createSalesDeliveryItemInputSchema>;
export type CreateSalesDeliveryFormInput = z.infer<typeof createSalesDeliveryFormSchema>;
export type SalesDeliveryItem = z.infer<typeof salesDeliveryItemRefSchema>;
