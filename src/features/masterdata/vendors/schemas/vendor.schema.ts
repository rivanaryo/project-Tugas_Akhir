import { z } from 'zod';
import type { PaginatedVendors } from '../types/vendor.types';

export const vendorSchema = z.object({
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

export const vendorsArraySchema = z.array(vendorSchema);

export const createVendorInputSchema = z.object({
  vendor_name: z
    .string()
    .trim()
    .min(1, 'Vendor name is required')
    .max(255, 'Vendor name must be at most 255 characters'),
  contact_person: z
    .string()
    .trim()
    .max(255, 'Contact person must be at most 255 characters')
    .optional()
    .or(z.literal('')),
  phone_number: z
    .string()
    .trim()
    .max(20, 'Phone number must be at most 20 characters')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('contoh : example@gmail.com')
    .max(255, 'Email must be at most 255 characters')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .trim()
    .max(500, 'Address must be at most 500 characters')
    .optional()
    .or(z.literal('')),
  is_active: z.boolean().default(true),
}).transform((data) => ({
  ...data,
  contact_person: data.contact_person?.trim() ? data.contact_person.trim() : undefined,
  phone_number: data.phone_number?.trim() ? data.phone_number.trim() : undefined,
  email: data.email?.trim() ? data.email.trim() : undefined,
  address: data.address?.trim() ? data.address.trim() : undefined,
}));

export const updateVendorInputSchema = createVendorInputSchema;

const createVendorResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: vendorSchema,
});

const updateVendorResponseSchema = createVendorResponseSchema;

const vendorsPaginationSchema = z.object({
  current_page: z.number(),
  data: vendorsArraySchema,
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
  data: vendorsPaginationSchema,
});

export const parseVendorsResponse = (payload: unknown): PaginatedVendors => {
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

export const parseCreateVendorResponse = (payload: unknown) => {
  const parsed = createVendorResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error('Failed to parse created vendor response');
  }

  return {
    message: parsed.data.message ?? 'Vendor berhasil dibuat',
    vendor: parsed.data.data,
  };
};

export const parseUpdateVendorResponse = (payload: unknown) => {
  const parsed = updateVendorResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error('Failed to parse updated vendor response');
  }

  return {
    message: parsed.data.message ?? 'Vendor berhasil diperbarui',
    vendor: parsed.data.data,
  };
};

export type CreateVendorInput = z.infer<typeof createVendorInputSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorInputSchema>;
