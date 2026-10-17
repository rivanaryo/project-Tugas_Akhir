import { z } from 'zod';
import type { PaginatedPricelists, Pricelist } from '../types/pricelist.types';

const pricelistVendorSchema = z.object({
  id: z.union([z.string(), z.number()]),
  vendor_name: z.string(),
  contact_person: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const pricelistProductSchema = z.object({
  id: z.union([z.string(), z.number()]),
  product_name: z.string(),
  category_id: z.union([z.string(), z.number()]).optional(),
  unit_id: z.union([z.string(), z.number()]).optional(),
  is_active: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const pricelistSchema = z.object({
  id: z.union([z.string(), z.number()]),
  vendor_id: z.union([z.string(), z.number()]),
  product_id: z.union([z.string(), z.number()]),
  price: z.union([z.string(), z.number()]).transform((value) => String(value)),
  currency: z.string(),
  is_active: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  vendor: pricelistVendorSchema.optional(),
  product: pricelistProductSchema.optional(),
});

const pricelistsArraySchema = z.array(pricelistSchema);

export const createPricelistInputSchema = z.object({
  vendor_id: z.string().trim().min(1, 'Vendor wajib dipilih'),
  product_id: z.string().trim().min(1, 'Produk wajib dipilih'),
  price: z
    .string()
    .trim()
    .min(1, 'Harga wajib diisi')
    .refine((value) => {
      const normalized = value.replaceAll(',', '.');
      const numberValue = Number(normalized);
      return Number.isFinite(numberValue) && numberValue >= 0;
    }, 'Harga harus berupa angka'),
  currency: z.string().trim().min(1, 'Mata uang wajib diisi').max(10, 'Mata uang maksimal 10 karakter'),
  is_active: z.boolean().default(true),
});

export const updatePricelistInputSchema = createPricelistInputSchema;

const paginationSchema = z.object({
  current_page: z.number(),
  data: pricelistsArraySchema,
  per_page: z.number().default(15),
  total: z.number(),
  last_page: z.number().default(1),
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

const createPricelistResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: pricelistSchema,
});

const nonPaginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: pricelistsArraySchema,
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

export const parsePricelistsResponse = (payload: unknown, perPageFallback = 15): PaginatedPricelists => {
  const paginatedParsed = paginatedResponseSchema.safeParse(payload);
  if (paginatedParsed.success) {
    const pagination = paginatedParsed.data.data;
    const from = pagination.from ?? (pagination.data.length > 0 ? 1 : 0);
    const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);

    return {
      items: pagination.data as Pricelist[],
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
    const items = nonPaginatedParsed.data.data as Pricelist[];
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

  const rawArrayParsed = pricelistsArraySchema.safeParse(payload);
  if (rawArrayParsed.success) {
    const items = rawArrayParsed.data as Pricelist[];
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

export const parseCreatePricelistResponse = (payload: unknown) => {
  const parsed = createPricelistResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error('Failed to parse created pricelist response');
  }

  return {
    message: parsed.data.message ?? 'Pricelist berhasil dibuat',
    pricelist: parsed.data.data as Pricelist,
  };
};

export type CreatePricelistInput = z.infer<typeof createPricelistInputSchema>;
export type UpdatePricelistInput = z.infer<typeof updatePricelistInputSchema>;
