import { z } from 'zod';
import type {
  PaginatedStockOpnames,
  StockOpname,
  StockOpnameCreateResult,
} from '../types/stockOpname.types';

export const stockOpnameStatusSchema = z.enum(['Draft', 'Completed', 'Cancelled']);

export const stockOpnameItemInputSchema = z.object({
  product_id: z.string().trim().min(1, 'Product wajib dipilih'),
  physical_qty: z.number().int().min(0, 'Physical quantity minimal 0'),
  system_qty: z.number().int().optional(),
  difference_qty: z.number().int().optional(),
  notes: z.string().trim().optional(),
});

export const createStockOpnameInputSchema = z.object({
  opname_number: z.string().trim().min(1, 'Opname Number wajib diisi'),
  opname_date: z.string().trim().min(1, 'Opname Date wajib diisi'),
  warehouse_id: z.string().trim().min(1, 'Warehouse wajib dipilih'),
  status: stockOpnameStatusSchema,
  notes: z.string().trim().optional(),
  items: z.array(stockOpnameItemInputSchema).min(1, 'Minimal 1 item wajib diisi'),
});

export const updateStockOpnameInputSchema = createStockOpnameInputSchema.partial();

const productRefSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  product_name: z.string().optional(),
}).passthrough();

const warehouseRefSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  warehouse_name: z.string().optional(),
}).passthrough();

const createdByRefSchema = z.object({
  id: z.string(),
  email: z.string().optional(),
}).passthrough();

const stockOpnameItemSchema = z.object({
  id: z.string(),
  m_products_id: z.string().optional(),
  product_id: z.string().optional(),
  product: productRefSchema.nullable().optional(),
  system_qty: z.number().optional(),
  physical_qty: z.number(),
  difference_qty: z.number().optional(),
  notes: z.string().nullable().optional(),
}).passthrough();

const stockOpnameSchema = z.object({
  id: z.string(),
  opname_number: z.string(),
  opname_date: z.string(),
  m_warehouses_id: z.string().optional(),
  warehouse_id: z.string().optional(),
  warehouse: warehouseRefSchema.nullable().optional(),
  status: z.string(),
  notes: z.string().nullable().optional(),
  created_by: z.union([z.string(), createdByRefSchema, z.null()]).optional(),
  items: z.array(stockOpnameItemSchema).default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}).passthrough();

const stockOpnamesArraySchema = z.array(stockOpnameSchema);

const stockOpnamePaginationSchema = z.object({
  current_page: z.number(),
  data: stockOpnamesArraySchema,
  per_page: z.number(),
  total: z.number(),
  last_page: z.number(),
  from: z.number().nullable().optional(),
  to: z.number().nullable().optional(),
  next_page_url: z.string().nullable().optional(),
  prev_page_url: z.string().nullable().optional(),
});

const stockOpnamePaginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: stockOpnamePaginationSchema,
});

const nonPaginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: stockOpnamesArraySchema,
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

export const parseStockOpnamesResponse = (payload: unknown, perPageFallback = 15): PaginatedStockOpnames => {
  try {
    const paginatedParsed = stockOpnamePaginatedResponseSchema.safeParse(payload);
    if (!paginatedParsed.success) {
      console.error('Paginated parse failed:', paginatedParsed.error);
    }
    if (paginatedParsed.success) {
      const pagination = paginatedParsed.data.data;
      const from = pagination.from ?? (pagination.data.length > 0 ? 1 : 0);
      const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);

      return {
        items: pagination.data as StockOpname[],
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
      const items = nonPaginatedParsed.data.data as StockOpname[];
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

    const rawArrayParsed = stockOpnamesArraySchema.safeParse(payload);
    if (rawArrayParsed.success) {
      const items = rawArrayParsed.data as StockOpname[];
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

    if (Array.isArray(payload)) {
      const items = payload as StockOpname[];
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

    console.error('Failed to parse stock opnames response:', payload);
    return {
      items: [],
      meta: emptyMeta(perPageFallback),
    };
  } catch (error) {
    console.error('Error parsing stock opnames response:', error, payload);
    return {
      items: [],
      meta: emptyMeta(perPageFallback),
    };
  }
};

export const parseStockOpnameResponse = (payload: unknown): StockOpname => {
  const wrapped = z
    .object({
      success: z.boolean().optional(),
      message: z.string().optional(),
      data: stockOpnameSchema,
    })
    .safeParse(payload);

  if (wrapped.success) {
    return wrapped.data.data as StockOpname;
  }

  const raw = stockOpnameSchema.safeParse(payload);
  if (raw.success) {
    return raw.data as StockOpname;
  }

  throw new Error('Failed to parse stock opname response');
};

export const parseCreateStockOpnameResponse = (payload: unknown): StockOpnameCreateResult => {
  const wrappedArray = z
    .object({
      data: z.array(z.object({ id: z.string() })).min(1),
    })
    .safeParse(payload);

  if (wrappedArray.success) {
    return { id: wrappedArray.data.data[0].id };
  }

  const deeplyWrapped = z
    .object({
      data: z.object({
        data: z.object({
          id: z.string(),
        }),
      }),
    })
    .safeParse(payload);

  if (deeplyWrapped.success) {
    return { id: deeplyWrapped.data.data.data.id };
  }

  const wrapped = z
    .object({
      data: z.object({
        id: z.string(),
      }),
    })
    .safeParse(payload);

  if (wrapped.success) {
    return { id: wrapped.data.data.id };
  }

  const directData = z
    .object({
      data: z.string(),
    })
    .safeParse(payload);

  if (directData.success) {
    return { id: directData.data.data };
  }

  const rootId = z
    .object({
      id: z.string(),
    })
    .safeParse(payload);

  if (rootId.success) {
    return { id: rootId.data.id };
  }

  const successWithId = z.object({
    success: z.boolean(),
    id: z.string(),
  }).safeParse(payload);

  if (successWithId.success) {
    return { id: successWithId.data.id };
  }

  console.error('Failed to parse Stock Opname response:', payload);
  throw new Error('Gagal memproses respon dari server (ID tidak ditemukan)');
};

export type CreateStockOpnameInput = z.infer<typeof createStockOpnameInputSchema>;
export type UpdateStockOpnameInput = z.infer<typeof updateStockOpnameInputSchema>;
export type StockOpnameItemInput = z.infer<typeof stockOpnameItemInputSchema>;
