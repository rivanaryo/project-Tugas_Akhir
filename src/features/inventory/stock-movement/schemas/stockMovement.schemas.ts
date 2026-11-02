import { z } from 'zod';
import type { PaginatedStockMovements, StockMovement, StockMovementCreateResult } from '../types/stockMovement.types';

export const stockMovementTypeSchema = z.enum(['in', 'out']);

const documentTypes = ['Purchase Order', 'Sales Order', 'Good Receipt', 'Finished Goods Receipt', 'Sales Delivery', 'Stock Opname', 'Unknown'] as const;
export const referenceableTypeSchema = z.string().nullish().transform((value) => {
  const model = value?.split('\\').pop();
  const labels: Record<string, typeof documentTypes[number]> = {
    PurchaseOrder: 'Purchase Order', SalesOrder: 'Sales Order', GoodReceipt: 'Good Receipt',
    SalesDelivery: 'Sales Delivery', StockOpname: 'Stock Opname', FinishedGoodsReceipt: 'Finished Goods Receipt',
  };
  return documentTypes.find((label) => label === value) ?? labels[model ?? ''] ?? null;
});

export const createStockMovementInputSchema = z.object({
  m_products_id: z.string().uuid('Product wajib dipilih'),
  m_warehouses_id: z.string().uuid('Warehouse wajib dipilih'),
  type: stockMovementTypeSchema,
  quantity: z.number().int().min(1, 'Quantity minimal 1'),
  reference_number: z.string().trim().min(1, 'Reference Number wajib diisi').max(50, 'Nomor maksimal 50 karakter'),
  referenceable_id: z.string().uuid('Referensi wajib dipilih'),
  referenceable_type: z.literal('Stock Opname', { error: 'Referensi wajib dipilih' }),
  description: z.string().trim().max(255, 'Deskripsi maksimal 255 karakter').optional(),
});

export const updateStockMovementInputSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity minimal 1').optional(),
  description: z.string().trim().max(255, 'Deskripsi maksimal 255 karakter').optional(),
});

const nullableNumberSchema = z.union([
  z.number(),
  z.string().trim().min(1).transform(Number),
]).nullish().transform((value) => (value === null || value === undefined || Number.isNaN(value) ? undefined : value));

const productUnitSchema = z.union([
  z.string(),
  z.object({ unit_code: z.string().nullish(), unit_name: z.string().nullish() }),
]).nullish().transform((value) => typeof value === 'string' ? value : value?.unit_code || value?.unit_name || undefined);

const productRefSchema = z.object({
  id: z.string(), name: z.string().optional(), product_name: z.string().optional(), unit: productUnitSchema,
}).passthrough();
const warehouseRefSchema = z.object({
  id: z.string(), name: z.string().optional(), warehouse_name: z.string().optional(), code: z.string().optional(),
}).passthrough();
export const stockMovementSchema = z.object({
  id: z.string(),
  m_products_id: z.string().nullish(),
  m_warehouses_id: z.string().nullish(),
  type: z.string().transform((value) => value.trim().toLowerCase()).pipe(stockMovementTypeSchema),
  quantity: z.union([z.number(), z.string().trim().min(1)]).transform(Number).pipe(z.number().finite()),
  stock_before: nullableNumberSchema,
  stock_after: nullableNumberSchema,
  reference_number: z.string().nullish().transform((value) => value ?? '-'),
  referenceable_id: z.string().nullable().optional(),
  referenceable_type: referenceableTypeSchema,
  document_type: referenceableTypeSchema,
  description: z.string().nullable().optional(),
  product_name: z.string().nullish(),
  warehouse_name: z.string().nullish(),
  product: productRefSchema.nullable().optional(),
  warehouse: warehouseRefSchema.nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}).passthrough();

const paginationSchema = z.object({
  current_page: z.number(), per_page: z.number(), last_page: z.number(), total: z.number(),
  from: z.number().nullable().optional(), to: z.number().nullable().optional(),
  data: z.array(stockMovementSchema),
});

export const parseStockMovementsResponse = (payload: unknown): PaginatedStockMovements => {
  const { data } = z.object({ success: z.literal(true).optional(), data: paginationSchema }).parse(payload);
  const from = data.from ?? (data.data.length ? (data.current_page - 1) * data.per_page + 1 : 0);
  return {
    items: data.data as StockMovement[],
    meta: {
      currentPage: data.current_page, perPage: data.per_page, lastPage: data.last_page, total: data.total,
      from, to: data.to ?? (data.data.length ? from + data.data.length - 1 : 0),
      hasNextPage: data.current_page < data.last_page, hasPrevPage: data.current_page > 1,
    },
  };
};

export const parseStockMovementResponse = (payload: unknown): StockMovement =>
  z.object({ success: z.literal(true).optional(), data: stockMovementSchema }).parse(payload).data as StockMovement;

export const parseCreateStockMovementResponse = (payload: unknown): StockMovementCreateResult =>
  z.object({ success: z.literal(true).optional(), data: z.object({ id: z.string() }) }).parse(payload).data;

export type CreateStockMovementInput = z.infer<typeof createStockMovementInputSchema>;
export type UpdateStockMovementInput = z.infer<typeof updateStockMovementInputSchema>;
