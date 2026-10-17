import { z } from 'zod';
import type { PaginatedCategories } from '../types/category.types';

export const categorySchema = z.object({
  id: z.union([z.string(), z.number()]),
  category_name: z.string().min(1),
  is_active: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const categoriesArraySchema = z.array(categorySchema);

export const createCategoryInputSchema = z.object({
  category_name: z
    .string()
    .trim()
    .min(1, 'Category name is required')
    .max(120, 'Category name must be at most 120 characters'),
  is_active: z.boolean().default(true),
});

export const updateCategoryInputSchema = createCategoryInputSchema;

const createdCategorySchema = z.object({
  id: z.union([z.string(), z.number()]),
  category_name: z.string().min(1),
  is_active: z.boolean().optional().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const createCategoryResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: createdCategorySchema,
});

const updateCategoryResponseSchema = createCategoryResponseSchema;

const categoriesPaginationSchema = z.object({
  current_page: z.number(),
  data: categoriesArraySchema,
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
  data: categoriesPaginationSchema,
});

export const parseCategoriesResponse = (payload: unknown): PaginatedCategories => {
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
    items: pagination.data,
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

export const parseCreateCategoryResponse = (payload: unknown) => {
  const parsed = createCategoryResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error('Failed to parse created category response');
  }

  return {
    message: parsed.data.message ?? 'Kategori berhasil dibuat',
    category: parsed.data.data,
  };
};

export const parseUpdateCategoryResponse = (payload: unknown) => {
  const parsed = updateCategoryResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error('Failed to parse updated category response');
  }

  return {
    message: parsed.data.message ?? 'Kategori berhasil diperbarui',
    category: parsed.data.data,
  };
};

export type CategorySchema = z.infer<typeof categorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;
