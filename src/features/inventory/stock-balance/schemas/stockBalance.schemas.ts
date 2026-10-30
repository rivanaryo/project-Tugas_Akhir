import { z } from 'zod';
import type { PaginatedStockBalance } from '../types/stockBalance.types';

const quantity = z.union([z.number(), z.string().trim().min(1)]).transform(Number).pipe(z.number().finite());
const stockBalanceItemSchema = z.object({
  product_id: z.string(),
  product_name: z.string(),
  warehouse_id: z.string(),
  warehouse_name: z.string(),
  warehouse_code: z.string().nullish().transform((value) => value ?? ''),
  unit_code: z.string().nullish().transform((value) => value ?? ''),
  total_in: quantity,
  total_out: quantity,
  current_stock: quantity,
});
const itemsSchema = z.array(stockBalanceItemSchema);
const paginatorSchema = z.object({
  current_page: z.number().int().positive(),
  per_page: z.number().int().positive().optional(),
  last_page: z.number().int().positive().optional(),
  total: z.number().int().nonnegative(),
  from: z.number().nullable().optional(),
  to: z.number().nullable().optional(),
  data: itemsSchema,
});

export function parseStockBalanceResponse(payload: unknown, perPageFallback = 15): PaginatedStockBalance {
  const envelope = z.object({ success: z.boolean().optional(), message: z.string().optional(), data: z.unknown() }).safeParse(payload);
  if (envelope.success && envelope.data.success === false) throw new Error(envelope.data.message || 'Gagal memuat stock balance');
  const body = envelope.success ? envelope.data.data : payload;
  const paginated = paginatorSchema.safeParse(body);
  if (paginated.success) {
    const value = paginated.data;
    const perPage = value.per_page ?? perPageFallback;
    const lastPage = Math.max(1, value.last_page ?? Math.ceil(value.total / perPage));
    const from = value.data.length ? value.from ?? (value.current_page - 1) * perPage + 1 : 0;
    return {
      items: value.data,
      meta: {
        currentPage: value.current_page, lastPage, perPage, total: value.total,
        from, to: value.data.length ? value.to ?? from + value.data.length - 1 : 0,
        hasNextPage: value.current_page < lastPage, hasPrevPage: value.current_page > 1,
      },
    };
  }
  const items = itemsSchema.parse(body);
  return {
    items,
    meta: { currentPage: 1, lastPage: 1, perPage: perPageFallback, total: items.length, from: items.length ? 1 : 0, to: items.length, hasNextPage: false, hasPrevPage: false },
  };
}
