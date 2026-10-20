import { z } from 'zod';
import type { PaginatedProducts, Product } from '../types/product.types';

export const productSchema = z.object({
  id: z.union([z.string(), z.number()]),
  product_name: z.string().min(1),
  category_id: z.union([z.string(), z.number()]).optional(),
  unit_id: z.union([z.string(), z.number()]).optional(),
  category: z
    .object({
      id: z.union([z.string(), z.number()]),
      category_name: z.string().min(1),
    })
    .optional(),
  unit: z
    .object({
      id: z.union([z.string(), z.number()]),
      unit_code: z.string().optional(),
      unit_name: z.string().min(1),
    })
    .optional(),
  is_active: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const productsArraySchema = z.array(productSchema);

export const createProductInputSchema = z.object({
  product_name: z
    .string()
    .trim()
    .min(1, 'Product name is required')
    .max(120, 'Product name must be at most 120 characters'),
  is_active: z.boolean().default(true),
});

export const updateProductInputSchema = createProductInputSchema;

const createdProductSchema = z.object({
  id: z.union([z.string(), z.number()]),
  product_name: z.string().min(1),
  category_id: z.union([z.string(), z.number()]).optional(),
  unit_id: z.union([z.string(), z.number()]).optional(),
  category: z
    .object({
      id: z.union([z.string(), z.number()]),
      category_name: z.string().min(1),
    })
    .optional(),
  unit: z
    .object({
      id: z.union([z.string(), z.number()]),
      unit_code: z.string().optional(),
      unit_name: z.string().min(1),
    })
    .optional(),
  is_active: z.boolean().optional().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const createProductResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: createdProductSchema,
});

const updateProductResponseSchema = createProductResponseSchema;

const productsPaginationSchema = z.object({
  current_page: z.number(),
  data: productsArraySchema,
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
  data: productsPaginationSchema,
});

export const parseProductsResponse = (payload: unknown): PaginatedProducts => {
  const parsed = paginatedResponseSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      items: [],
      meta: {
        currentPage: 1,
        lastPage: 1,
        perPage: 15,
        total: 0,
        from: 0,
        to: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  const pagination = parsed.data.data;
  const from = pagination.from ?? (pagination.data.length > 0 ? 1 : 0);
  const to = pagination.to ?? (pagination.data.length > 0 ? from + pagination.data.length - 1 : 0);

  return {
    items: pagination.data as Product[],
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
};

export const parseCreateProductResponse = (payload: unknown) => {
  const parsed = createProductResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error('Failed to parse created product response');
  }

  return {
    message: parsed.data.message ?? 'Produk berhasil dibuat',
    product: parsed.data.data,
  };
};

export const parseUpdateProductResponse = (payload: unknown) => {
  const parsed = updateProductResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error('Failed to parse updated product response');
  }

  return {
    message: parsed.data.message ?? 'Produk berhasil diperbarui',
    product: parsed.data.data,
  };
};

// Type exports from schemas
export type ProductSchema = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductInputSchema>;
export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;
