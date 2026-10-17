import { z } from 'zod';
import type {
  PaginatedStockBalance,
  StockBalanceItem,
} from '../types/stockBalance.types';

const stockBalanceItemSchema = z.object({
  product_id: z.string(),
  product_name: z.string(),
  warehouse_id: z.string(),
  warehouse_name: z.string(),
  warehouse_code: z.string().optional().default(''),
  unit_code: z.string().optional().default(''),
  total_in: z.number(),
  total_out: z.number(),
  current_stock: z.number(),
}).passthrough();

const stockBalanceArraySchema = z.array(stockBalanceItemSchema);

const stockBalancePaginationSchema = z.object({
  current_page: z.number(),
  data: stockBalanceArraySchema,
  per_page: z.number(),
  total: z.number(),
  last_page: z.number(),
  from: z.number().nullable().optional(),
  to: z.number().nullable().optional(),
  next_page_url: z.string().nullable().optional(),
  prev_page_url: z.string().nullable().optional(),
});

const stockBalancePaginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: stockBalancePaginationSchema,
});

const nonPaginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: stockBalanceArraySchema,
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

export const parseStockBalanceResponse = (payload: unknown, perPageFallback = 15): PaginatedStockBalance => {
  try {
    const paginatedParsed = stockBalancePaginatedResponseSchema.safeParse(payload);
    if (paginatedParsed.success) {
      const pagination = paginatedParsed.data.data;
      const from = pagination.from ?? (pagination.data.length > 0 ? 1 : 0);
      const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);

      return {
        items: pagination.data as StockBalanceItem[],
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
      const items = nonPaginatedParsed.data.data as StockBalanceItem[];
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

    const rawArrayParsed = stockBalanceArraySchema.safeParse(payload);
    if (rawArrayParsed.success) {
      const items = rawArrayParsed.data as StockBalanceItem[];
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

    console.error('Failed to parse stock balance response:', payload);
    return { items: [], meta: emptyMeta(perPageFallback) };
  } catch (error) {
    console.error('Error parsing stock balance response:', error, payload);
    return { items: [], meta: emptyMeta(perPageFallback) };
  }
};
