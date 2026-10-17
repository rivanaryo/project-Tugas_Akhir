import { z } from 'zod';
import type { PaginatedCustomers } from '../types/customer.types';

export const customerSchema = z.object({
  id: z.union([z.string(), z.number()]),
  customer_name: z.string(),
  contact_person: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const customersArraySchema = z.array(customerSchema);

export const createCustomerInputSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(1, 'Nama customer wajib diisi')
    .max(255, 'Nama customer maksimal 255 karakter'),
  contact_person: z
    .string()
    .trim()
    .max(255, 'Nama kontak maksimal 255 karakter')
    .optional()
    .or(z.literal('')),
  phone_number: z
    .string()
    .trim()
    .max(20, 'Nomor telepon maksimal 20 karakter')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('contoh : example@gmail.com')
    .max(255, 'Email maksimal 255 karakter')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .trim()
    .max(500, 'Alamat maksimal 500 karakter')
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

export const updateCustomerInputSchema = createCustomerInputSchema;

const createCustomerResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: customerSchema,
});

const updateCustomerResponseSchema = createCustomerResponseSchema;

const customersPaginationSchema = z.object({
  current_page: z.number(),
  data: customersArraySchema,
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
  data: customersPaginationSchema,
});

export const parseCustomersResponse = (payload: unknown): PaginatedCustomers => {
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

export const parseCreateCustomerResponse = (payload: unknown) => {
  const parsed = createCustomerResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error('Failed to parse created customer response');
  }

  return {
    message: parsed.data.message ?? 'Customer berhasil dibuat',
    customer: parsed.data.data,
  };
};

export const parseUpdateCustomerResponse = (payload: unknown) => {
  const parsed = updateCustomerResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error('Failed to parse updated customer response');
  }

  return {
    message: parsed.data.message ?? 'Customer berhasil diperbarui',
    customer: parsed.data.data,
  };
};

export type CreateCustomerInput = z.infer<typeof createCustomerInputSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerInputSchema>;
