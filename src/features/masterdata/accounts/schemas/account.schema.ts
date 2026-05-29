import { z } from 'zod';
import type { PaginatedAccounts } from '../types/account.types';

export const accountSchema = z.object({
  id: z.union([z.string(), z.number()]),
  account_name: z.string(),
  account_number: z.string(),
  bank_name: z.string().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const accountsArraySchema = z.array(accountSchema);

export const createAccountInputSchema = z.object({
  account_name: z
    .string()
    .trim()
    .min(1, 'Nama akun wajib diisi')
    .max(255, 'Nama akun maksimal 255 karakter'),
  account_number: z
    .string()
    .trim()
    .min(1, 'Nomor akun wajib diisi')
    .max(50, 'Nomor akun maksimal 50 karakter'),
  bank_name: z
    .string()
    .trim()
    .max(255, 'Nama bank maksimal 255 karakter')
    .optional()
    .or(z.literal('')),
  is_active: z.boolean().default(true),
}).transform((data) => ({
  ...data,
  bank_name: data.bank_name?.trim() ? data.bank_name.trim() : undefined,
}));

export const updateAccountInputSchema = createAccountInputSchema;

const createAccountResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: accountSchema,
});

const updateAccountResponseSchema = createAccountResponseSchema;

const accountsPaginationSchema = z.object({
  current_page: z.number(),
  data: accountsArraySchema,
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
  data: accountsPaginationSchema,
});

export const parseAccountsResponse = (payload: unknown): PaginatedAccounts => {
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

export const parseCreateAccountResponse = (payload: unknown) => {
  const parsed = createAccountResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error('Failed to parse created account response');
  }

  return {
    message: parsed.data.message ?? 'Account berhasil dibuat',
    account: parsed.data.data,
  };
};

export const parseUpdateAccountResponse = (payload: unknown) => {
  const parsed = updateAccountResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error('Failed to parse updated account response');
  }

  return {
    message: parsed.data.message ?? 'Account berhasil diperbarui',
    account: parsed.data.data,
  };
};

export type CreateAccountInput = z.infer<typeof createAccountInputSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountInputSchema>;
