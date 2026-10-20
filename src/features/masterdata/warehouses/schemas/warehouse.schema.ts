import { z } from 'zod';
import type { PaginatedWarehouses, Warehouse } from '../types/warehouse.types';

export const warehouseSchema = z.object({
  id: z.union([z.string(), z.number()]),
  code: z.string().min(1),
  name: z.string().min(1),
  location: z.string().min(1).nullable().transform((value) => value ?? ''),
  is_active: z.union([z.boolean(), z.literal(0), z.literal(1)]).transform((value) => value === true || value === 1),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const warehousesArraySchema = z.array(warehouseSchema);

export const createWarehouseInputSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Warehouse code is required')
    .max(50, 'Warehouse code must be at most 50 characters'),
  name: z
    .string()
    .trim()
    .min(1, 'Warehouse name is required')
    .max(120, 'Warehouse name must be at most 120 characters'),
  location: z
    .string()
    .trim()
    .min(1, 'Location is required')
    .max(120, 'Location must be at most 120 characters'),
  is_active: z.boolean().default(true),
});

export const updateWarehouseInputSchema = createWarehouseInputSchema;

const createdWarehouseSchema = z.object({
  id: z.union([z.string(), z.number()]),
  code: z.string().min(1),
  name: z.string().min(1),
  location: z.string().min(1).nullable().transform((value) => value ?? ''),
  is_active: z.union([z.boolean(), z.literal(0), z.literal(1)]).transform((value) => value === true || value === 1),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const createWarehouseResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: createdWarehouseSchema,
});

const updateWarehouseResponseSchema = createWarehouseResponseSchema;

const warehousesPaginationSchema = z.object({
  current_page: z.number(),
  data: warehousesArraySchema,
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
  data: warehousesPaginationSchema,
});

export const parseWarehousesResponse = (payload: unknown): PaginatedWarehouses => {
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
    items: pagination.data as Warehouse[],
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

export const parseCreateWarehouseResponse = (payload: unknown) => {
  const parsed = createWarehouseResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error('Failed to parse created warehouse response');
  }

  return {
    message: parsed.data.message ?? 'Gudang berhasil dibuat',
    warehouse: parsed.data.data,
  };
};

export const parseUpdateWarehouseResponse = (payload: unknown) => {
  const parsed = updateWarehouseResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error('Failed to parse updated warehouse response');
  }

  return {
    message: parsed.data.message ?? 'Gudang berhasil diperbarui',
    warehouse: parsed.data.data,
  };
};

// Type exports from schemas
export type WarehouseSchema = z.infer<typeof warehouseSchema>;
export type CreateWarehouseInput = z.infer<typeof createWarehouseInputSchema>;
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseInputSchema>;
