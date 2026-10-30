import { z } from 'zod';
import { stockMovementSchema } from '../../inventory/stock-movement/schemas/stockMovement.schemas';

export const receiptStatuses = ['draft', 'received', 'cancelled'] as const;
const quantity = z.union([z.number(), z.string().trim().min(1)]).transform(Number).pipe(z.number().finite().int().min(0));
export const finishedGoodsReceiptInputSchema = z.object({
  fgr_number: z.string().trim().min(1, 'Nomor FGR wajib diisi'),
  warehouse_id: z.string().uuid('Pilih gudang'),
  receipt_date: z.iso.date('Tanggal penerimaan tidak valid'),
  status: z.enum(receiptStatuses),
  notes: z.string().optional(),
  items: z.array(z.object({
    work_order_id: z.string().uuid('Pilih SPK'),
    qty_good: quantity,
    qty_reject: quantity.default(0),
  })).min(1, 'Tambahkan minimal satu item SPK'),
});
const productSchema = z.object({ id: z.string(), product_name: z.string() });
const workOrderSchema = z.object({ id: z.string(), wo_number: z.string() });
const receiptItemSchema = z.object({
  id: z.string(),
  work_order_id: z.string(),
  product_id: z.string(),
  size: z.string().nullish(),
  qty_good: quantity,
  qty_reject: quantity.nullish().transform((value) => value ?? 0),
  product: productSchema.nullish(),
  work_order: workOrderSchema.nullish(),
  workOrder: workOrderSchema.nullish(),
});
export const finishedGoodsReceiptSchema = z.object({
  id: z.string(),
  fgr_number: z.string(),
  warehouse_id: z.string(),
  receipt_date: z.string(),
  status: z.enum(receiptStatuses),
  notes: z.string().nullish(),
  warehouse: z.object({ id: z.string(), name: z.string(), code: z.string().optional() }).nullish(),
  items: z.array(receiptItemSchema).optional(),
  stock_movements: z.array(stockMovementSchema).nullish(),
  stockMovements: z.array(stockMovementSchema).nullish(),
});
export const receiptListSchema = z.object({
  current_page: z.number().int().positive(),
  per_page: z.number().int().positive().optional(),
  last_page: z.number().int().positive().optional(),
  total: z.number().int().nonnegative(),
  data: z.array(finishedGoodsReceiptSchema),
});
export type FinishedGoodsReceipt = z.infer<typeof finishedGoodsReceiptSchema>;
export type FinishedGoodsReceiptInput = z.infer<typeof finishedGoodsReceiptInputSchema>;
export type ReceiptStatus = typeof receiptStatuses[number];
export interface ReceiptFilters {
  q: string;
  status: string;
  warehouse_id: string;
  work_order_id: string;
  date_from: string;
  date_to: string;
}
