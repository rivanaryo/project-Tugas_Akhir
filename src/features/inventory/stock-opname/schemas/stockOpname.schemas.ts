import { z } from 'zod';
import type { PaginatedStockOpnames, StockOpname, StockOpnameCreateResult } from '../types/stockOpname.types';

export const stockOpnameStatusSchema = z.enum(['Draft', 'Completed', 'Cancelled']);
export const stockOpnameItemInputSchema = z.object({
  product_id: z.string().uuid('Product wajib dipilih'),
  physical_qty: z.number().int().min(0, 'Physical quantity minimal 0'),
  system_qty: z.number().int().optional(),
  difference_qty: z.number().int().optional(),
  notes: z.string().trim().max(255, 'Catatan maksimal 255 karakter').optional(),
});
const itemsInputSchema = z.array(stockOpnameItemInputSchema).min(1, 'Minimal 1 item wajib diisi').superRefine((items, context) => {
  const seen = new Set<string>();
  items.forEach((item, index) => {
    if (seen.has(item.product_id)) context.addIssue({ code: 'custom', message: 'Product sudah dipilih pada baris lain', path: [index, 'product_id'] });
    seen.add(item.product_id);
  });
});
export const createStockOpnameInputSchema = z.object({
  opname_number: z.string().trim().min(1, 'Opname Number wajib diisi').max(50, 'Nomor maksimal 50 karakter'),
  opname_date: z.iso.date('Tanggal opname tidak valid'),
  warehouse_id: z.string().uuid('Warehouse wajib dipilih'),
  status: stockOpnameStatusSchema,
  notes: z.string().trim().optional(),
  items: itemsInputSchema,
});
export const updateStockOpnameInputSchema = createStockOpnameInputSchema.partial();

const productRefSchema = z.object({ id: z.string(), name: z.string().optional(), product_name: z.string().optional() }).passthrough();
const warehouseRefSchema = z.object({ id: z.string(), name: z.string().optional(), warehouse_name: z.string().optional() }).passthrough();
const stockOpnameItemSchema = z.object({
  id: z.string(), product_id: z.string().optional(), m_products_id: z.string().optional(),
  product: productRefSchema.nullable().optional(), system_qty: z.number().optional(),
  physical_qty: z.number(), difference_qty: z.number().optional(), notes: z.string().nullable().optional(),
}).passthrough();
const stockOpnameSchema = z.object({
  id: z.string(), opname_number: z.string(), opname_date: z.string(), status: stockOpnameStatusSchema,
  warehouse_id: z.string().optional(), m_warehouses_id: z.string().optional(), warehouse: warehouseRefSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
  created_by: z.union([z.string(), z.object({ id: z.string(), email: z.string().optional() }), z.null()]).optional(),
  items: z.array(stockOpnameItemSchema).default([]), created_at: z.string().optional(), updated_at: z.string().optional(),
}).passthrough();
const paginationSchema = z.object({
  current_page: z.number(), per_page: z.number(), last_page: z.number(), total: z.number(),
  from: z.number().nullable().optional(), to: z.number().nullable().optional(),
});

export const parseStockOpnamesResponse = (payload: unknown): PaginatedStockOpnames => {
  const { data } = z.object({
    success: z.literal(true).optional(),
    data: z.union([
      z.object({ data: z.array(stockOpnameSchema), meta: paginationSchema }),
      z.array(stockOpnameSchema).transform((items) => ({
        data: items,
        meta: { current_page: 1, per_page: Math.max(15, items.length), last_page: 1, total: items.length, from: items.length ? 1 : 0, to: items.length },
      })),
    ]),
  }).parse(payload);
  const pagination = data.meta;
  const from = pagination.from ?? (data.data.length ? (pagination.current_page - 1) * pagination.per_page + 1 : 0);
  return {
    items: data.data as StockOpname[],
    meta: {
      currentPage: pagination.current_page, lastPage: pagination.last_page, perPage: pagination.per_page, total: pagination.total,
      from, to: pagination.to ?? (data.data.length ? from + data.data.length - 1 : 0),
      hasNextPage: pagination.current_page < pagination.last_page, hasPrevPage: pagination.current_page > 1,
    },
  };
};
export const parseStockOpnameResponse = (payload: unknown): StockOpname =>
  z.object({ success: z.literal(true).optional(), data: stockOpnameSchema }).parse(payload).data as StockOpname;
export const parseCreateStockOpnameResponse = (payload: unknown): StockOpnameCreateResult =>
  z.object({ success: z.literal(true).optional(), data: z.object({ id: z.string() }) }).parse(payload).data;

export type CreateStockOpnameInput = z.infer<typeof createStockOpnameInputSchema>;
export type UpdateStockOpnameInput = z.infer<typeof updateStockOpnameInputSchema>;
export type StockOpnameItemInput = z.infer<typeof stockOpnameItemInputSchema>;
