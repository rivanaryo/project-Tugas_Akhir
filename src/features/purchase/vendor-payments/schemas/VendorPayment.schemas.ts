import { z } from 'zod';
import type {
  VendorPayment,
  VendorPaymentCreateResult,
  PaginatedVendorPayments,
} from '../types/VendorPayment';

export const VendorPaymentSchema = z.object({
    vendor_id: z.string().uuid("Vendor harus dipilih"),
    payment_number : z.string().min(1, "Nomor pembayaran vendor wajib diisi"),
    vendor_invoice_number: z.string().min(1, "Nomor invoice vendor wajib diisi"),
    payment_type: z.enum(["transfer", "cash", "credit"]),
    payment_date: z.string().min(1, "Tanggal pembayaran wajib diisi"),
    total_paid: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Total bayar harus berupa angka lebih dari 0",
    }),
    account_id: z.string().uuid("Akun pembayaran harus dipilih"),
    status: z.enum(["unpaid", "paid", "partial", "cancelled"]),
});

export type VendorPaymentFormValues = z.infer<typeof VendorPaymentSchema>;

// Response Schemas
const vendorRefSchema = z.object({
  id: z.union([z.string(), z.number()]),
  vendor_name: z.string(),
});

const accountRefSchema = z.object({
  id: z.union([z.string(), z.number()]),
  account_name: z.string(),
  account_number: z.string().optional(),
  bank_name: z.string().nullable().optional(),
});

const vendorPaymentSchema = z.object({
  id: z.union([z.string(), z.number()]),
  payment_number: z.string(),
  vendor_id: z.union([z.string(), z.number()]),
  vendor_invoice_number: z.string(),
  payment_type: z.enum(['transfer', 'cash', 'credit']),
  payment_date: z.string(),
  total_paid: z.union([z.string(), z.number()]),
  account_id: z.union([z.string(), z.number()]),
  status: z.enum(['unpaid', 'paid', 'partial', 'cancelled']).default('unpaid'),
  vendor: vendorRefSchema.nullable().optional(),
  account: accountRefSchema.nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const vendorPaymentsArraySchema = z.array(vendorPaymentSchema);

const paginationSchema = z.object({
  current_page: z.number(),
  data: vendorPaymentsArraySchema,
  per_page: z.number(),
  total: z.number(),
  last_page: z.number(),
  from: z.number().nullable().optional(),
  to: z.number().nullable().optional(),
  next_page_url: z.string().nullable().optional(),
  prev_page_url: z.string().nullable().optional(),
});

const paginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: paginationSchema,
});

const nonPaginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: vendorPaymentsArraySchema,
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

export const parseVendorPaymentsResponse = (
  payload: unknown,
  perPageFallback = 15
): PaginatedVendorPayments => {
  const paginatedParsed = paginatedResponseSchema.safeParse(payload);
  if (paginatedParsed.success) {
    const pagination = paginatedParsed.data.data;
    const from = pagination.from ?? (pagination.data.length > 0 ? 1 : 0);
    const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);
    return {
      items: pagination.data as VendorPayment[],
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
    const items = nonPaginatedParsed.data.data as VendorPayment[];
    const from = items.length > 0 ? 1 : 0;
    const to = items.length > 0 ? items.length : 0;
    return {
      items,
      meta: { ...emptyMeta(perPageFallback), total: items.length, from, to },
    };
  }

  const rawArrayParsed = vendorPaymentsArraySchema.safeParse(payload);
  if (rawArrayParsed.success) {
    const items = rawArrayParsed.data as VendorPayment[];
    const from = items.length > 0 ? 1 : 0;
    const to = items.length > 0 ? items.length : 0;
    return {
      items,
      meta: { ...emptyMeta(perPageFallback), total: items.length, from, to },
    };
  }

  return { items: [], meta: emptyMeta(perPageFallback) };
};

export const parseVendorPaymentResponse = (payload: unknown): VendorPayment => {
  const wrapped = z
    .object({
      success: z.boolean().optional(),
      message: z.string().optional(),
      data: vendorPaymentSchema,
    })
    .safeParse(payload);
  if (wrapped.success) return wrapped.data.data as VendorPayment;

  const raw = vendorPaymentSchema.safeParse(payload);
  if (raw.success) return raw.data as VendorPayment;

  throw new Error('Failed to parse vendor payment response');
};

export const parseCreateVendorPaymentResponse = (
  payload: unknown
): VendorPaymentCreateResult => {
  const parsed = z
    .object({
      success: z.boolean().optional(),
      message: z.string().optional(),
      data: vendorPaymentSchema,
    })
    .safeParse(payload);
  if (parsed.success) {
    return {
      data: parsed.data.data as VendorPayment,
      message: parsed.data.message || 'Pembayaran vendor berhasil dibuat',
    };
  }
  throw new Error('Failed to parse vendor payment create response');
};
