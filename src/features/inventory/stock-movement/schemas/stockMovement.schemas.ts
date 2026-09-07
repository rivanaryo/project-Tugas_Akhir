import { z } from 'zod';
import type {
  PaginatedStockMovements,
  StockMovement,
  StockMovementCreateResult,
} from '../types/stockMovement.types';

export const stockMovementTypeSchema = z.enum(['in', 'out']);

const referenceableTypeValues = [
  'Purchase Order',
  'Sales Order',
  'Good Receipt',
  'Sales Delivery',
  'Unknown',
] as const;

export const referenceableTypeSchema = z
  .any()
  .transform((val) => {
    if (Array.isArray(val)) {
      return val[0] ?? null;
    }
    if (val === '' || val === undefined) {
      return null;
    }
    if (
      val !== 'Purchase Order' &&
      val !== 'Sales Order' &&
      val !== 'Good Receipt' &&
      val !== 'Sales Delivery' &&
      val !== 'Unknown'
    ) {
      return null;
    }
    return val;
  })
  .pipe(z.enum(referenceableTypeValues).nullable().optional());

export const createStockMovementInputSchema = z.object({
  m_products_id: z.string().trim().min(1, 'Product wajib dipilih'),
  m_warehouses_id: z.string().trim().min(1, 'Warehouse wajib dipilih'),
  type: stockMovementTypeSchema,
  quantity: z.number().int().min(1, 'Quantity minimal 1'),
  reference_number: z.string().trim().min(1, 'Reference Number wajib diisi'),
  referenceable_id: z.string().trim().optional(),
  referenceable_type: z.enum(['Purchase Order', 'Sales Order']).optional(),
  description: z.string().trim().optional(),
});

export const updateStockMovementInputSchema = createStockMovementInputSchema.partial();

const productRefSchema = z.object({
  id: z.string(),
  product_name: z.string().optional(),
  name: z.string().optional(),
  product_code: z.string().optional(),
  unit: z.any().optional(),
  category_id: z.string().optional(),
  unit_id: z.string().optional(),
  is_active: z.boolean().optional(),
  stock_level: z.number().optional(),
  min_stock_level: z.number().optional(),
  warehouse_id: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}).passthrough();

const warehouseRefSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  warehouse_name: z.string().optional(),
  code: z.string().optional(),
  warehouse_code: z.string().optional(),
  location: z.string().optional(),
  is_active: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}).passthrough();

const stockMovementSchema = z.object({
  id: z.string(),
  m_products_id: z.string().optional(),
  m_warehouses_id: z.string().optional(),
  type: stockMovementTypeSchema,
  quantity: z.number(),
  reference_number: z.string(),
  referenceable_id: z.string().nullable().optional(),
  referenceable_type: referenceableTypeSchema,
  document_type: referenceableTypeSchema,
  description: z.string().nullable().optional(),
  product: productRefSchema.nullable().optional(),
  warehouse: warehouseRefSchema.nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  stock_before: z.number().optional(),
  stock_after: z.number().optional(),
  user_id: z.string().nullable().optional(),
}).passthrough();

const stockMovementsArraySchema = z.array(stockMovementSchema);

const stockMovementPaginationSchema = z.object({
  current_page: z.number(),
  data: stockMovementsArraySchema,
  per_page: z.number(),
  total: z.number(),
  last_page: z.number(),
  from: z.number().nullable().optional(),
  to: z.number().nullable().optional(),
  next_page_url: z.string().nullable().optional(),
  prev_page_url: z.string().nullable().optional(),
});

const stockMovementPaginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: stockMovementPaginationSchema,
});

const nonPaginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: stockMovementsArraySchema,
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

export const parseStockMovementsResponse = (payload: unknown, perPageFallback = 15): PaginatedStockMovements => {
  try {
    const paginatedParsed = stockMovementPaginatedResponseSchema.safeParse(payload);
    if (!paginatedParsed.success) {
      console.error('Paginated parse failed:', paginatedParsed.error);
    }
    if (paginatedParsed.success) {
      const pagination = paginatedParsed.data.data;
      const from = pagination.from ?? (pagination.data.length > 0 ? 1 : 0);
      const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);

      return {
        items: pagination.data as StockMovement[],
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
      const items = nonPaginatedParsed.data.data as StockMovement[];
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

    const rawArrayParsed = stockMovementsArraySchema.safeParse(payload);
    if (rawArrayParsed.success) {
      const items = rawArrayParsed.data as StockMovement[];
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
      const items = payload as StockMovement[];
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

    console.error('Failed to parse stock movements response:', payload);
    return {
      items: [],
      meta: emptyMeta(perPageFallback),
    };
  } catch (error) {
    console.error('Error parsing stock movements response:', error, payload);
    return {
      items: [],
      meta: emptyMeta(perPageFallback),
    };
  }
};

export const parseStockMovementResponse = (payload: unknown): StockMovement => {
  const wrapped = z
    .object({
      success: z.boolean().optional(),
      message: z.string().optional(),
      data: stockMovementSchema,
    })
    .safeParse(payload);

  if (wrapped.success) {
    return wrapped.data.data as StockMovement;
  }

  const raw = stockMovementSchema.safeParse(payload);
  if (raw.success) {
    return raw.data as StockMovement;
  }

  throw new Error('Failed to parse stock movement response');
};

export const parseCreateStockMovementResponse = (payload: unknown): StockMovementCreateResult => {
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

  console.error('Failed to parse Stock Movement response:', payload);
  throw new Error('Gagal memproses respon dari server (ID tidak ditemukan)');
};

export type CreateStockMovementInput = z.infer<typeof createStockMovementInputSchema>;
export type UpdateStockMovementInput = z.infer<typeof updateStockMovementInputSchema>;
