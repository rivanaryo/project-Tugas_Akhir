import { z } from 'zod';
import type { PaginatedUnits } from '../types/unit.types';

export const unitSchema = z.object({
  id: z.union([z.string(), z.number()]),
  unit_code: z.string().optional(),
  unit_name: z.string().min(1),
  is_active: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const unitsArraySchema = z.array(unitSchema);

export const createUnitInputSchema = z.object({
  unit_code: z.string().optional(),
  unit_name: z
    .string()
    .trim()
    .min(1, 'Unit name is required')
    .max(120, 'Unit name must be at most 120 characters'),
  is_active: z.boolean().default(true),
});

export const updateUnitInputSchema = createUnitInputSchema;

const createdUnitSchema = z.object({
  id: z.union([z.string(), z.number()]),
  unit_code: z.string().optional(),
  unit_name: z.string().min(1),
  is_active: z.boolean().optional().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const createUnitResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: createdUnitSchema,
});

const updateUnitResponseSchema = createUnitResponseSchema;

const unitsPaginationSchema = z.object({
  current_page: z.number(),
  data: unitsArraySchema,
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
  data: unitsPaginationSchema,
});

export const parseUnitsResponse = (payload: unknown): PaginatedUnits => {
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

export const parseCreateUnitResponse = (payload: unknown) => {
  const parsed = createUnitResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error('Failed to parse created unit response');
  }

  return {
    message: parsed.data.message ?? 'Unit berhasil dibuat',
    unit: parsed.data.data,
  };
};

export const parseUpdateUnitResponse = (payload: unknown) => {
  const parsed = updateUnitResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error('Failed to parse updated unit response');
  }

  return {
    message: parsed.data.message ?? 'Unit berhasil diperbarui',
    unit: parsed.data.data,
  };
};

export type UnitSchema = z.infer<typeof unitSchema>;
export type CreateUnitInput = z.infer<typeof createUnitInputSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitInputSchema>;
