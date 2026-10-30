import { z } from 'zod';

export const quotationStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired', 'cancelled'] as const;
const amount = z.coerce.number().finite();
const reference = z.object({ id: z.string(), customer_name: z.string().optional(), product_name: z.string().optional() });

export const quotationItemInputSchema = z.object({
  product_id: z.string().uuid('Pilih produk yang valid'),
  size: z.string().trim().min(1, 'Ukuran wajib dipilih sesuai produk'),
  quantity: z.coerce.number().int().min(1),
  unit_price: amount.min(0),
  tax_rate: amount.min(0).max(100),
});
export const quotationHeadInputSchema = z.object({
  quotation_number: z.string().trim().min(1, 'Nomor quotation wajib diisi'),
  customer_id: z.string().min(1, 'Pilih customer'),
  quotation_date: z.string().min(1, 'Tanggal quotation wajib diisi'),
  valid_until: z.string(),
  status: z.enum(quotationStatuses),
  notes: z.string(),
}).refine((value) => !value.valid_until || value.valid_until >= value.quotation_date, {
  message: 'Berlaku sampai tidak boleh sebelum tanggal quotation', path: ['valid_until'],
});
export const quotationItemSchema = quotationItemInputSchema.extend({
  id: z.string(),
  sales_quotation_id: z.string(),
  product: reference.nullish(),
  tax_rate: amount.nullish(),
  tax_amount: amount,
  total_price: amount,
});
export const quotationSchema = z.object({
  id: z.string(),
  quotation_number: z.string(),
  customer_id: z.string(),
  customer: reference.nullish(),
  quotation_date: z.string().nullish(),
  valid_until: z.string().nullish(),
  status: z.enum(quotationStatuses),
  notes: z.string().nullish(),
  subtotal: amount,
  total_tax: amount,
  grand_total: amount,
  items: z.array(quotationItemSchema).optional(),
});
export const quotationListSchema = z.object({
  current_page: z.number(),
  data: z.array(quotationSchema),
  total: z.number(),
});
export type Quotation = z.infer<typeof quotationSchema>;
export type QuotationItem = z.infer<typeof quotationItemSchema>;
export type QuotationHeadInput = z.infer<typeof quotationHeadInputSchema>;
export type QuotationItemInput = z.infer<typeof quotationItemInputSchema>;
export interface QuotationFilters {
  q: string;
  status: string;
  customer_id: string;
  quotation_date_from: string;
  quotation_date_to: string;
}
