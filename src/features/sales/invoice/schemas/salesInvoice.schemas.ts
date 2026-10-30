import { z } from 'zod';
import type {
  PaginatedSalesInvoiceItems,
  PaginatedSalesInvoices,
  SalesInvoiceCreateResult,
  SalesInvoiceHead,
  SalesInvoiceItemDetail,
} from '../types/salesInvoices';

// Schema untuk form (string) dan API response (number/boolean)
export const salesInvoiceStatusSchema = z.union([
  z.boolean(),
  z.enum(['pending', 'approved', 'completed', 'cancelled', 'paid']),
  z.number().int().min(0).max(2), // 0=pending, 1=paid/approved, 2=cancelled
]);

// Helper untuk convert status ke integer untuk API request
export const statusToInteger = (status: string | boolean | number): number => {
  if (typeof status === 'number') return status;
  if (typeof status === 'boolean') return status ? 1 : 0;
  const map: Record<string, number> = {
    pending: 0,
    approved: 1,
    paid: 1,
    completed: 1,
    cancelled: 2,
  };
  return map[status] ?? 0;
};

// Helper untuk convert integer dari API ke string untuk display
export const integerToStatus = (status: number | boolean | string): string => {
  if (typeof status === 'string') return status;
  if (typeof status === 'boolean') return status ? 'approved' : 'pending';
  const map: Record<number, string> = {
    0: 'pending',
    1: 'approved',
    2: 'cancelled',
  };
  return map[status] ?? 'pending';
};

export const invoiceTypeSchema = z.enum(['dp', 'pelunasan']);
export const invoiceStatusInputSchema = z.enum(['pending', 'approved', 'paid', 'cancelled']);
export const statusToApi = (status: unknown) => invoiceStatusInputSchema.parse(
  status === true || status === 1 || status === '1' ? 'approved' :
  status === false || status === 0 || status === '0' ? 'pending' :
  status === 2 || status === '2' ? 'cancelled' : status === 'completed' ? 'paid' : status
);
export const invoiceRequestSchema = z.object({
  invoice_number: z.string().trim().min(1),
  invoice_date: z.iso.date(),
  due_date: z.iso.date().optional(),
  customer_id: z.string().min(1),
  sales_order_id: z.string().min(1),
  type: invoiceTypeSchema,
  status: invoiceStatusInputSchema,
  items: z.array(z.object({
    sales_order_item_id: z.string().min(1),
    qty_invoice: z.coerce.number().int().min(1),
    unit_price: z.coerce.number().finite().min(0),
    tax_rate: z.coerce.number().finite().min(0).max(100).optional(),
  })).min(1),
}).refine((head) => !head.due_date || head.due_date >= head.invoice_date, { message: 'Jatuh tempo tidak boleh sebelum tanggal invoice', path: ['due_date'] });

export const salesInvoiceCreateFormSchema = z.object({
  head: z.object({
    invoice_number: z.string().trim().min(1, 'Nomor Invoice wajib diisi').max(50, 'Nomor Invoice maksimal 50 karakter'),
    invoice_date: z.iso.date('Tanggal Invoice tidak valid'),
    due_date: z.union([z.iso.date('Tanggal jatuh tempo tidak valid'), z.literal('')]).optional(),
    sales_order_id: z.string().trim().min(1, 'Sales Order wajib dipilih'),
    customer_id: z.string().trim().min(1, 'Customer wajib dipilih'),
    type: invoiceTypeSchema,
    status: invoiceStatusInputSchema,
  }).refine((head) => !head.due_date || head.due_date >= head.invoice_date, {
    message: 'Jatuh tempo tidak boleh sebelum tanggal invoice', path: ['due_date'],
  }),
  items: z
    .array(
      z
        .object({
          sales_order_item_id: z.string().trim().min(1, 'Item SO wajib dipilih'),
          qty_invoice: z.coerce.number().int().min(1, 'Qty minimal 1'),
          product_name: z.string().optional(),
          qty_so: z.coerce.number().optional(),
          unit_price: z.coerce.number().min(0, 'Unit price wajib diisi'),
          subtotal: z.union([z.string(), z.number()]).optional(),
          tax_rate: z.coerce.number().min(0).max(100).optional(),
          tax_amount: z.union([z.string(), z.number()]).optional(),
          total_price: z.union([z.string(), z.number()]).optional(),
        })
        .passthrough()
    )
    .min(1, 'Minimal 1 item'),
});

export type SalesInvoiceCreateFormInput = z.infer<typeof salesInvoiceCreateFormSchema>;

const salesInvoiceCustomerRefSchema = z.object({
  id: z.union([z.string(), z.number()]),
  customer_name: z.string(),
  contact_person: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
});

const salesInvoiceItemDetailSchema = z.object({
  id: z.union([z.string(), z.number()]),
  invoice_id: z.union([z.string(), z.number()]),
  sales_order_item_id: z.union([z.string(), z.number()]),
  qty_invoice: z.coerce.number(),
  unit_price: z.union([z.string(), z.number()]).nullable().optional(),
  subtotal: z.union([z.string(), z.number()]).nullable().optional(),
  tax_rate: z.union([z.string(), z.number()]).nullable().optional(),
  tax_amount: z.union([z.string(), z.number()]).nullable().optional(),
  total_price: z.union([z.string(), z.number()]).nullable().optional(),
  sales_order_item: z.any().optional(),
}).passthrough();

const salesInvoiceHeadSchema = z.object({
  id: z.union([z.string(), z.number()]),
  invoice_number: z.string(),
  invoice_date: z.string().default(''),
  due_date: z.string().nullable().optional(),
  type: invoiceTypeSchema.optional(),
  customer_id: z.union([z.string(), z.number()]).default(''),
  sales_order_id: z.union([z.string(), z.number()]).nullable().optional(),
  subtotal: z.union([z.string(), z.number()]).nullable().optional(),
  tax_total: z.union([z.string(), z.number()]).nullable().optional(),
  grand_total: z.union([z.string(), z.number()]).nullable().optional(),
  status: salesInvoiceStatusSchema,
  customer: salesInvoiceCustomerRefSchema.nullable().optional(),
  items: z.array(salesInvoiceItemDetailSchema).optional(),
});

const salesInvoiceItemsArraySchema = z.array(salesInvoiceItemDetailSchema);
const salesInvoicesArraySchema = z.array(salesInvoiceHeadSchema);

const salesInvoicePaginationSchema = z.object({
  current_page: z.number(),
  data: salesInvoicesArraySchema,
  per_page: z.number().optional(),
  total: z.number(),
  last_page: z.number().default(1),
  from: z.number().nullable().optional(),
  to: z.number().nullable().optional(),
  next_page_url: z.string().nullable().optional(),
  prev_page_url: z.string().nullable().optional(),
});

const laravelMetaSchema = z.object({
  current_page: z.number(),
  last_page: z.number().default(1),
  per_page: z.number().optional(),
  total: z.number(),
  from: z.number().nullable().optional(),
  to: z.number().nullable().optional(),
});

const laravelLinksSchema = z
  .object({
    next: z.string().nullable().optional(),
    prev: z.string().nullable().optional(),
  })
  .passthrough();

const salesInvoicePaginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: salesInvoicePaginationSchema,
});

const nonPaginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: salesInvoicesArraySchema,
});

const laravelResourceCollectionSchema = z
  .object({
    data: salesInvoicesArraySchema,
    meta: laravelMetaSchema,
    links: laravelLinksSchema.optional(),
  })
  .passthrough();

const laravelWrappedResourceCollectionSchema = z
  .object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    data: laravelResourceCollectionSchema,
  })
  .passthrough();

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

export const parseSalesInvoicesResponse = (payload: unknown, perPageFallback = 15): PaginatedSalesInvoices => {
  const paginatedParsed = salesInvoicePaginatedResponseSchema.safeParse(payload);
  if (paginatedParsed.success) {
    const pagination = paginatedParsed.data.data;
    const from = pagination.from ?? (pagination.data.length > 0 ? (pagination.current_page - 1) * (pagination.per_page ?? perPageFallback) + 1 : 0);
    const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);

    return {
      items: pagination.data as SalesInvoiceHead[],
      meta: {
        currentPage: pagination.current_page,
        lastPage: Math.max(pagination.last_page, Math.ceil(pagination.total / (pagination.per_page ?? perPageFallback))),
        perPage: (pagination.per_page ?? perPageFallback),
        total: pagination.total,
        from,
        to,
        hasNextPage: Boolean(pagination.next_page_url) || pagination.current_page < Math.max(pagination.last_page, Math.ceil(pagination.total / (pagination.per_page ?? perPageFallback))),
        hasPrevPage: Boolean(pagination.prev_page_url) || pagination.current_page > 1,
      },
    };
  }

  const rootPaginatorParsed = salesInvoicePaginationSchema.safeParse(payload);
  if (rootPaginatorParsed.success) {
    const pagination = rootPaginatorParsed.data;
    const from = pagination.from ?? (pagination.data.length > 0 ? (pagination.current_page - 1) * (pagination.per_page ?? perPageFallback) + 1 : 0);
    const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);

    return {
      items: pagination.data as SalesInvoiceHead[],
      meta: {
        currentPage: pagination.current_page,
        lastPage: Math.max(pagination.last_page, Math.ceil(pagination.total / (pagination.per_page ?? perPageFallback))),
        perPage: (pagination.per_page ?? perPageFallback),
        total: pagination.total,
        from,
        to,
        hasNextPage: Boolean(pagination.next_page_url) || pagination.current_page < Math.max(pagination.last_page, Math.ceil(pagination.total / (pagination.per_page ?? perPageFallback))),
        hasPrevPage: Boolean(pagination.prev_page_url) || pagination.current_page > 1,
      },
    };
  }

  const laravelWrapped = laravelWrappedResourceCollectionSchema.safeParse(payload);
  if (laravelWrapped.success) {
    const collection = laravelWrapped.data.data;
    const from = collection.meta.from ?? (collection.data.length > 0 ? 1 : 0);
    const to = collection.meta.to ?? (collection.data.length > 0 ? from + collection.data.length - 1 : 0);
    const hasNextPage = collection.links?.next ? true : collection.meta.current_page < collection.meta.last_page;
    const hasPrevPage = collection.links?.prev ? true : collection.meta.current_page > 1;

    return {
      items: collection.data as SalesInvoiceHead[],
      meta: {
        currentPage: collection.meta.current_page,
        lastPage: collection.meta.last_page,
        perPage: (collection.meta.per_page ?? perPageFallback),
        total: collection.meta.total,
        from,
        to,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  const laravelRoot = laravelResourceCollectionSchema.safeParse(payload);
  if (laravelRoot.success) {
    const collection = laravelRoot.data;
    const from = collection.meta.from ?? (collection.data.length > 0 ? 1 : 0);
    const to = collection.meta.to ?? (collection.data.length > 0 ? from + collection.data.length - 1 : 0);
    const hasNextPage = collection.links?.next ? true : collection.meta.current_page < collection.meta.last_page;
    const hasPrevPage = collection.links?.prev ? true : collection.meta.current_page > 1;

    return {
      items: collection.data as SalesInvoiceHead[],
      meta: {
        currentPage: collection.meta.current_page,
        lastPage: collection.meta.last_page,
        perPage: (collection.meta.per_page ?? perPageFallback),
        total: collection.meta.total,
        from,
        to,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  const nonPaginatedParsed = nonPaginatedResponseSchema.safeParse(payload);
  if (nonPaginatedParsed.success) {
    const items = nonPaginatedParsed.data.data as SalesInvoiceHead[];
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

  const rawArrayParsed = salesInvoicesArraySchema.safeParse(payload);
  if (rawArrayParsed.success) {
    const items = rawArrayParsed.data as SalesInvoiceHead[];
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

export const parseSalesInvoiceResponse = (payload: unknown): SalesInvoiceHead => {
  const wrapped = z
    .object({
      success: z.boolean().optional(),
      message: z.string().optional(),
      data: salesInvoiceHeadSchema,
    })
    .safeParse(payload);

  if (wrapped.success) {
    return wrapped.data.data as SalesInvoiceHead;
  }

  const raw = salesInvoiceHeadSchema.safeParse(payload);
  if (raw.success) {
    return raw.data as SalesInvoiceHead;
  }

  throw new Error('Failed to parse sales invoice response');
};

export const parseSalesInvoiceItemsResponse = (payload: unknown, perPageFallback = 15): PaginatedSalesInvoiceItems => {
  const paginated = z
    .object({
      success: z.boolean().optional(),
      message: z.string().optional(),
      data: z.object({
        current_page: z.number(),
        data: salesInvoiceItemsArraySchema,
        per_page: z.number().optional(),
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
    const from = pagination.from ?? (pagination.data.length > 0 ? (pagination.current_page - 1) * (pagination.per_page ?? perPageFallback) + 1 : 0);
    const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);

    return {
      items: pagination.data as SalesInvoiceItemDetail[],
      meta: {
        currentPage: pagination.current_page,
        lastPage: Math.max(pagination.last_page, Math.ceil(pagination.total / (pagination.per_page ?? perPageFallback))),
        perPage: (pagination.per_page ?? perPageFallback),
        total: pagination.total,
        from,
        to,
        hasNextPage: Boolean(pagination.next_page_url) || pagination.current_page < Math.max(pagination.last_page, Math.ceil(pagination.total / (pagination.per_page ?? perPageFallback))),
        hasPrevPage: Boolean(pagination.prev_page_url) || pagination.current_page > 1,
      },
    };
  }

  const rootItemsPaginatorParsed = z
    .object({
      current_page: z.number(),
      data: salesInvoiceItemsArraySchema,
      per_page: z.number().optional(),
      total: z.number(),
      last_page: z.number().default(1),
      from: z.number().nullable().optional(),
      to: z.number().nullable().optional(),
      next_page_url: z.string().nullable().optional(),
      prev_page_url: z.string().nullable().optional(),
    })
    .safeParse(payload);

  if (rootItemsPaginatorParsed.success) {
    const pagination = rootItemsPaginatorParsed.data;
    const from = pagination.from ?? (pagination.data.length > 0 ? (pagination.current_page - 1) * (pagination.per_page ?? perPageFallback) + 1 : 0);
    const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);

    return {
      items: pagination.data as SalesInvoiceItemDetail[],
      meta: {
        currentPage: pagination.current_page,
        lastPage: Math.max(pagination.last_page, Math.ceil(pagination.total / (pagination.per_page ?? perPageFallback))),
        perPage: (pagination.per_page ?? perPageFallback),
        total: pagination.total,
        from,
        to,
        hasNextPage: Boolean(pagination.next_page_url) || pagination.current_page < Math.max(pagination.last_page, Math.ceil(pagination.total / (pagination.per_page ?? perPageFallback))),
        hasPrevPage: Boolean(pagination.prev_page_url) || pagination.current_page > 1,
      },
    };
  }

  const laravelWrappedItems = z
    .object({
      success: z.boolean().optional(),
      message: z.string().optional(),
      data: z
        .object({
          data: salesInvoiceItemsArraySchema,
          meta: laravelMetaSchema,
          links: laravelLinksSchema.optional(),
        })
        .passthrough(),
    })
    .passthrough()
    .safeParse(payload);

  if (laravelWrappedItems.success) {
    const collection = laravelWrappedItems.data.data;
    const from = collection.meta.from ?? (collection.data.length > 0 ? 1 : 0);
    const to = collection.meta.to ?? (collection.data.length > 0 ? from + collection.data.length - 1 : 0);
    const hasNextPage = collection.links?.next ? true : collection.meta.current_page < collection.meta.last_page;
    const hasPrevPage = collection.links?.prev ? true : collection.meta.current_page > 1;

    return {
      items: collection.data as SalesInvoiceItemDetail[],
      meta: {
        currentPage: collection.meta.current_page,
        lastPage: collection.meta.last_page,
        perPage: (collection.meta.per_page ?? perPageFallback),
        total: collection.meta.total,
        from,
        to,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  const laravelRootItems = z
    .object({
      data: salesInvoiceItemsArraySchema,
      meta: laravelMetaSchema,
      links: laravelLinksSchema.optional(),
    })
    .passthrough()
    .safeParse(payload);

  if (laravelRootItems.success) {
    const collection = laravelRootItems.data;
    const from = collection.meta.from ?? (collection.data.length > 0 ? 1 : 0);
    const to = collection.meta.to ?? (collection.data.length > 0 ? from + collection.data.length - 1 : 0);
    const hasNextPage = collection.links?.next ? true : collection.meta.current_page < collection.meta.last_page;
    const hasPrevPage = collection.links?.prev ? true : collection.meta.current_page > 1;

    return {
      items: collection.data as SalesInvoiceItemDetail[],
      meta: {
        currentPage: collection.meta.current_page,
        lastPage: collection.meta.last_page,
        perPage: (collection.meta.per_page ?? perPageFallback),
        total: collection.meta.total,
        from,
        to,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  const nonPaginated = z
    .object({
      success: z.boolean().optional(),
      message: z.string().optional(),
      data: salesInvoiceItemsArraySchema,
    })
    .safeParse(payload);

  if (nonPaginated.success) {
    const items = nonPaginated.data.data as SalesInvoiceItemDetail[];
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

  const raw = salesInvoiceItemsArraySchema.safeParse(payload);
  if (raw.success) {
    const items = raw.data as SalesInvoiceItemDetail[];
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

export const parseCreateSalesInvoiceHeadResponse = (payload: unknown): SalesInvoiceCreateResult => {
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
    return { sales_invoice_id: deeplyWrapped.data.data.data.id };
  }

  const wrapped = z
    .object({
      data: z.object({
        id: z.union([z.string(), z.number()]),
      }),
    })
    .safeParse(payload);

  if (wrapped.success) {
    return { sales_invoice_id: wrapped.data.data.id };
  }

  const directData = z
    .object({
      data: z.union([z.string(), z.number()]),
    })
    .safeParse(payload);

  if (directData.success) {
    return { sales_invoice_id: directData.data.data };
  }

  const rootId = z
    .object({
      id: z.union([z.string(), z.number()]),
    })
    .safeParse(payload);

  if (rootId.success) {
    return { sales_invoice_id: rootId.data.id };
  }

  const successWithId = z
    .object({
      success: z.boolean(),
      id: z.union([z.string(), z.number()]),
    })
    .safeParse(payload);

  if (successWithId.success) {
    return { sales_invoice_id: successWithId.data.id };
  }

  throw new Error('Gagal memproses respon dari server (ID tidak ditemukan)');
};

export type SalesInvoiceStatusInput = z.infer<typeof salesInvoiceStatusSchema>;
